import logging
from typing import Any, Optional

from PIL import Image

try:
    import pytesseract
except ImportError:  # pragma: no cover - optional dependency at runtime
    pytesseract = None  # type: ignore

try:
    import easyocr  # type: ignore
except ImportError:  # pragma: no cover - optional dependency at runtime
    easyocr = None  # type: ignore


try:
    from google import genai
except ImportError:
    genai = None

from ML.feature3_student_knowledge_tracking.config import settings

logger = logging.getLogger(__name__)


class ImageInputHandler:
    """
    Handle image inputs and perform OCR to extract text.

    Supports Gemini Vision (default), pytesseract and EasyOCR.
    """

    def __init__(self, engine: str = "gemini", easyocr_langs: Optional[list[str]] = None):
        self.engine = engine
        self.easyocr_langs = easyocr_langs or ["en"]
        self._easyocr_reader = None
        self.gemini_api_key = settings.GEMINI_API_KEY
        
        if self.engine == "gemini" and self.gemini_api_key:
            if genai:
                try:
                    self.client = genai.Client(api_key=self.gemini_api_key)
                    self.model_name = "gemini-flash-latest"
                except Exception as e:
                    logger.error(f"Error initializing Gemini client: {e}")
                    self.client = None
            else:
                logger.warning("google-genai not installed, gemini engine will fail.")
        else:
            self.client = None

    def _load_easyocr_reader(self):
        if easyocr is None:
            raise RuntimeError("easyocr is not installed. Please install it to use EasyOCR engine.")
        if self._easyocr_reader is None:
            self._easyocr_reader = easyocr.Reader(self.easyocr_langs)

    def extract_text(self, image_path: str) -> str:
        """
        Extract text from an image file.

        Raises:
            ValueError: If image path is invalid or OCR fails to extract text.
        """
        if not isinstance(image_path, str):
            raise TypeError("image_path must be a string.")

        try:
            if self.engine == "easyocr":
                text = self._extract_with_easyocr(image_path)
            elif self.engine == "gemini":
                text = self._extract_with_gemini(image_path)
            else:
                text = self._extract_with_pytesseract(image_path)
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.exception("OCR extraction failed with engine %s: %s", self.engine, exc)
            if self.engine == "gemini":
                logger.info("Falling back to pytesseract...")
                try:
                    text = self._extract_with_pytesseract(image_path)
                except Exception:
                    raise exc
            else:
                raise

        cleaned = (text or "").strip()
        if not cleaned:
            logger.error("OCR returned empty text for image: %s", image_path)
            raise ValueError("OCR did not return any text.")

        logger.debug("Extracted text of length %d from image %s", len(cleaned), image_path)
        return cleaned

    def _extract_with_pytesseract(self, image_path: str) -> str:
        if pytesseract is None:
            raise RuntimeError("pytesseract is not installed. Please install it to use pytesseract engine.")

        with Image.open(image_path) as img:
            return pytesseract.image_to_string(img)

    def _extract_with_easyocr(self, image_path: str) -> str:
        self._load_easyocr_reader()
        assert self._easyocr_reader is not None
        results = self._easyocr_reader.readtext(image_path, detail=0)
        return "\n".join(results)

    def _extract_with_gemini(self, image_path: str) -> str:
        """Extract text from an image using the modern Gemini SDK."""
        if not genai or not self.client:
            raise RuntimeError("Gemini client not configured or google-genai not installed.")
        
        try:
            # Open and use image with context manager
            with Image.open(image_path) as img:
                # Prompt for OCR
                prompt = "Extract all text from this image exactly as it appears. Provide ONLY the extracted text, no explanations."
                
                # New SDK uses PIL images directly if they are small enough, 
                # but let's follow the standard pattern.
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=[prompt, img]
                )
                
                if response and response.text:
                    return response.text.strip()
                else:
                    raise ValueError("Empty response from Gemini Vision.")
            
        except Exception as e:
            logger.error(f"Gemini Vision OCR failed: {e}")
            raise RuntimeError(f"Gemini Vision OCR failed: {e}")


def is_image_input(input_data: Any) -> bool:
    return isinstance(input_data, str) and input_data.lower().endswith((".png", ".jpg", ".jpeg"))


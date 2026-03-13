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


logger = logging.getLogger(__name__)


class ImageInputHandler:
    """
    Handle image inputs and perform OCR to extract text.

    Supports both pytesseract and EasyOCR. Preferred engine can be configured.
    """

    def __init__(self, engine: str = "pytesseract", easyocr_langs: Optional[list[str]] = None):
        self.engine = engine
        self.easyocr_langs = easyocr_langs or ["en"]
        self._easyocr_reader = None

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
            else:
                text = self._extract_with_pytesseract(image_path)
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.exception("OCR extraction failed: %s", exc)
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

        img = Image.open(image_path)
        return pytesseract.image_to_string(img)

    def _extract_with_easyocr(self, image_path: str) -> str:
        self._load_easyocr_reader()
        assert self._easyocr_reader is not None
        results = self._easyocr_reader.readtext(image_path, detail=0)
        return "\n".join(results)


def is_image_input(input_data: Any) -> bool:
    return isinstance(input_data, str) and input_data.lower().endswith((".png", ".jpg", ".jpeg"))


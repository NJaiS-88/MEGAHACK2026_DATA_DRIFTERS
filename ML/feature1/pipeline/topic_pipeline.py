import logging
from typing import Any, Dict, Tuple

from ML.feature1.config.config import get_settings
from ML.feature1.extraction.text_cleaner import clean_text, split_into_sentences, chunk_text
from ML.feature1.extraction.topic_extractor import TopicExtractor
from ML.feature1.input_processing.text_input_handler import TextInputHandler, is_text_input
from ML.feature1.input_processing.image_input_handler import ImageInputHandler, is_image_input


logger = logging.getLogger(__name__)


class TopicPipeline:
    """
    End-to-end pipeline to generate topic hierarchy from various input types.
    """

    def __init__(self):
        self.settings = get_settings()
        self.text_handler = TextInputHandler()
        self.image_handler = ImageInputHandler(
            engine=self.settings.ocr_engine,
            easyocr_langs=self.settings.easyocr_lang_list,
        )
        self.topic_extractor = TopicExtractor(self.settings)

    def detect_input_type(self, input_data: Any) -> str:
        if is_image_input(input_data):
            return "image"
        if is_text_input(input_data):
            return "text"
        # If it's a string that looks like an unsupported file type, fail fast
        if isinstance(input_data, str):
            lower = input_data.lower()
            if lower.endswith((".pdf", ".docx", ".txt")):
                raise ValueError(
                    "Document files are not supported. Please paste text or upload an image (PNG/JPG/JPEG)."
                )
            # Default: treat unknown strings as text (e.g., topic names)
            return "text"
        raise ValueError("Unsupported input type; expected text or file path string.")

    def extract_raw_text(self, input_data: Any) -> Tuple[str, str]:
        """
        Returns (raw_text, input_type).
        """
        input_type = self.detect_input_type(input_data)
        logger.info("Detected input type: %s", input_type)

        if input_type == "text":
            text = self.text_handler.extract_text(input_data)
        elif input_type == "image":
            text = self.image_handler.extract_text(input_data)
        else:  # pragma: no cover - defensive
            raise ValueError(f"Unknown input type: {input_type}")
        return text, input_type

    def process(self, input_data: Any) -> Dict[str, Any]:
        """
        Main entry point for generating topic hierarchy.
        """
        raw_text, _ = self.extract_raw_text(input_data)

        cleaned = clean_text(raw_text)
        sentences = split_into_sentences(cleaned)
        chunks = chunk_text(sentences, max_chars=self.settings.max_chars_per_chunk)
        hierarchy = self.topic_extractor.extract_topics_from_chunks(chunks)
        return hierarchy


def generate_topic_hierarchy(input_data: Any) -> Dict[str, Any]:
    """
    Convenience function as required by specification.
    Accepts text, image path, or document path and returns nested JSON hierarchy.
    """
    pipeline = TopicPipeline()
    return pipeline.process(input_data)


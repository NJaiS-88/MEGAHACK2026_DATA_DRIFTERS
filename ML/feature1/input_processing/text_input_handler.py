import logging
from typing import Any


logger = logging.getLogger(__name__)


class TextInputHandler:
    """Handle raw text input."""

    def extract_text(self, input_data: Any) -> str:
        """
        Accepts any object that can be cast to string and returns it as text.

        Raises:
            ValueError: If the resulting text is empty.
        """
        text = str(input_data or "").strip()
        if not text:
            logger.error("Empty text input provided.")
            raise ValueError("Input text is empty.")
        logger.debug("Extracted text of length %d from raw text input.", len(text))
        return text


def is_text_input(input_data: Any) -> bool:
    """Determine if the input should be treated as text."""
    return isinstance(input_data, str) and not any(
        input_data.lower().endswith(ext)
        # Keep ".pdf" here so a PDF file path is not accidentally treated as raw text.
        for ext in (".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg")
    )


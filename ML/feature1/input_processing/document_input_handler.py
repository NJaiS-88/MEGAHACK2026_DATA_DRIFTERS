import logging
from typing import Any

from docx import Document


logger = logging.getLogger(__name__)


class DocumentInputHandler:
    """Handle document inputs: DOCX, TXT.

    Note: PDF input is intentionally not supported.
    """

    SUPPORTED_EXTENSIONS = (".docx", ".txt")

    def extract_text(self, file_path: str) -> str:
        if not isinstance(file_path, str):
            raise TypeError("file_path must be a string.")

        lower = file_path.lower()
        if lower.endswith(".docx"):
            text = self._extract_docx(file_path)
        elif lower.endswith(".txt"):
            text = self._extract_txt(file_path)
        else:
            raise ValueError(f"Unsupported document type for file: {file_path}")

        cleaned = (text or "").strip()
        if not cleaned:
            logger.error("No text extracted from document: %s", file_path)
            raise ValueError("Document did not contain extractable text.")

        logger.debug("Extracted text of length %d from document %s", len(cleaned), file_path)
        return cleaned

    def _extract_docx(self, file_path: str) -> str:
        doc = Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs)

    def _extract_txt(self, file_path: str) -> str:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()


def is_document_input(input_data: Any) -> bool:
    return isinstance(input_data, str) and input_data.lower().endswith(DocumentInputHandler.SUPPORTED_EXTENSIONS)


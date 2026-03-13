import logging
import re
from typing import Iterable, List

import unicodedata

try:
    import spacy  # type: ignore
except ImportError:  # pragma: no cover - optional
    spacy = None  # type: ignore

try:
    import nltk  # type: ignore
    from nltk.tokenize import sent_tokenize  # type: ignore
except ImportError:  # pragma: no cover - optional
    nltk = None  # type: ignore
    sent_tokenize = None  # type: ignore


logger = logging.getLogger(__name__)


def normalize_text(text: str) -> str:
    # Normalize unicode
    text = unicodedata.normalize("NFKC", text)
    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def remove_page_artifacts(text: str) -> str:
    # Remove standalone page numbers (e.g., '12' on a line)
    text = re.sub(r"\n\d+\s*\n", "\n", text)
    # Heuristic: remove common header/footer patterns like "Chapter X", "Page Y of Z"
    text = re.sub(r"Page \d+ of \d+", "", text, flags=re.IGNORECASE)
    return text


def clean_text(raw_text: str) -> str:
    if not raw_text or not raw_text.strip():
        raise ValueError("Raw text is empty.")

    text = remove_page_artifacts(raw_text)
    text = normalize_text(text)
    logger.debug("Cleaned text length: %d", len(text))
    return text


def _split_sentences_spacy(text: str) -> List[str]:
    assert spacy is not None
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:  # pragma: no cover - runtime dependency
        logger.warning("spaCy model 'en_core_web_sm' not available; falling back to regex splitting.")
        return _split_sentences_fallback(text)
    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents if sent.text.strip()]


def _split_sentences_nltk(text: str) -> List[str]:
    assert nltk is not None and sent_tokenize is not None
    try:
        # Ensure punkt is available
        nltk.data.find("tokenizers/punkt")
    except LookupError:  # pragma: no cover - runtime download path
        nltk.download("punkt")
    return [s.strip() for s in sent_tokenize(text) if s.strip()]


def _split_sentences_fallback(text: str) -> List[str]:
    # Simple heuristic sentence splitter
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if p.strip()]


def split_into_sentences(text: str) -> List[str]:
    if spacy is not None:
        return _split_sentences_spacy(text)
    if nltk is not None and sent_tokenize is not None:
        return _split_sentences_nltk(text)
    return _split_sentences_fallback(text)


def chunk_text(sentences: Iterable[str], max_chars: int = 8000) -> List[str]:
    """
    Chunk sentences into pieces of approximately max_chars length.
    This helps keep prompts within model limits and performance targets.
    """
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0

    for sent in sentences:
        if not sent:
            continue
        if current_len + len(sent) + 1 > max_chars and current:
            chunks.append(" ".join(current))
            current = [sent]
            current_len = len(sent)
        else:
            current.append(sent)
            current_len += len(sent) + 1

    if current:
        chunks.append(" ".join(current))

    logger.debug("Split text into %d chunks.", len(chunks))
    return chunks


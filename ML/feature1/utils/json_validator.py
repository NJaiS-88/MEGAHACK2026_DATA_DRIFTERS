import json
import logging
import re
from typing import Any, Dict, Tuple


logger = logging.getLogger(__name__)


def _strip_markdown_wrappers(text: str) -> str:
    # Remove ```json ... ``` or ``` ... ``` fences
    text = re.sub(r"^```json\s*", "", text.strip(), flags=re.IGNORECASE | re.MULTILINE)
    text = re.sub(r"^```\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
    return text.strip()


def try_parse_json(raw: str) -> Tuple[bool, Any]:
    """
    Try to parse JSON, attempting to clean minor issues.
    Returns (success, parsed_or_error).
    """
    cleaned = _strip_markdown_wrappers(raw)
    try:
        return True, json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.warning("Initial JSON parsing failed: %s", exc)
        # Attempt a very conservative fix: remove trailing commas
        tmp = re.sub(r",\s*([}\]])", r"\1", cleaned)
        try:
            return True, json.loads(tmp)
        except Exception as exc2:
            logger.error("JSON parsing failed after cleanup: %s", exc2)
            return False, exc2


def validate_topic_hierarchy(obj: Any) -> Dict[str, Any]:
    """
    Validate that the object has the expected structure:
    { "Main Topic": { "Subtopic": ["Concept", ...], ... }, ... }
    """
    if not isinstance(obj, dict):
        raise ValueError("Root of topic hierarchy must be a JSON object.")

    for main_topic, subtopics in obj.items():
        if not isinstance(main_topic, str):
            raise ValueError("Main topic keys must be strings.")
        if not isinstance(subtopics, dict):
            raise ValueError(f"Subtopics for '{main_topic}' must be an object.")
        for subtopic, concepts in subtopics.items():
            if not isinstance(subtopic, str):
                raise ValueError("Subtopic keys must be strings.")
            if not isinstance(concepts, list):
                raise ValueError(f"Concepts under '{subtopic}' must be a list.")
            for c in concepts:
                if not isinstance(c, str):
                    raise ValueError(f"Concepts must be strings. Invalid value under '{subtopic}'.")

    return obj


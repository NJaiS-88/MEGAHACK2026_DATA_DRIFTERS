import logging
from typing import Any, Dict, List

from ML.feature1.models.gemini_client import GeminiClient, build_topic_extraction_prompt
from ML.feature1.utils.json_validator import try_parse_json, validate_topic_hierarchy
from ML.feature1.extraction.hierarchy_builder import build_hierarchy
from ML.feature1.config.config import Settings


logger = logging.getLogger(__name__)


class TopicExtractor:
    """
    High-level component that sends cleaned text to Gemini and returns
    a validated, normalized topic hierarchy.
    """

    def __init__(self, settings: Settings | None = None):
        self.settings = settings or Settings()
        self.client = GeminiClient(self.settings)

    def extract_topics_from_chunks(self, chunks: List[str]) -> Dict[str, Any]:
        """
        Extract topic hierarchy from a list of text chunks.
        For multiple chunks, we aggregate them into a single prompt.
        """
        if not chunks:
            raise ValueError("No text chunks provided for topic extraction.")

        combined_text = "\n\n".join(chunks)
        prompt = build_topic_extraction_prompt(combined_text)

        # First attempt
        response = self.client.extract_topics(prompt, max_retries=self.settings.gemini_max_retries)
        success, parsed_or_error = try_parse_json(response.raw_text)
        if not success:
            logger.warning("Gemini JSON invalid, retrying once.")
            # Single retry with same prompt
            retry_response = self.client.extract_topics(prompt, max_retries=self.settings.gemini_max_retries)
            success2, parsed_or_error2 = try_parse_json(retry_response.raw_text)
            if not success2:
                raise ValueError(f"Failed to parse Gemini JSON after retry: {parsed_or_error2}")
            parsed = parsed_or_error2
        else:
            parsed = parsed_or_error

        validated = validate_topic_hierarchy(parsed)
        hierarchy = build_hierarchy(validated)
        return hierarchy


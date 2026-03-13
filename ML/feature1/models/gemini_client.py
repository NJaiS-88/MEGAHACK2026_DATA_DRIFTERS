import logging
import os
import time
from typing import Optional

from google import genai
from pydantic import BaseModel, Field

from ML.feature1.config.config import Settings


logger = logging.getLogger(__name__)


class GeminiResponse(BaseModel):
    raw_text: str = Field(..., description="Raw text returned by Gemini.")


class GeminiClient:
    """
    Gemini client using the modern `google-genai` SDK.

    - Reads API key from GEMINI_API_KEY
    - Uses model: gemini-flash-latest
    - Implements retry logic
    - Returns GeminiResponse with plain text
    """

    def __init__(self, settings: Optional[Settings] = None):
        self.settings = settings or Settings()
        api_key = self.settings.gemini_api_key
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY environment variable is not set.")

        # New Gemini SDK client
        self.client = genai.Client(api_key=api_key)
        # Use gemini-flash-latest for better compatibility with this project
        self.model = "gemini-flash-latest"

    def extract_topics(self, prompt: str, *, max_retries: int = 1) -> GeminiResponse:
        """
        Call Gemini with the given prompt and return the raw response text.

        Retries on API errors up to max_retries.
        """
        if not isinstance(prompt, str) or not prompt.strip():
            raise ValueError("Prompt must be a non-empty string.")

        last_exc: Optional[Exception] = None
        for attempt in range(max_retries + 1):
            try:
                logger.debug("Calling Gemini (attempt %d) with model %s.", attempt + 1, self.model)
                resp = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                )
                text = (getattr(resp, "text", None) or "").strip()
                if not text:
                    raise RuntimeError("Empty response from Gemini.")
                return GeminiResponse(raw_text=text)
            except Exception as exc:  # noqa: BLE001
                last_exc = exc
                logger.warning("Gemini API call failed on attempt %d: %s", attempt + 1, exc)
                if attempt < max_retries:
                    time.sleep(1.0)  # Simple backoff

        assert last_exc is not None
        logger.error("Gemini API failed after %d attempts.", max_retries + 1)
        raise last_exc


def build_topic_extraction_prompt(text: str) -> str:
    """
    Build the prompt used to ask Gemini for a hierarchical topic extraction.
    """
    template = (
        "You are an expert educator and curriculum designer.\n\n"
        "Analyze the following educational text and extract a structured hierarchy\n"
        "of topics and subtopics.\n\n"
        "Instructions:\n\n"
        "1. Identify the main topic.\n"
        "2. Identify all important subtopics.\n"
        "3. Identify important concepts under each subtopic.\n"
        "4. Return output strictly in JSON format.\n\n"
        "JSON format:\n\n"
        "{\n"
        '  "Main Topic": {\n'
        '    "Subtopic 1": [\n'
        '       "Concept 1",\n'
        '       "Concept 2"\n'
        "    ],\n"
        '    "Subtopic 2": [\n'
        '       "Concept 3",\n'
        '       "Concept 4"\n'
        "    ]\n"
        "  }\n"
        "}\n\n"
        "Educational text:\n\n"
        f"{text}\n\n"
        "Return ONLY JSON.\n"
        "Do NOT include explanations."
    )
    return template

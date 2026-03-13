import json

from ml.feature1.pipeline.topic_pipeline import TopicPipeline


class DummyTopicExtractor:
    def __init__(self, *args, **kwargs):
        pass

    def extract_topics_from_chunks(self, chunks):
        # Simple deterministic structure for testing without hitting Gemini
        return {
            "Main Topic": {
                "Subtopic 1": ["Concept 1", "Concept 2"],
                "Subtopic 2": ["Concept 3"],
            }
        }


def test_pipeline_with_text_monkeypatched(monkeypatch):
    pipeline = TopicPipeline()

    # Monkeypatch the topic extractor to avoid external API calls
    monkeypatch.setattr(pipeline, "topic_extractor", DummyTopicExtractor())

    result = pipeline.process("Explain Newton's laws of motion and their applications.")
    assert "Main Topic" in result
    assert "Subtopic 1" in result["Main Topic"]
    assert isinstance(result["Main Topic"]["Subtopic 1"], list)


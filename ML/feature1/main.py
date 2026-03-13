import json
import argparse

from ml.feature1.pipeline.topic_pipeline import generate_topic_hierarchy
from ml.feature1.utils.logger import setup_logger


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate hierarchical topics from educational content using Gemini."
    )
    parser.add_argument(
        "input",
        help="Text content or path to input file (.docx, .txt, .png, .jpg, .jpeg).",
    )
    args = parser.parse_args()

    setup_logger()
    hierarchy = generate_topic_hierarchy(args.input)
    print(json.dumps(hierarchy, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()


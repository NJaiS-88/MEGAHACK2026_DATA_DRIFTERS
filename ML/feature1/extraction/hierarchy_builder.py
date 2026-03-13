from typing import Any, Dict


def build_hierarchy(parsed_json: Any) -> Dict[str, Any]:
    """
    For now, the hierarchy is already provided by Gemini as a nested JSON
    structure. This function is kept to encapsulate any future normalization
    (e.g., title-casing, deduplication, ordering).
    """
    if not isinstance(parsed_json, dict):
        raise ValueError("Parsed JSON must be a dict to build hierarchy.")
    # Example normalization: strip whitespace from keys and concepts
    normalized: Dict[str, Any] = {}
    for main_topic, subtopics in parsed_json.items():
        if not isinstance(subtopics, dict):
            continue
        main_key = str(main_topic).strip()
        normalized_subtopics: Dict[str, Any] = {}
        for subtopic, concepts in subtopics.items():
            sub_key = str(subtopic).strip()
            if isinstance(concepts, list):
                normalized_concepts = [str(c).strip() for c in concepts if str(c).strip()]
            else:
                normalized_concepts = []
            normalized_subtopics[sub_key] = normalized_concepts
        normalized[main_key] = normalized_subtopics
    return normalized


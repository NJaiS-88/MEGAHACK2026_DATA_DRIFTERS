def determine_concept_state(is_correct: bool, misconception: bool, evaluation_state: str = None) -> str:
    """
    Rules for concept state:
    - If evaluation_state is provided (from LLM), use it.
    - Otherwise fallback to simple logic:
      - correct AND no misconception -> GREEN
      - incorrect -> RED
      - correct BUT reasoning weak -> YELLOW
    """
    if evaluation_state:
        if evaluation_state == "correct": return "green"
        if evaluation_state == "partial": return "yellow"
        if evaluation_state == "incorrect": return "red"

    if is_correct and not misconception:
        return "green"
    elif not is_correct:
        return "red"
    elif is_correct and misconception:
        return "yellow"
    
    return "red"

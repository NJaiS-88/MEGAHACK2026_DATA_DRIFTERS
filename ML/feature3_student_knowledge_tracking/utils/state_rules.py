def determine_concept_state(is_correct: bool, misconception: bool) -> str:
    """
    Rules for concept state:
    If answer correct AND no misconception -> GREEN
    If answer incorrect -> RED
    If answer correct BUT reasoning weak (misconception=True) -> YELLOW
    """
    if is_correct and not misconception:
        return "green"
    elif not is_correct:
        return "red"
    elif is_correct and misconception:
        return "yellow"
    
    return "red" # Default fallback

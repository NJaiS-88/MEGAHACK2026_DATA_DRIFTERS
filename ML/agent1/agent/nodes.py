"""
Agent Nodes
Implements the observation, questioning, and diagnosis nodes for the agent.
"""

from agent.agent_state import AgentState
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def observe_node(state: AgentState) -> AgentState:
    """
    Observation Node
    Analyzes student explanation to detect misconceptions.
    
    Args:
        state: Current agent state
        
    Returns:
        Updated state with misconception_detected flag
    """
    explanation = state.get("student_explanation", "").lower()
    
    # Common misconception patterns
    misconception_patterns = [
        "force keeps objects moving",
        "force causes motion",
        "object stops when force stops",
        "no force means no motion",
        "force is needed to maintain motion"
    ]
    
    # Check for misconception patterns
    misconception_detected = any(pattern in explanation for pattern in misconception_patterns)
    
    state["misconception_detected"] = misconception_detected
    
    logger.info(f"Observation complete. Misconception detected: {misconception_detected}")
    
    return state


def ask_diagnostic_question(state: AgentState) -> AgentState:
    """
    Question Node
    Asks a diagnostic question to investigate the root cause.
    
    Args:
        state: Current agent state
        
    Returns:
        Updated state with diagnostic_question
    """
    if state.get("misconception_detected", False):
        # Ask diagnostic question based on the misconception
        explanation = state.get("student_explanation", "").lower()
        
        if any(term in explanation for term in ["force", "motion", "moving", "stop"]):
            state["diagnostic_question"] = (
                "If an object moves in space with no forces acting on it, "
                "will it stop or continue moving?"
            )
        else:
            # Generic diagnostic question
            state["diagnostic_question"] = (
                "Can you explain what happens to an object in motion "
                "when all forces are removed?"
            )
    else:
        state["diagnostic_question"] = "No misconception detected. No diagnostic question needed."
    
    logger.info(f"Diagnostic question generated: {state.get('diagnostic_question', '')[:50]}...")
    
    return state


def diagnose_node(state: AgentState) -> AgentState:
    """
    Diagnosis Node
    Analyzes student answer to identify root cause of misconception.
    
    Args:
        state: Current agent state
        
    Returns:
        Updated state with root_cause identified
    """
    answer = state.get("student_answer", "").lower()
    explanation = state.get("student_explanation", "").lower()
    
    if not state.get("misconception_detected", False):
        state["root_cause"] = "No misconception detected in student explanation."
        return state
    
    # Analyze answer for root cause indicators
    if "stop" in answer or "will stop" in answer or "stops" in answer:
        state["root_cause"] = (
            "Student believes motion requires continuous force "
            "(misunderstanding of Newton's First Law - inertia). "
            "The student thinks objects naturally come to rest and need "
            "force to maintain motion, rather than understanding that "
            "objects in motion stay in motion unless acted upon by a force."
        )
    elif "continue" in answer or "keeps moving" in answer or "moves" in answer:
        # Check if they understand correctly now
        if "force" in explanation and "keep" in explanation:
            state["root_cause"] = (
                "Student shows understanding of inertia in answer but "
                "initial explanation suggested confusion. May have "
                "misapplied concept or used imprecise language."
            )
        else:
            state["root_cause"] = (
                "Student correctly understands inertia. Initial explanation "
                "may have been misinterpreted or student clarified understanding."
            )
    elif "friction" in answer or "air resistance" in answer:
        state["root_cause"] = (
            "Student understands that forces can stop motion but may not "
            "distinguish between forces that cause motion vs. forces that "
            "resist motion. Needs clarification on net force concept."
        )
    else:
        state["root_cause"] = (
            "Unable to determine specific root cause from answer. "
            "Student may have incomplete understanding of Newton's laws "
            "or motion concepts. Further investigation recommended."
        )
    
    logger.info(f"Root cause identified: {state.get('root_cause', '')[:100]}...")
    
    return state

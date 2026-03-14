"""
Agent State Definition
Defines the state structure for the Misconception Investigation Agent.
"""

from typing import TypedDict


class AgentState(TypedDict):
    """State structure for the misconception investigation agent."""
    student_explanation: str
    misconception_detected: bool
    diagnostic_question: str
    student_answer: str
    root_cause: str

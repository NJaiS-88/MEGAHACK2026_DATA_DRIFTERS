"""
Agent State Definition
Defines the state structure for the Misconception Investigation Agent.
"""

from typing import TypedDict, Optional


class AgentState(TypedDict):
    """State structure for the misconception investigation agent."""
    student_explanation: str        # What the student originally wrote
    misconception_detected: bool    # Whether a misconception was found
    misconception_label: str        # Short label of the misconception
    diagnostic_question: str        # AI-generated probe question
    student_answer: str             # Student's response to the probe
    root_cause: str                 # AI-diagnosed root cause
    targeted_correction: str        # Personalised corrective explanation

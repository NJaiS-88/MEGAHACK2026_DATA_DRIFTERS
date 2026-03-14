"""
Agent Routes — Misconception Investigation API
Provides the /api/agent/investigate endpoint, mounted in the main ML/app.py.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agent", tags=["Agentic Investigation"])


# ── Pydantic models ────────────────────────────────────────────────────────────

class InvestigationRequest(BaseModel):
    """
    Step 1 — send student_explanation (+force_investigate=True) to get diagnostic_question.
    Step 2 — resend with student_answer to get root_cause + targeted_correction.

    force_investigate: if True, skip the observe node (we already know there's a
    misconception) and go directly to generating the diagnostic question.
    """
    student_explanation: str
    student_answer: Optional[str] = ""
    misconception_label: Optional[str] = ""   # optional label from Feature7
    force_investigate: Optional[bool] = False  # skip observe node when True


class InvestigationResponse(BaseModel):
    student_explanation: str
    misconception_detected: bool
    misconception_label: str
    diagnostic_question: str
    student_answer: str
    root_cause: str
    targeted_correction: str


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/investigate", response_model=InvestigationResponse)
async def investigate(request: InvestigationRequest):
    """
    Agentic Misconception Investigation.

    Normal workflow (LangGraph):
      observe_node → ask_diagnostic_question → diagnose_node

    When force_investigate=True (misconception already confirmed by Feature7):
      Directly invokes ask_diagnostic_question → diagnose_node skipping observe.

    Two-step usage from frontend:
      1. Call with student_answer="" → returns diagnostic_question
      2. Call with student_answer filled → returns root_cause + correction
    """
    try:
        from ML.agent1.agent.agent_nodes import ask_diagnostic_question, diagnose_node
        from ML.agent1.agent.investigation_agent import investigation_agent

        explanation = request.student_explanation.strip()
        answer = (request.student_answer or "").strip()
        label = (request.misconception_label or "").strip()

        # When we already know there's a misconception (force_investigate=True),
        # build the state with misconception pre-confirmed and run nodes directly
        # so we bypass the observe node's second Gemini call.
        if request.force_investigate:
            state = {
                "student_explanation": explanation,
                "misconception_detected": True,
                "misconception_label": label or "Misconception detected in student answer",
                "diagnostic_question": "",
                "student_answer": answer,
                "root_cause": "",
                "targeted_correction": "",
            }
            # Only need the question? Run ask node.
            state = ask_diagnostic_question(state)
            # If student has also answered, run diagnose.
            if answer:
                state = diagnose_node(state)
        else:
            # Full LangGraph pipeline (observe → ask → diagnose)
            initial_state = {
                "student_explanation": explanation,
                "misconception_detected": False,
                "misconception_label": label,
                "diagnostic_question": "",
                "student_answer": answer,
                "root_cause": "",
                "targeted_correction": "",
            }
            state = investigation_agent.invoke(initial_state)

        return InvestigationResponse(
            student_explanation=state.get("student_explanation", ""),
            misconception_detected=state.get("misconception_detected", True if request.force_investigate else False),
            misconception_label=state.get("misconception_label", ""),
            diagnostic_question=state.get("diagnostic_question", ""),
            student_answer=state.get("student_answer", ""),
            root_cause=state.get("root_cause", ""),
            targeted_correction=state.get("targeted_correction", ""),
        )

    except Exception as exc:
        logger.exception("Error during misconception investigation")
        raise HTTPException(status_code=500, detail=f"Investigation failed: {str(exc)}")


@router.get("/health")
async def agent_health():
    """Quick health check for the agent service."""
    return {"status": "ok", "service": "Agentic Misconception Investigation"}

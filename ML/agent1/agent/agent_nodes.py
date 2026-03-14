"""
Agent Nodes — AI-Powered
Implements observe, question, and diagnosis nodes using Google Gemini (new SDK).
Each node performs genuine LLM reasoning instead of hardcoded pattern matching.
"""

import logging
from ML.agent1.agent.agent_state import AgentState
from ML.feature3_student_knowledge_tracking.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _gemini_generate(prompt: str) -> str:
    """Shared Gemini call using the same new google-genai SDK as the quiz system."""
    from google import genai
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    last_err = None
    for model_id in models:
        try:
            resp = client.models.generate_content(model=model_id, contents=prompt)
            text = (getattr(resp, "text", None) or "").strip()
            if text:
                return text
        except Exception as e:
            last_err = e
            continue
    raise RuntimeError(f"All Gemini models failed: {last_err}")


# ─────────────────────────────────────────────────────────
# NODE 1 — OBSERVE
# ─────────────────────────────────────────────────────────
def observe_node(state: AgentState) -> AgentState:
    """
    Observe Node: Uses Gemini to determine whether the student's explanation
    contains a misconception, and if so, labels it concisely.
    """
    explanation = state.get("student_explanation", "").strip()
    if not explanation:
        state["misconception_detected"] = False
        state["misconception_label"] = ""
        return state

    prompt = f"""You are an expert science and reasoning educator.

A student wrote this explanation:
\"{explanation}\"

1. Does this explanation contain a scientific or logical misconception? Answer YES or NO.
2. If YES, describe the misconception in ONE short sentence (max 15 words).

Respond in this exact format (no markdown):
DETECTED: YES or NO
LABEL: <one-sentence label, or NONE if not detected>"""

    try:
        response = _gemini_generate(prompt)
        lines = {l.split(":", 1)[0].strip(): l.split(":", 1)[1].strip()
                 for l in response.splitlines() if ":" in l}
        detected = lines.get("DETECTED", "NO").upper() == "YES"
        label = lines.get("LABEL", "").strip()
        state["misconception_detected"] = detected
        state["misconception_label"] = label if detected else ""
    except Exception as e:
        logger.error(f"[observe_node] Gemini error: {e}")
        # Graceful fallback — don't crash, just flag no misconception
        state["misconception_detected"] = False
        state["misconception_label"] = ""

    logger.info(f"[observe_node] detected={state['misconception_detected']}, label={state.get('misconception_label')}")
    return state


# ─────────────────────────────────────────────────────────
# NODE 2 — QUESTION
# ─────────────────────────────────────────────────────────
def ask_diagnostic_question(state: AgentState) -> AgentState:
    """
    Question Node: Generates a targeted diagnostic question designed to probe
    the root cause of the student's specific misconception.
    """
    if not state.get("misconception_detected", False):
        state["diagnostic_question"] = "No misconception detected. Keep up the good work!"
        return state

    misconception = state.get("misconception_label", "")
    explanation = state.get("student_explanation", "")

    prompt = f"""You are a Socratic tutor investigating a student misconception.

The student wrote:
\"{explanation}\"

Identified misconception: {misconception}

Generate ONE concise diagnostic question (max 25 words) that:
- Probes the SPECIFIC root cause of this misconception
- Is phrased as a question the student can answer in 1-2 sentences
- Does NOT give away the correct answer

Return only the question, no preamble."""

    try:
        state["diagnostic_question"] = _gemini_generate(prompt)
    except Exception as e:
        logger.error(f"[ask_diagnostic_question] Gemini error: {e}")
        state["diagnostic_question"] = (
            "Can you explain what you think happens when all forces are removed from a moving object?"
        )

    logger.info(f"[ask_diagnostic_question] question={state['diagnostic_question'][:60]}...")
    return state


# ─────────────────────────────────────────────────────────
# NODE 3 — DIAGNOSE
# ─────────────────────────────────────────────────────────
def diagnose_node(state: AgentState) -> AgentState:
    """
    Diagnosis Node: Analyzes the student's answer to the diagnostic question
    and produces a root-cause diagnosis + targeted correction.
    """
    if not state.get("misconception_detected", False):
        state["root_cause"] = "No misconception detected."
        state["targeted_correction"] = ""
        return state

    prompt = f"""You are an expert educational diagnostician.

Original student explanation:
\"{state.get('student_explanation', '')}\"

Identified misconception: {state.get('misconception_label', '')}

Diagnostic question asked: {state.get('diagnostic_question', '')}

Student's answer to the diagnostic question:
\"{state.get('student_answer', '')}\"

Based on the above:
1. ROOT CAUSE: Identify in ONE sentence why the student holds this misconception (cognitive gap, prior knowledge issue, etc.)
2. CORRECTION: Write a clear, empathetic 2-3 sentence targeted correction that addresses this specific root cause.

Respond in this exact format (no markdown):
ROOT_CAUSE: <one sentence>
CORRECTION: <2-3 sentences>"""

    try:
        response = _gemini_generate(prompt)
        lines = {}
        for l in response.splitlines():
            if ":" in l:
                key, _, val = l.partition(":")
                lines[key.strip()] = val.strip()
        state["root_cause"] = lines.get("ROOT_CAUSE", "Could not determine root cause.")
        state["targeted_correction"] = lines.get("CORRECTION", "")
    except Exception as e:
        logger.error(f"[diagnose_node] Gemini error: {e}")
        state["root_cause"] = "Unable to diagnose root cause due to an internal error."
        state["targeted_correction"] = ""

    logger.info(f"[diagnose_node] root_cause={state['root_cause'][:80]}...")
    return state

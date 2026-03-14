"""
Investigation Agent — LangGraph
Defines the observe → question → diagnose StateGraph.
"""

import logging
from langgraph.graph import StateGraph, END
from ML.agent1.agent.agent_state import AgentState
from ML.agent1.agent.agent_nodes import observe_node, ask_diagnostic_question, diagnose_node

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _should_continue(state: AgentState) -> str:
    """Conditional edge: only proceed to questioning if a misconception was detected."""
    return "ask" if state.get("misconception_detected", False) else END


# ── Build the StateGraph ──────────────────────────────────
graph = StateGraph(AgentState)

graph.add_node("observe", observe_node)
graph.add_node("ask", ask_diagnostic_question)
graph.add_node("diagnose", diagnose_node)

graph.set_entry_point("observe")

# observe → (conditional) → ask OR END
graph.add_conditional_edges(
    "observe",
    _should_continue,
    {"ask": "ask", END: END},
)

# ask → diagnose → END
graph.add_edge("ask", "diagnose")
graph.add_edge("diagnose", END)

# ── Compile ───────────────────────────────────────────────
investigation_agent = graph.compile()
logger.info("[InvestigationAgent] LangGraph agent compiled successfully.")

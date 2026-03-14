"""
Misconception Investigation Agent
Builds the LangGraph agent for investigating student misconceptions.
"""

from langgraph.graph import StateGraph, END
from agent.agent_state import AgentState
from agent.nodes import observe_node, ask_diagnostic_question, diagnose_node
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def should_continue(state: AgentState) -> str:
    """
    Conditional edge function to determine if investigation should continue.
    
    Args:
        state: Current agent state
        
    Returns:
        Next node name or END
    """
    if state.get("misconception_detected", False):
        return "ask"
    else:
        return END


# Create the state graph
graph = StateGraph(AgentState)

# Add nodes
graph.add_node("observe", observe_node)
graph.add_node("ask", ask_diagnostic_question)
graph.add_node("diagnose", diagnose_node)

# Set entry point
graph.set_entry_point("observe")

# Add conditional edge from observe
graph.add_conditional_edges(
    "observe",
    should_continue,
    {
        "ask": "ask",
        END: END
    }
)

# Add edge from ask to diagnose
graph.add_edge("ask", "diagnose")

# Add edge from diagnose to end
graph.add_edge("diagnose", END)

# Compile the agent
agent = graph.compile()

logger.info("Misconception Investigation Agent compiled successfully")

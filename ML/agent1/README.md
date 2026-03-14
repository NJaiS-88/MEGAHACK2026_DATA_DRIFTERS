# Misconception Investigation Agent

Agentic AI system that investigates WHY student misconceptions occur using LangChain and LangGraph.

## Features

- **Misconception Detection**: Automatically detects misconceptions in student explanations
- **Diagnostic Questioning**: Asks targeted questions to investigate root causes
- **Root Cause Analysis**: Identifies the underlying misunderstanding
- **Agentic Reasoning**: Uses LangGraph for structured reasoning workflow

## Tech Stack

- Python 3.10+
- LangChain
- LangGraph
- FastAPI
- Uvicorn
- Pydantic

## Project Structure

```
agent1/
├── agent/
│   ├── agent_state.py          # State definition
│   ├── nodes.py                # Agent nodes (observe, ask, diagnose)
│   └── misconception_agent.py # LangGraph agent setup
├── api/
│   └── agent_routes.py         # API endpoints
├── main.py                     # FastAPI server
├── requirements.txt            # Dependencies
└── test_agent.py               # Test script
```

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
uvicorn main:app --reload
```

Server will start at: `http://127.0.0.1:8000`

## API Endpoints

### POST /api/v1/investigate

Investigate a student misconception.

**Request:**
```json
{
  "student_explanation": "Force keeps objects moving",
  "student_answer": "It will stop"
}
```

**Response:**
```json
{
  "student_explanation": "Force keeps objects moving",
  "misconception_detected": true,
  "diagnostic_question": "If an object moves in space with no forces acting on it, will it stop or continue moving?",
  "student_answer": "It will stop",
  "root_cause": "Student believes motion requires continuous force (misunderstanding of Newton's First Law - inertia)...",
  "message": "Investigation completed successfully"
}
```

### GET /api/v1/health

Health check endpoint.

## Agent Workflow

1. **Observation Node**: Analyzes student explanation for misconceptions
2. **Question Node**: Generates diagnostic question if misconception detected
3. **Diagnosis Node**: Analyzes student answer to identify root cause

## Testing

Run the test script:
```bash
python test_agent.py
```

## Integration

This agent is designed to integrate with:
- Misconception Detection Engine
- Concept Graph
- Reasoning Score System
- Learning Recommendation Engine

## Example Usage

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

response = client.post("/api/v1/investigate", json={
    "student_explanation": "Force keeps objects moving",
    "student_answer": "It will stop"
})

result = response.json()
print(f"Root cause: {result['root_cause']}")
```

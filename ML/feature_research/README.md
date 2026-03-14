# Guided Concept Exploration Engine

ML-powered system that transforms simple topic searches into structured, personalized learning paths for students.

## Features

- **Concept Extraction**: Automatically extracts core concepts from any topic
- **Dependency Analysis**: Maps prerequisite relationships between concepts
- **Student Profiling**: Analyzes student readiness and mastery levels
- **Personalized Learning Paths**: Generates ordered learning sequences based on student data
- **Misconception Detection**: Identifies gaps in student understanding
- **Reasoning Quality Scoring**: Evaluates student explanations
- **Concept Map Integration**: Tracks student progress across concepts

## Tech Stack

- Python 3.10+
- FastAPI
- Sentence Transformers (all-MiniLM-L6-v2)
- FAISS
- Uvicorn
- Pydantic

## Project Structure

```
backend/
├── ml/
│   ├── concept_explorer.py      # Concept extraction and learning path generation
│   ├── concept_dependency.py    # Prerequisite relationship management
│   └── student_profile.py       # Student data and readiness analysis
├── api/
│   └── exploration_routes.py    # API endpoints
├── services/
│   ├── misconception_bridge.py  # Misconception detection integration
│   ├── reasoning_bridge.py      # Reasoning quality scoring integration
│   └── concept_map_bridge.py    # Concept map integration
├── tests/
│   └── test_explorer.py         # Automated tests
├── main.py                       # FastAPI server
└── requirements.txt              # Dependencies
```

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. The ML model will be automatically downloaded on first use.

## Running the Server

```bash
uvicorn main:app --reload
```

Server will start at: `http://127.0.0.1:8000`

## API Endpoints

### POST /api/v1/explore-topic

Generate a personalized learning path for a topic.

**Request:**
```json
{
  "student_id": "123",
  "topic": "Rust Programming Language"
}
```

**Response:**
```json
{
  "core_concepts": ["Ownership Model", "Borrowing", ...],
  "prerequisites": {...},
  "learning_path": [...],
  "student_readiness": {...},
  "message": "..."
}
```

### POST /api/v1/concept-explanation

Process student explanation and update related systems.

**Request:**
```json
{
  "student_id": "123",
  "concept": "Ownership Model",
  "student_explanation": "Ownership means variable control over memory"
}
```

### GET /api/v1/health

Health check endpoint.

## Testing

Run automated tests:

```bash
pytest tests/test_explorer.py -v
```

## Integration Points

This system is designed to integrate with:
- Concept Dependency Graph Engine
- Misconception Detection Engine
- Reasoning Quality Scoring Engine
- Learning Recommendation Engine

All bridge modules are ready for future integration.

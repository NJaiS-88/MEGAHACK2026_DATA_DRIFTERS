# Feature Integration Guide

This document describes the integrated features and how to run the ML service.

## Integrated Features

The `/api/submit-answer` endpoint integrates 4 features:

1. **Feature 3 - Student Knowledge Tracking**: Tracks student progress and knowledge states
2. **Feature 3 - Question Generation**: Generates AI questions for concepts
3. **Feature 7 - Misconception Detection**: Detects misconceptions in student reasoning
4. **Feature 8 - Learning Recommendations**: Provides personalized learning resources

## Data Stored in MongoDB

All question attempts are stored in the `student_attempts` collection with:

- **Basic Info**: userId, questionId, conceptId, concept name
- **Answer Data**: selectedAnswer (text), selectedOptionNumber (1-indexed), options array
- **Question Data**: questionText, correctAnswer
- **Feature Outputs**:
  - `misconception`: Full Feature7 output (detection, type, confidence, explanation)
  - `recommendations`: Array of Feature8 recommendations (title, type, difficulty, content)
  - `feedback`: AI-generated feedback from Gemini
  - `state`: Knowledge state (green/yellow/red)
- **Metadata**: isCorrect, explanation, timestamp

## Running the Server

### Option 1: Using the Python script
```bash
cd ML
python run_server.py
```

### Option 2: Using the batch file (Windows)
```bash
cd ML
run_server.bat
```

### Option 3: Direct uvicorn command
```bash
cd ML
uvicorn ML.app:app --host 127.0.0.1 --port 8010 --reload
```

The server will start on `http://127.0.0.1:8010`

## API Endpoints

### POST /api/submit-answer
Unified endpoint that processes student answers through all features.

**Request Body:**
```json
{
  "userId": "user123",
  "questionId": "q1",
  "concept": "Newton's Laws",
  "selectedAnswer": "Option A text",
  "selectedOptionNumber": 1,
  "questionText": "What is Newton's First Law?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Student's explanation"
}
```

**Response:**
```json
{
  "status": "success",
  "conceptId": "newtons_laws",
  "state": "green",
  "feedback": "Great job! Your understanding is correct.",
  "misconception": {
    "misconception_detected": false,
    "misconception": "No Misconception",
    "confidence": 0.95,
    "explanation": "..."
  },
  "recommendations": [
    {
      "title": "Advanced Newton's Laws",
      "type": "Video",
      "difficulty": "Intermediate",
      "content_preview": "...",
      "relevance_score": 0.9
    }
  ]
}
```

## Environment Variables

Ensure these are set in your `.env` file at the project root:

```
MONGODB_URI=mongodb://localhost:27017
MONGO_DB_NAME=thinkmap_ai
GEMINI_API_KEY=your_api_key_here
```

## Troubleshooting

### Connection Refused Error
- Ensure the ML server is running on port 8010
- Check that no other service is using port 8010
- Verify the frontend is pointing to `http://127.0.0.1:8010`

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in `.env` file
- Verify network connectivity to MongoDB

### Feature Errors
- All features have fallback logic if models are missing
- Check console logs for specific error messages
- Ensure all dependencies are installed: `pip install -r requirements.txt`

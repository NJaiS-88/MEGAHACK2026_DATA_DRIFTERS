import React, { useState } from 'react';
import { parseLLMResponse } from '../utils/parseLLMResponse';
import QuestionCard from './QuestionCard.jsx';

/**
 * QuizPanel
 * Side panel for practicing questions on a specific concept.
 */
function QuizPanel({ concept, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQuestions = async () => {
    setLoading(true);
    setError(null);
    setQuestions([]);

    const prompt = `You are an expert educator.

Generate 3 multiple-choice questions for the concept below.

Concept: ${concept}

Requirements:

• one conceptual question
• one application question
• one definition question

Return JSON format:

{
  "questions": [
    {
      "type": "conceptual | application | definition",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string (the exact text of the correct option)"
    }
  ]
}
`;

    try {
      // Health check first
      const healthController = new AbortController();
      const healthTimeout = setTimeout(() => healthController.abort(), 5000);
      
      try {
        const healthCheck = await fetch('http://127.0.0.1:8010/api/health', {
          method: 'GET',
          signal: healthController.signal
        });
        clearTimeout(healthTimeout);
        
        if (!healthCheck.ok) {
          throw new Error('ML server is not running. Please start the server on port 8010.');
        }
      } catch (healthErr) {
        clearTimeout(healthTimeout);
        if (healthErr.name === 'AbortError') {
          throw new Error('ML server health check timed out. Please ensure the server is running on port 8010.');
        }
        throw new Error('ML server is not running. Please start the server on port 8010.');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for AI generation

      const resp = await fetch('http://127.0.0.1:8010/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: `Server error: ${resp.status}` }));
        throw new Error(errorData.error || `Server error: ${resp.status}`);
      }
      
      const data = await resp.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions returned from AI. Please check GEMINI_API_KEY is set correctly.");
      }
      
      setQuestions(data.questions);
    } catch (err) {
      console.error("Failed to generate questions", err);
      if (err.name === 'AbortError') {
        setError("Request timed out. The AI is taking too long to respond. Please try again.");
      } else if (err.message.includes('ML server is not running')) {
        setError(err.message);
      } else {
        setError("AI Generation Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-panel" style={{
      width: '400px',
      height: '100%',
      backgroundColor: '#020617',
      borderLeft: '1px solid #1e293b',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      right: 0,
      top: 0,
      zIndex: 1000,
      textAlign: 'left',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f9fafb' }}>Practice: {concept}</h2>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Dynamic Quiz</span>
        </div>
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#9ca3af', 
            fontSize: '1.5rem', 
            cursor: 'pointer' 
          }}
        >
          &times;
        </button>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
        {questions.length === 0 && !loading && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
              Master this concept by generating personalized questions.
            </p>
            <button
              onClick={generateQuestions}
              style={{
                backgroundColor: '#38bdf8',
                color: '#020617',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 4px 14px 0 rgba(56, 189, 248, 0.39)'
              }}
            >
              Generate Practice Questions
            </button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', marginTop: '5rem' }}>
            <div className="loader" style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #1e293b', 
              borderTopColor: '#38bdf8',
              borderRadius: '50%',
              margin: '0 auto 1.5rem auto',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#e5e7eb' }}>Gemini is crafting questions...</p>
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#450a0a', 
            border: '1px solid #b91c1c', 
            borderRadius: '8px',
            color: '#fecaca',
            marginTop: '1rem'
          }}>
            {error}
          </div>
        )}

        {questions.map((q, idx) => (
          <QuestionCard 
            key={idx} 
            index={idx} 
            concept={concept} 
            questionData={q} 
          />
        ))}

        {questions.length > 0 && !loading && (
          <button
            onClick={generateQuestions}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              color: '#9ca3af',
              cursor: 'pointer',
              marginBottom: '2rem'
            }}
          >
            Regenerate Questions
          </button>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}

export default QuizPanel;

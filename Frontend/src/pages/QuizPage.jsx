import React, { useState, useEffect } from 'react';
import { getQuestion, submitAnswer } from '../services/api';
import QuestionCard from '../components/QuestionCard';

const QuizPage = () => {
  const [question, setQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const concept = "Force"; // Default concept

  const fetchNewQuestion = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await getQuestion(concept);
      setQuestion(data);
    } catch (err) {
      setError("Unable to load question.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewQuestion();
  }, []);

  const handleSelectOption = async (option) => {
    setSubmitting(true);
    try {
      const data = await submitAnswer(question.id, option);
      setResult(data);
    } catch (err) {
      setError("Answer submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="quiz-page">
      <header className="quiz-header">
        <h1>ThinkMap AI Quiz</h1>
      </header>

      <main className="quiz-main">
        {loading && <div className="loader">Loading question...</div>}
        
        {error && <div className="error-message">{error}</div>}

        {!loading && question && !result && (
          <QuestionCard 
            question={question} 
            onSelectOption={handleSelectOption} 
            disabled={submitting}
          />
        )}

        {result && (
          <div className="result-panel">
            <h2 className={result.correct ? "status-correct" : "status-wrong"}>
              {result.correct ? "Correct!" : "Incorrect"}
            </h2>
            <p className="concept-info">Concept: <strong>{result.concept}</strong></p>
            <div className={`status-badge status-${result.status}`}>
              Understanding: {result.status.toUpperCase()}
            </div>
            <button className="next-button" onClick={fetchNewQuestion}>
              Next Question
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;

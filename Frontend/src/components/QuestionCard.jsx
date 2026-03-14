import React, { useState, useEffect, useRef, useCallback } from 'react';
import AnswerFeedback from './AnswerFeedback.jsx';
import StruggleIntervention from './StruggleIntervention.jsx';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { mlApi } from '../services/mlApi';

const TOTAL_TIME = 180; // seconds per question
const STRUGGLE_AT = 90; // seconds before struggle button appears

/**
 * QuestionCard
 * - timerEnabled: whether timed mode is on (passed from QuizPanel)
 * - isLocked: whether this question is locked (subsequent questions)
 * - onComplete: called when question is submitted or timer expires
 */
function QuestionCard({ concept, questionData, index, onSuccess, timerEnabled, isLocked, onComplete }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Timer state — only meaningful when timerEnabled && !isLocked
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [timedOut, setTimedOut] = useState(false);
  const [optionChanges, setOptionChanges] = useState(0);

  // Struggle
  const [showStruggleButton, setShowStruggleButton] = useState(false);
  const [showIntervention, setShowIntervention] = useState(false);

  const hasCompleted = result !== null || timedOut;
  const timerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // ---- Timer logic ----
  const handleTimeout = useCallback(() => {
    setTimedOut(true);
    if (onCompleteRef.current) onCompleteRef.current(index);
    toast.error(`Time's up on Q${index + 1}! Moving to the next question.`);
  }, [index]);

  useEffect(() => {
    if (!timerEnabled || isLocked || hasCompleted) return;

    // Reset timer when this card becomes active
    setTimeLeft(TOTAL_TIME);
    setShowStruggleButton(false);
    setShowIntervention(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;

        // Show struggle button at 90s remaining (i.e. 90s elapsed)
        if (next <= TOTAL_TIME - STRUGGLE_AT && next > 0) {
          setShowStruggleButton(true);
        }

        if (next <= 0) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerEnabled, isLocked]);

  // Clear timer once completed
  useEffect(() => {
    if (hasCompleted) clearInterval(timerRef.current);
  }, [hasCompleted]);

  const handleOptionChange = (option) => {
    if (hasCompleted) return;
    setSelectedOption(option);
    setOptionChanges((c) => c + 1);
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;
    if (!reasoning.trim()) {
      toast.error('Please provide a reasoning for your choice.');
      return;
    }

    clearInterval(timerRef.current);
    setLoading(true);
    setResult(null);

    const user = JSON.parse(localStorage.getItem('thinkmap_user') || '{}');
    const selectedOptionNumber = questionData.options.findIndex((opt) => opt === selectedOption) + 1;

    try {
      const data = await mlApi.post('/submit-answer', {
        userId: user.id || 'anonymous',
        questionId: questionData.id || `${concept}_${index}`.replace(/\s+/g, '_'),
        concept: concept,
        selectedAnswer: selectedOption,
        selectedOptionNumber: selectedOptionNumber,
        questionText: questionData.question,
        options: questionData.options || [],
        correctAnswer: questionData.answer,
        explanation: reasoning,
      });

      if (data.error) throw new Error(data.error);

      const evaluation = {
        score: data.state === 'green' ? 1 : data.state === 'yellow' ? 0.5 : 0,
        result: data.state === 'green' ? 'correct' : data.state === 'yellow' ? 'partial' : 'incorrect',
        points: data.points || 0,
        feedback: data.feedback || 'Thank you for your submission.',
        misconception: data.misconception,
        recommendations: data.recommendations || [],
        correctAnswer: questionData.answer,
      };

      setResult(evaluation);
      setShowIntervention(false);

      if (evaluation.misconception && evaluation.misconception.misconception_detected) {
        window.dispatchEvent(
          new CustomEvent('tutor-activate', {
            detail: { concept, explanation: reasoning },
          })
        );
      }

      if (onSuccess) onSuccess();
      if (onComplete) onComplete(index);

      // Sync to Node.js backend
      try {
        await api.post('/quizzes', {
          concept,
          question: questionData.question,
          options: questionData.options,
          selectedOption,
          selectedOptionNumber,
          correctAnswer: questionData.answer,
          evaluation,
        });
      } catch (saveErr) {
        console.error('Failed to sync quiz result to Node.js backend:', saveErr);
      }
    } catch (error) {
      console.error('Evaluation failed', error);
      toast.error('Evaluation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ---- Derived helpers ----
  const pct = (timeLeft / TOTAL_TIME) * 100;
  const timerColor = timeLeft > 90 ? '#4ade80' : timeLeft > 45 ? '#fbbf24' : '#f87171';

  // ---- Locked state ----
  if (isLocked) {
    return (
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          backgroundColor: '#09090b',
          borderRadius: '12px',
          border: '1px dashed #27272a',
          opacity: 0.45,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>🔒</span>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#52525b', fontWeight: '600' }}>
            Question {index + 1} — Locked
          </div>
          <div style={{ fontSize: '0.75rem', color: '#3f3f46' }}>
            Complete the previous question to unlock
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        backgroundColor: timedOut ? '#18181b' : '#18181b',
        borderRadius: '12px',
        border: `1px solid ${timedOut ? '#450a0a' : '#27272a'}`,
        textAlign: 'left',
        position: 'relative',
      }}
    >
      {/* Timer bar (timed mode only) */}
      {timerEnabled && !timedOut && (
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#71717a' }}>Question {index + 1} timer</span>
            <span
              style={{ fontSize: '0.8rem', fontWeight: 'bold', color: timerColor, fontVariantNumeric: 'tabular-nums' }}
            >
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div
            style={{
              height: '4px',
              borderRadius: '9999px',
              backgroundColor: '#27272a',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                backgroundColor: timerColor,
                borderRadius: '9999px',
                transition: 'width 1s linear, background-color 0.5s',
              }}
            />
          </div>
        </div>
      )}

      {/* Timed-out banner */}
      {timedOut && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.6rem 1rem',
            backgroundColor: '#450a0a30',
            borderRadius: '8px',
            border: '1px solid #450a0a',
            fontSize: '0.85rem',
            color: '#f87171',
            fontWeight: '600',
          }}
        >
          ⏱ Time expired — question skipped
        </div>
      )}

      {/* Question header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#ffffff',
              fontWeight: 'bold',
            }}
          >
            Question {index + 1} — {questionData.type}
          </span>

          {/* Struggle mini-button (timed mode, after 90s) */}
          {timerEnabled && showStruggleButton && !result && !timedOut && (
            <button
              onClick={() => setShowIntervention((v) => !v)}
              title="Need help?"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid #fbbf2450',
                backgroundColor: showIntervention ? '#fbbf2420' : '#18181b',
                color: '#fbbf24',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                animation: !showIntervention ? 'pulseHelp 2s infinite' : 'none',
              }}
            >
              💡 Help
            </button>
          )}
        </div>
        <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', color: '#f9fafb' }}>
          {questionData.question}
        </h3>
      </div>

      {/* Options */}
      <div className="answer-input" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {questionData.options.map((option, i) => (
          <label
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: selectedOption === option ? '#27272a' : '#09090b',
              border: `1px solid ${selectedOption === option ? '#ffffff' : '#27272a'}`,
              cursor: hasCompleted ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: timedOut ? 0.5 : 1,
            }}
          >
            <input
              type="radio"
              name={`question-${index}`}
              value={option}
              checked={selectedOption === option}
              onChange={() => handleOptionChange(option)}
              disabled={hasCompleted}
              style={{ accentColor: '#ffffff' }}
            />
            <span style={{ color: '#e5e7eb' }}>{option}</span>
          </label>
        ))}

        {/* Reasoning input */}
        {!timedOut && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Explain your reasoning:
            </p>
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              disabled={hasCompleted}
              placeholder="Why did you choose this option?"
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: '#020617',
                border: '1px solid #27272a',
                color: '#f9fafb',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}
      </div>

      {/* Submit button */}
      {!timedOut && (
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedOption || result !== null}
          style={{
            marginTop: '1.25rem',
            width: '100%',
            padding: '0.75rem',
            borderRadius: '9999px',
            backgroundColor: result ? '#27272a' : '#ffffff',
            color: result ? '#9ca3af' : '#020617',
            fontWeight: 'bold',
            cursor: loading || !selectedOption || result !== null ? 'default' : 'pointer',
            opacity: loading || !selectedOption ? 0.7 : 1,
            border: 'none',
            transition: 'transform 0.1s',
          }}
        >
          {loading ? 'Evaluating...' : result ? 'Submitted ✓' : 'Submit Answer'}
        </button>
      )}

      {/* Struggle Intervention panel */}
      {timerEnabled && showIntervention && !result && !timedOut && (
        <StruggleIntervention
          isOpen={showIntervention}
          concept={concept}
          questionText={questionData.question}
          onSkip={() => setShowIntervention(false)}
        />
      )}

      {result && <AnswerFeedback result={result} />}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes pulseHelp {
            0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4); }
            50% { box-shadow: 0 0 0 5px rgba(251, 191, 36, 0); }
          }
        `,
        }}
      />
    </div>
  );
}

export default QuestionCard;

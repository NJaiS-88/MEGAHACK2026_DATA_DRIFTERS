import React, { useState, useEffect, useRef, useCallback } from 'react';
import AnswerFeedback from './AnswerFeedback.jsx';
import StruggleIntervention from './StruggleIntervention.jsx';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { mlApi } from '../services/mlApi';

const TOTAL_TIME = 180;
const STRUGGLE_AT = 90;

// ── Agentic Investigation Panel ──────────────────────────────────────────────
// Appears below a completed question when a misconception is detected.
// In timed mode: adds a 3-minute countdown. Calls /api/agent/investigate twice:
//   1) with no student_answer → returns diagnostic_question
//   2) with student_answer    → returns root_cause + targeted_correction
const AGENT_TIMER = 180; // 3 minutes

function AgenticInvestigation({ concept, reasoning, timerEnabled, misconceptionLabel }) {
  const [step, setStep] = useState('loading'); // loading | question | result | timeout | error
  const [diagnosticQuestion, setDiagnosticQuestion] = useState('');
  const [investigationAnswer, setInvestigationAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rootCause, setRootCause] = useState('');
  const [correction, setCorrection] = useState('');
  const [timeLeft, setTimeLeft] = useState(AGENT_TIMER);
  const timerRef = useRef(null);

  // ── Step 1: fetch diagnostic question on mount ────────────────────────────
  useEffect(() => {
    let cancelled = false;
    mlApi.post('/agent/investigate', {
      student_explanation: reasoning || concept,
      student_answer: '',
      misconception_label: misconceptionLabel || '',
      force_investigate: true,
    }).then((data) => {
      if (cancelled) return;
      if (data.misconception_detected && data.diagnostic_question) {
        setDiagnosticQuestion(data.diagnostic_question);
        setStep('question');
      } else {
        setStep('error');
      }
    }).catch(() => { if (!cancelled) setStep('error'); });
    return () => { cancelled = true; };
  }, [reasoning, concept]);

  // ── Timer (timed mode only, starts when question is ready) ────────────────
  useEffect(() => {
    if (!timerEnabled || step !== 'question') return;
    setTimeLeft(AGENT_TIMER);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setStep('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerEnabled, step === 'question']); // eslint-disable-line

  // ── Step 2: submit investigation answer ───────────────────────────────────
  const handleSubmit = async () => {
    if (!investigationAnswer.trim() && step !== 'timeout') return;
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const data = await mlApi.post('/agent/investigate', {
        student_explanation: reasoning || concept,
        student_answer: investigationAnswer || '(no answer given — timed out)',
        misconception_label: misconceptionLabel || '',
        force_investigate: true,
      });
      setRootCause(data.root_cause || '');
      setCorrection(data.targeted_correction || '');
      setStep('result');
    } catch {
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit on timeout
  useEffect(() => {
    if (step === 'timeout') handleSubmit();
  }, [step]); // eslint-disable-line

  // ── Shared styles ──────────────────────────────────────────────────────────
  const card = {
    marginTop: '1.5rem',
    padding: '1.25rem',
    backgroundColor: '#0c0a1a',
    borderRadius: '12px',
    border: '1px solid #7c3aed50',
    textAlign: 'left',
    position: 'relative',
  };
  const badge = { fontSize: '0.68rem', fontWeight: '700', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em' };
  const timerPct = (timeLeft / AGENT_TIMER) * 100;
  const timerColor = timeLeft > 90 ? '#a78bfa' : timeLeft > 45 ? '#fbbf24' : '#f87171';

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (step === 'loading') return (
    <div style={card}>
      <div style={badge}>🤖 AI Investigation</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#71717a', fontSize: '0.85rem', marginTop: '0.5rem' }}>
        <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '2px solid #3f3f46', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
        Composing diagnostic question…
      </div>
    </div>
  );

  if (step === 'error') return null;

  // ── QUESTION CARD ──────────────────────────────────────────────────────────
  if (step === 'question' || step === 'timeout') return (
    <div style={card}>
      {/* Timer bar — timed mode only */}
      {timerEnabled && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ ...badge }}>🤖 AI Investigation — Follow-up</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: timerColor, fontVariantNumeric: 'tabular-nums' }}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div style={{ height: '4px', borderRadius: '9999px', backgroundColor: '#27272a', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${timerPct}%`, backgroundColor: timerColor, borderRadius: '9999px', transition: 'width 1s linear, background-color 0.5s' }} />
          </div>
        </div>
      )}

      {!timerEnabled && <div style={{ ...badge, marginBottom: '0.75rem' }}>🤖 AI Investigation — Follow-up Question</div>}

      <p style={{ fontSize: '0.78rem', color: '#71717a', margin: '0 0 0.5rem 0' }}>
        A misconception was detected. The AI wants to investigate further:
      </p>
      <h3 style={{ fontSize: '1.05rem', color: '#f9fafb', margin: '0 0 1.25rem 0', lineHeight: '1.6', fontWeight: '600' }}>
        {diagnosticQuestion}
      </h3>

      <p style={{ fontSize: '0.82rem', color: '#71717a', margin: '0 0 0.5rem 0' }}>Your reasoning:</p>
      <textarea
        value={investigationAnswer}
        onChange={(e) => setInvestigationAnswer(e.target.value)}
        disabled={step === 'timeout'}
        placeholder="Type your answer here — what do you think and why?"
        style={{
          width: '100%', minHeight: '90px', padding: '0.75rem',
          borderRadius: '8px', backgroundColor: '#18181b',
          border: '1px solid #3f3f46', color: '#f9fafb',
          fontSize: '0.9rem', outline: 'none', resize: 'vertical',
          boxSizing: 'border-box', marginBottom: '1rem',
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={submitting || (!investigationAnswer.trim() && step !== 'timeout')}
        style={{
          width: '100%', padding: '0.7rem',
          borderRadius: '9999px', border: 'none',
          background: submitting ? '#27272a' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color: submitting ? '#71717a' : '#fff',
          fontWeight: '700', fontSize: '0.9rem',
          cursor: submitting ? 'default' : 'pointer',
          transition: 'opacity 0.2s',
        }}
      >
        {submitting ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '2px solid #52525b', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            Analysing root cause…
          </span>
        ) : 'Submit for Root Cause Diagnosis'}
      </button>
    </div>
  );

  // ── RESULT CARD ────────────────────────────────────────────────────────────
  if (step === 'result') return (
    <div style={{ ...card, border: '1px solid #7c3aed60' }}>
      <div style={{ ...badge, marginBottom: '1rem' }}>🤖 Root Cause Diagnosis</div>

      {/* Student's response echo */}
      {investigationAnswer && (
        <div style={{ marginBottom: '1rem', padding: '0.65rem 0.9rem', backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '0.65rem', color: '#52525b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Your answer</div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#a1a1aa', fontStyle: 'italic' }}>"{investigationAnswer}"</p>
        </div>
      )}

      {/* Root cause */}
      <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', backgroundColor: '#18181b', borderRadius: '10px', border: '1px solid #7c3aed30' }}>
        <div style={{ fontSize: '0.68rem', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Root Cause</div>
        <p style={{ margin: 0, fontSize: '0.92rem', color: '#d4d4d8', lineHeight: '1.7' }}>{rootCause}</p>
      </div>

      {/* Targeted correction */}
      {correction && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#18181b', borderRadius: '10px', border: '1px solid #16a34a30' }}>
          <div style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Targeted Correction</div>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#d4d4d8', lineHeight: '1.7' }}>{correction}</p>
        </div>
      )}
    </div>
  );

  return null;
}

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
  const [showAgentInvestigation, setShowAgentInvestigation] = useState(false);
  const [agentMisconceptionLabel, setAgentMisconceptionLabel] = useState('');

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

      // 🤖 Activate agentic investigation for any wrong or partial answer
      if (evaluation.result === 'incorrect' || evaluation.result === 'partial') {
        const label = evaluation.misconception?.misconception_detected
          ? (evaluation.misconception?.misconception || 'Misconception detected')
          : 'Incorrect reasoning detected';
        setAgentMisconceptionLabel(label);
        setShowAgentInvestigation(true);
        // Also fire the tutor sidebar event if Feature7 confirms misconception
        if (evaluation.misconception?.misconception_detected) {
          window.dispatchEvent(new CustomEvent('tutor-activate', { detail: { concept, explanation: reasoning } }));
        }
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

      {/* 🤖 Agentic Investigation — shown when misconception detected */}
      {showAgentInvestigation && result && (
        <AgenticInvestigation
          concept={concept}
          reasoning={reasoning}
          timerEnabled={timerEnabled}
          misconceptionLabel={agentMisconceptionLabel}
        />
      )}

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

import React, { useState } from 'react';
import QuestionCard from './QuestionCard.jsx';
import { mlApi } from '../services/mlApi';

function QuizPanel({ concept, onClose }) {
  const [attempts, setAttempts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Timer mode: user can toggle before starting a quiz
  const [timerEnabled, setTimerEnabled] = useState(false);
  // Index of the currently active (unlocked) question
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const fetchAttempts = async () => {
    const user = JSON.parse(localStorage.getItem('thinkmap_user') || '{}');
    if (!user.id) return;
    try {
      const data = await mlApi.get(`/student-attempts/${user.id}/${concept}`);
      setAttempts(data.attempts || []);
    } catch (err) {
      console.error('Failed to fetch attempts', err);
    }
  };

  React.useEffect(() => {
    fetchAttempts();
  }, [concept]);

  const generateQuestions = async () => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setActiveQuestionIndex(0);

    try {
      const data = await mlApi.post('/generate-questions', { concept });
      setQuestions(data.questions || []);
    } catch (err) {
      setError('AI Generation Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Called by QuestionCard when the question is submitted or timed out */
  const handleQuestionComplete = (completedIndex) => {
    setActiveQuestionIndex((prev) => Math.max(prev, completedIndex + 1));
    fetchAttempts();
  };

  const filteredAttempts = attempts.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'correct') return a.isCorrect;
    if (filter === 'incorrect') return !a.isCorrect;
    if (filter === 'misconceptions')
      return a.misconception && a.misconception.misconception_detected;
    return true;
  });

  return (
    <div
      className="quiz-panel"
      style={{
        width: '450px',
        height: '100%',
        backgroundColor: '#09090b',
        borderLeft: '1px solid #27272a',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: 1000,
        textAlign: 'left',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid #27272a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f9fafb' }}>{concept}</h2>
          <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Mastery &amp; Practice</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#71717a',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
        {/* Timer Toggle — only shown before questions are generated */}
        {questions.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              padding: '1rem 1.25rem',
              backgroundColor: '#18181b',
              borderRadius: '12px',
              border: `1px solid ${timerEnabled ? '#fbbf2440' : '#27272a'}`,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: timerEnabled ? '#fbbf24' : '#e5e7eb',
                }}
              >
                ⏱ Timed Mode
              </div>
              <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '2px' }}>
                {timerEnabled
                  ? '180s per question · struggle help unlocked'
                  : 'Enable for hints, examples & struggle intervention'}
              </div>
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => setTimerEnabled((v) => !v)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: timerEnabled ? '#fbbf24' : '#3f3f46',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                flexShrink: 0,
              }}
              aria-label="Toggle timed mode"
            >
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  left: timerEnabled ? '22px' : '3px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>
        )}

        {/* Active Quiz Section */}
        {questions.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <h3
                style={{
                  fontSize: '1rem',
                  color: '#ffffff',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Current Quiz
              </h3>
              {timerEnabled && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor: '#fbbf2420',
                    color: '#fbbf24',
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    fontWeight: 'bold',
                    border: '1px solid #fbbf2440',
                  }}
                >
                  ⏱ TIMED
                </span>
              )}
            </div>
            {questions.map((q, idx) => (
              <QuestionCard
                key={idx}
                index={idx}
                concept={concept}
                questionData={q}
                onSuccess={fetchAttempts}
                timerEnabled={timerEnabled}
                isLocked={timerEnabled && idx > activeQuestionIndex}
                isActive={!timerEnabled || idx <= activeQuestionIndex}
                onComplete={() => handleQuestionComplete(idx)}
              />
            ))}
          </div>
        )}

        {/* Action Button */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <button
            onClick={generateQuestions}
            disabled={loading}
            style={{
              backgroundColor: '#ffffff',
              color: '#09090b',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none',
              width: '100%',
              boxShadow: '0 4px 14px 0 rgba(255, 255, 255, 0.1)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? 'Generating Questions...'
              : questions.length > 0
              ? 'Regenerate Practice'
              : 'Generate Practice Questions'}
          </button>
          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.75rem' }}>
              {error}
            </p>
          )}
        </div>

        {/* History Section */}
        <div style={{ marginTop: '3rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ fontSize: '1rem', color: '#f9fafb', margin: 0 }}>Attempt History</h3>
            <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{attempts.length} total</span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
            }}
          >
            {['all', 'correct', 'incorrect', 'misconceptions'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  backgroundColor: filter === f ? '#ffffff' : '#18181b',
                  color: filter === f ? '#09090b' : '#71717a',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredAttempts.length === 0 ? (
              <p style={{ color: '#52525b', textAlign: 'center', fontSize: '0.85rem' }}>
                No attempts found for this filter.
              </p>
            ) : (
              filteredAttempts.map((attempt, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#18181b',
                    borderRadius: '8px',
                    border: `1px solid ${
                      attempt.state === 'green'
                        ? '#064e3b'
                        : attempt.state === 'yellow'
                        ? '#78350f'
                        : '#450a0a'
                    }`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        color:
                          attempt.state === 'green'
                            ? '#4ade80'
                            : attempt.state === 'yellow'
                            ? '#fbbf24'
                            : '#f87171',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                      }}
                    >
                      {attempt.state === 'green'
                        ? 'Correct'
                        : attempt.state === 'yellow'
                        ? 'Partial'
                        : 'Incorrect'}
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem', color: '#71717a' }}>
                      <span
                        style={{
                          color: attempt.points >= 0 ? '#4ade80' : '#f87171',
                          fontWeight: 'bold',
                        }}
                      >
                        {attempt.points >= 0 ? `+${attempt.points}` : attempt.points} pts
                      </span>
                      <span>{new Date(attempt.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#f9fafb' }}>
                    {attempt.questionText}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#71717a' }}>
                    Answer: <span style={{ color: '#e5e7eb' }}>{attempt.selectedAnswer}</span>
                  </p>

                  {attempt.misconception && attempt.misconception.misconception_detected && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem',
                        backgroundColor: '#450a0a20',
                        borderRadius: '4px',
                        border: '1px solid #450a0a',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#f87171',
                          fontWeight: 'bold',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Misconception Detected:
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#fca5a5' }}>
                        {attempt.misconception.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `,
        }}
      />
    </div>
  );
}

export default QuizPanel;

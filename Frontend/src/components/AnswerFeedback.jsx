import React from 'react';

/**
 * AnswerFeedback
 * Displays the result of Gemini's answer evaluation.
 */
function AnswerFeedback({ result }) {
  if (!result) return null;

  const { score, result: status, feedback, misconception, recommendations } = result;

  const getBackgroundColor = () => {
    if (status === 'correct') return '#064e3b20';
    if (status === 'partial') return '#78350f20';
    return '#450a0a20';
  };

  const getBorderColor = () => {
    if (status === 'correct') return '#064e3b';
    if (status === 'partial') return '#78350f';
    return '#b91c1c';
  };

  const getTextColor = () => {
    if (status === 'correct') return '#4ade80';
    if (status === 'partial') return '#fbbf24';
    return '#f87171';
  };

  return (
    <div style={{
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid',
      marginTop: '1rem',
      textAlign: 'left',
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      color: getTextColor()
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, textTransform: 'capitalize', fontSize: '1.1rem' }}>{status}</h3>
        <span style={{ fontWeight: 'bold' }}>Score: {Math.round(score * 100)}%</span>
      </div>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', lineHeight: '1.4', color: '#e5e7eb' }}>{feedback}</p>
      
      {result.correctAnswer && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          backgroundColor: 'rgba(56, 189, 248, 0.1)', 
          border: '1px solid rgba(56, 189, 248, 0.2)', 
          borderRadius: '6px' 
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#38bdf8' }}>Correct Answer</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#f9fafb', fontWeight: '500' }}>
            {result.correctAnswer}
          </p>
        </div>
      )}

      {misconception && misconception.misconception_detected && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: '6px' 
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#f87171' }}>Detected Misconception</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#fca5a5' }}>
            {misconception.explanation}
          </p>
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#38bdf8' }}>Recommended Resources</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} style={{ 
                padding: '0.75rem', 
                backgroundColor: 'rgba(56, 189, 248, 0.05)', 
                border: '1px solid rgba(56, 189, 248, 0.1)', 
                borderRadius: '6px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#f9fafb', marginBottom: '0.25rem' }}>{rec.title}</div>
                  {rec.url && (
                    <a 
                      href={rec.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        backgroundColor: rec.type === 'Video' ? '#ef4444' : '#1e293b',
                        color: '#fff',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {rec.type === 'Video' ? '▶ Watch' : '🔗 View'}
                    </a>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{rec.type} • {rec.difficulty}</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.4rem' }}>{rec.content_preview}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnswerFeedback;

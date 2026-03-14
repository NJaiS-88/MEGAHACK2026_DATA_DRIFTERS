import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { mlApi } from '../services/mlApi';
import toast from 'react-hot-toast';
import ConceptGraph from '../components/ConceptGraph';
import QuizPanel from '../components/QuizPanel';

const STORAGE_KEY = 'thinkmap_deep_research';

function loadResearchHistory(userId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveResearchHistory(userId, history) {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(history));
  } catch {}
}

function DashboardPage({ user }) {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [knowledge, setKnowledge] = useState({});
  const [loading, setLoading] = useState(true);

  // Research history (persisted)
  const [researchHistory, setResearchHistory] = useState([]);

  // Active research panel (currently displayed)
  const [topicExplain, setTopicExplain] = useState(null);

  // Concept graph (step 2, per active panel)
  const [personalizedGraph, setPersonalizedGraph] = useState(null);
  const [graphLoading, setGraphLoading] = useState(false);

  // Quiz
  const [selectedConcept, setSelectedConcept] = useState(null);

  const userId = user?.id || 'anonymous';

  // Load books + knowledge
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const booksData = await api.get('/books');
        setBooks(booksData);
        if (user?.id) {
          const mlData = await mlApi.get(`/student-knowledge/${user.id}`);
          setKnowledge(mlData.conceptStates || {});
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Load persisted research history on mount
  useEffect(() => {
    setResearchHistory(loadResearchHistory(userId));
  }, [userId]);

  // Listen for explain-topic-result from Sidebar
  useEffect(() => {
    const handler = (e) => {
      const item = {
        ...e.detail,
        id: Date.now(),
        time: new Date().toLocaleString(),
      };
      // Show as active panel
      setTopicExplain(item);
      setPersonalizedGraph(null);
      setSelectedConcept(null);

      // Prepend to history (max 10) and persist
      setResearchHistory(prev => {
        const next = [item, ...prev.filter(r => r.topic !== item.topic)].slice(0, 10);
        saveResearchHistory(userId, next);
        return next;
      });

      setTimeout(() => {
        document.getElementById('research-panel')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    };
    window.addEventListener('explain-topic-result', handler);
    return () => window.removeEventListener('explain-topic-result', handler);
  }, [userId]);

  const openHistoryItem = (item) => {
    setTopicExplain(item);
    setPersonalizedGraph(null);
    setSelectedConcept(null);
    setTimeout(() => {
      document.getElementById('research-panel')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    setResearchHistory(prev => {
      const next = prev.filter(r => r.id !== id);
      saveResearchHistory(userId, next);
      return next;
    });
    if (topicExplain?.id === id) setTopicExplain(null);
  };

  const handleGenerateGraph = async () => {
    if (!topicExplain || graphLoading) return;
    setGraphLoading(true);
    try {
      const data = await mlApi.post('/v1/explore-topic', {
        userId: topicExplain.userId || userId,
        topic: topicExplain.topic,
      });
      if (data.error) { toast.error('Could not generate graph: ' + data.error); return; }
      setPersonalizedGraph({
        hierarchy: data.hierarchy,
        topic: topicExplain.topic,
        studentSummary: data.student_summary,
        learningPath: data.learning_path,
      });
    } catch (err) {
      toast.error('Failed to generate graph.');
    } finally {
      setGraphLoading(false);
    }
  };

  const handleConceptSelect = (node) => {
    if (node.group === 'concept' || node.group === 'subtopic') setSelectedConcept(node.id);
  };

  return (
    <div className="dashboard-page">
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '0.5rem', color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Overview
        </div>
        <h1>Welcome, {user?.name || user?.email?.split('@')[0]}</h1>
        <p>Ready to master new concepts today?</p>
      </header>

      {/* ── ACTIVE RESEARCH PANEL ── */}
      {topicExplain && (
        <section
          id="research-panel"
          style={{ marginBottom: '3rem', padding: '2rem', backgroundColor: '#09090b', borderRadius: '16px', border: '1px solid #27272a' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                ✦ AI Learning Guide
              </div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#f9fafb' }}>{topicExplain.topic}</h2>
              {topicExplain.time && (
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem', color: '#52525b' }}>{topicExplain.time}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {topicExplain.studentSummary?.mastered_count > 0 && (
                <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#16a34a20', color: '#4ade80', border: '1px solid #16a34a40', fontWeight: '600' }}>
                  {topicExplain.studentSummary.mastered_count} mastered
                </span>
              )}
              {topicExplain.studentSummary?.struggling_count > 0 && (
                <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#dc262620', color: '#f87171', border: '1px solid #dc262640', fontWeight: '600' }}>
                  {topicExplain.studentSummary.struggling_count} needs review
                </span>
              )}
              <button onClick={() => setTopicExplain(null)} style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '9999px', backgroundColor: 'transparent', color: '#52525b', border: '1px solid #27272a', cursor: 'pointer' }}>
                ✕ Dismiss
              </button>
            </div>
          </div>

          {/* Explanation */}
          <div style={{ lineHeight: '1.8', color: '#d4d4d8', fontSize: '0.95rem', padding: '1.25rem 1.5rem', backgroundColor: '#18181b', borderRadius: '10px', border: '1px solid #27272a', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
            {topicExplain.explanation}
          </div>

          {/* Step 2: graph */}
          {!personalizedGraph ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleGenerateGraph}
                disabled={graphLoading}
                style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: graphLoading ? '#27272a' : 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: graphLoading ? '#71717a' : '#09090b', fontWeight: '700', fontSize: '0.88rem', cursor: graphLoading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {graphLoading ? (
                  <><span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #52525b', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Building your map...</>
                ) : '🗺 Generate Learning Map'}
              </button>
              <span style={{ fontSize: '0.78rem', color: '#52525b' }}>Creates a personalised concept graph based on your quiz history</span>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#52525b', marginRight: '0.25rem' }}>Your path:</span>
                {personalizedGraph.learningPath?.slice(0, 8).map((c, i) => (
                  <button key={i} onClick={() => setSelectedConcept(c)}
                    style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#18181b', color: '#a1a1aa', border: '1px solid #27272a', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#ffffff30'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = '#27272a'; }}
                  >{i + 1}. {c}</button>
                ))}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#52525b', marginBottom: '1rem' }}>Click any node to practise that concept</p>
              <ConceptGraph data={personalizedGraph.hierarchy} onSelectNode={handleConceptSelect} knowledgeStates={knowledge} />
            </div>
          )}
        </section>
      )}

      {/* ── DEEP RESEARCH HISTORY ── */}
      {researchHistory.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✦ Deep Research</div>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #27272a, transparent)' }} />
            <span style={{ fontSize: '0.72rem', color: '#52525b' }}>{researchHistory.length} saved</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {researchHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => openHistoryItem(item)}
                style={{
                  padding: '1.25rem', borderRadius: '12px', border: `1px solid ${topicExplain?.id === item.id ? '#fbbf2460' : '#27272a'}`,
                  backgroundColor: topicExplain?.id === item.id ? '#fbbf2408' : '#09090b',
                  cursor: 'pointer', position: 'relative', transition: 'all 0.18s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = topicExplain?.id === item.id ? '#fbbf2460' : '#27272a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <button
                  onClick={(e) => deleteHistoryItem(item.id, e)}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#3f3f46', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 5px', borderRadius: '4px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#3f3f46'; }}
                >✕</button>
                <div style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Research</div>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#f9fafb', marginBottom: '0.5rem', paddingRight: '1.5rem' }}>{item.topic}</div>
                <div style={{ fontSize: '0.78rem', color: '#71717a', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                  {item.explanation?.slice(0, 100)}...
                </div>
                <div style={{ fontSize: '0.68rem', color: '#3f3f46' }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STUDY BOOKS ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Your Study Books</h2>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #27272a, transparent)' }} />
      </div>

      <div className="dashboard-scroll-area">
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', paddingBottom: '2rem' }}>
          <div
            onClick={() => navigate('/create-book')}
            className="panel"
            style={{ cursor: 'pointer', border: '1px dashed #27272a', background: 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2.5rem 2rem', textAlign: 'center', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffffff05'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem', color: '#71717a' }}>+</div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Create New Book</h2>
            <p style={{ color: '#71717a', fontSize: '0.85rem', margin: 0 }}>Start a new AI session</p>
          </div>

          {loading ? (
            [...Array(3)].map((_, i) => <div key={`sk-${i}`} className="skeleton-card skeleton-shimmer" />)
          ) : (
            books.map((book) => (
              <div
                key={book._id || book.id}
                onClick={() => navigate(`/book/${book._id || book.id}`)}
                className="panel"
                style={{ cursor: 'pointer', border: '1px solid #27272a', background: '#09090b', padding: '2rem', position: 'relative', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ color: '#ffffff40', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '0.1em' }}>STUDY BOOK</div>
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h2>
                <div style={{ color: '#71717a', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{book.date}</span>
                  <span style={{ color: '#ffffff60' }}>View Map</span>
                </div>
              </div>
            ))
          )}

          {books.length === 0 && !loading && (
            <div className="panel" style={{ border: '1px solid #27272a', background: '#09090b', opacity: 0.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
              <p style={{ color: '#71717a', textAlign: 'center' }}>No books yet. Click "+" to start.</p>
            </div>
          )}
        </div>
      </div>

      {selectedConcept && <QuizPanel concept={selectedConcept} onClose={() => setSelectedConcept(null)} />}
    </div>
  );
}

export default DashboardPage;

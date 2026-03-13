import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConceptGraph from '../components/ConceptGraph.jsx';
import QuizPanel from '../components/QuizPanel.jsx';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const API_BASE = 'http://127.0.0.1:8010'; // ML server port

function CreateBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [isViewing, setIsViewing] = useState(false);

  // Effect to load book if viewing
  useEffect(() => {
    if (id) {
      const fetchBook = async () => {
        try {
          const books = await api.get('/books');
          const book = books.find(b => b._id === id || b.id === id);
          if (book) {
            setResult(book.hierarchy);
            setText(book.sourceText || '');
            setIsViewing(true);
          }
        } catch (err) {
          toast.error('Failed to load book mapping');
        }
      };
      fetchBook();
    } else {
      setResult(null);
      setText('');
      setIsViewing(false);
    }
  }, [id]);

  const handleSubmitText = async (e) => {
    e.preventDefault();
    if (isViewing) return; // Prevent re-submission in view mode unless we add "Edit"

    setError(null);
    setResult(null);
    setSelectedConcept(null);

    if (!text.trim()) {
      setError('Please enter some text.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/topic-hierarchy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        const hierarchy = data.hierarchy;
        setResult(hierarchy);
        
        // Save automatically to MongoDB
        const mainTopic = Object.keys(hierarchy)[0] || 'Untitled Study Book';
        const newBookData = {
          title: mainTopic,
          date: new Date().toLocaleDateString(),
          hierarchy: hierarchy,
          sourceText: text
        };
        
        try {
          await api.post('/books', newBookData);
          toast.success('Book saved to your cloud library!');
        } catch (err) {
          console.error('Failed to save to cloud:', err);
          toast.error('Failed to sync to cloud, but view is ready.');
        }
      }
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleConceptSelect = (node) => {
    if (node.group === 'concept' || node.group === 'subtopic') {
      setSelectedConcept(node.id);
    }
  };

  return (
    <div className="create-book-page">
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '0.5rem', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          AI Content Lab
        </div>
        <h1>{isViewing ? result && Object.keys(result)[0] : 'Generate Study Book'}</h1>
        <p>{isViewing ? 'Mastery Map view' : 'Transform any educational content into a structured learning map.'}</p>
      </header>

      <main className="layout" style={{ display: 'grid', gridTemplateColumns: (result && !isViewing) ? '0.8fr 2.2fr' : '1fr', gap: '2rem' }}>
        {!isViewing && (
          <section className="panel" style={{ border: '1px solid #1e293b', background: 'linear-gradient(145deg, #0f172a 0%, #020617 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Input Content</h2>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#38bdf820', color: '#38bdf8', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 'bold' }}>Gemini 1.5 Flash</span>
            </div>
            <form onSubmit={handleSubmitText} className="form">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your source text or describe a topic (e.g., Quantum Physics fundamentals)..."
                rows={12}
                style={{ marginBottom: '1rem' }}
              />
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}>
                {loading ? 'Analyzing Content...' : 'Generate Mastery Map'}
              </button>
            </form>
          </section>
        )}

        {result && (
          <section className="panel panel-graph">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Mastery Map</h2>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>Click on nodes to practice</p>
            </div>
            <ConceptGraph data={result} onSelectNode={handleConceptSelect} />
          </section>
        )}
      </main>

      {selectedConcept && (
        <QuizPanel 
          concept={selectedConcept} 
          onClose={() => setSelectedConcept(null)} 
        />
      )}

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export default CreateBookPage;

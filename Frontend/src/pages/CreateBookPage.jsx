import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConceptGraph from '../components/ConceptGraph.jsx';
import QuizPanel from '../components/QuizPanel.jsx';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const API_BASE = 'http://127.0.0.1:8000';

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

  const [file, setFile] = useState(null);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/topic-hierarchy-file`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        const hierarchy = data.hierarchy;
        setResult(hierarchy);
        
        // Save to MongoDB
        const mainTopic = Object.keys(hierarchy)[0] || 'Untitled Study Book';
        const newBookData = {
          title: mainTopic,
          date: new Date().toLocaleDateString(),
          hierarchy: hierarchy,
          sourceText: `Generated from file: ${file.name}`
        };
        
        await api.post('/books', newBookData);
        toast.success('Study Map generated from file!');
      }
    } catch (err) {
      setError(err.message || 'Error processing file');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitText = async (e) => {
    e.preventDefault();
    if (isViewing) return; 

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

  const [knowledgeStates, setKnowledgeStates] = useState({});

  // Fetch knowledge states
  const fetchKnowledgeStates = async () => {
    const user = JSON.parse(localStorage.getItem('thinkmap_user') || '{}');
    if (!user.id) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/student-knowledge/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setKnowledgeStates(data.conceptStates || {});
      }
    } catch (err) {
      console.error('Failed to fetch knowledge states:', err);
    }
  };

  useEffect(() => {
    fetchKnowledgeStates();
  }, []);

  const handleConceptSelect = (node) => {
    if (node.group === 'concept' || node.group === 'subtopic') {
      setSelectedConcept(node.id);
    }
  };

  const handleQuizClose = () => {
    setSelectedConcept(null);
    fetchKnowledgeStates(); // Refresh states after quiz
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
              <span style={{ fontSize: '0.75rem', backgroundColor: '#38bdf820', color: '#38bdf8', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 'bold' }}>Multi-Modal AI</span>
            </div>

            <div style={{ marginBottom: '2rem' }}>
               <h3 style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '1rem', textTransform: 'uppercase' }}>Option 1: Paste Text</h3>
               <form onSubmit={handleSubmitText} className="form">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your source text or describe a topic (e.g., Quantum Physics fundamentals)..."
                  rows={6}
                  style={{ marginBottom: '1rem' }}
                />
                <button type="submit" disabled={loading || !!file} style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold' }}>
                  {loading && !file ? 'Analyzing Text...' : 'Generate from Text'}
                </button>
              </form>
            </div>

            <div style={{ padding: '1.5rem', border: '2px dashed #1e293b', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.05)' }}>
               <h3 style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '1rem', textTransform: 'uppercase' }}>Option 2: Upload Files</h3>
               <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Support for PDF, Images (PNG/JPG), and DOCX</p>
               
               <input 
                 type="file" 
                 accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
                 onChange={(e) => setFile(e.target.files[0])}
                 style={{ 
                   marginBottom: '1rem',
                   color: '#9ca3af',
                   fontSize: '0.85rem'
                 }}
               />
               
               {file && (
                 <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#0f172a', borderRadius: '6px', fontSize: '0.85rem' }}>
                   Selected: <span style={{ color: '#38bdf8' }}>{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                 </div>
               )}

               <button 
                onClick={handleFileUpload} 
                disabled={loading || !file} 
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  fontWeight: 'bold',
                  backgroundColor: file ? '#38bdf8' : '#1e293b',
                  color: file ? '#000' : '#64748b'
                }}>
                  {loading && file ? 'Processing File...' : 'Generate from File'}
               </button>
            </div>
          </section>
        )}

        {result && (
          <section className="panel panel-graph">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Mastery Map</h2>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>Click on nodes to practice</p>
            </div>
            <ConceptGraph 
              data={result} 
              onSelectNode={handleConceptSelect} 
              knowledgeStates={knowledgeStates}
            />
          </section>
        )}
      </main>

      {selectedConcept && (
        <QuizPanel 
          concept={selectedConcept} 
          onClose={handleQuizClose} 
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

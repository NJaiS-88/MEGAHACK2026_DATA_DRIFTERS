import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConceptGraph from '../components/ConceptGraph.jsx';
import QuizPanel from '../components/QuizPanel.jsx';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { mlApi } from '../services/mlApi';
import NotesPanel from '../components/NotesPanel.jsx';

/**
 * CreateBookPage
 * Allows users to generate a study map from text or file.
 * If an 'id' param exists, it loads that specific book map.
 */
function CreateBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [file, setFile] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'notes'

  const [knowledgeStates, setKnowledgeStates] = useState({});

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

  // Fetch knowledge states
  const fetchKnowledgeStates = async () => {
    const userString = localStorage.getItem('thinkmap_user');
    if (!userString) return;
    const user = JSON.parse(userString);
    if (!user.id) return;

    try {
      const data = await mlApi.get(`/student-knowledge/${user.id}`);
      setKnowledgeStates(data.conceptStates || {});
    } catch (err) {
      console.error('Failed to fetch knowledge states:', err);
    }
  };

  useEffect(() => {
    fetchKnowledgeStates();
  }, []);

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
      const res = await fetch(`http://127.0.0.1:8005/api/topic-hierarchy-file`, {
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
        
        const savedBook = await api.post('/books', newBookData);
        toast.success('Study Map generated from file!');
        // Switch to viewing the newly created book
        if (savedBook?._id) navigate(`/book/${savedBook._id}`);
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
      const data = await mlApi.post('/topic-hierarchy', { text });
      
      const hierarchy = data.hierarchy;
      setResult(hierarchy);
      
      const mainTopic = Object.keys(hierarchy)[0] || 'Untitled Study Book';
      const newBookData = {
        title: mainTopic,
        date: new Date().toLocaleDateString(),
        hierarchy: hierarchy,
        sourceText: text
      };
      
      try {
        const savedBook = await api.post('/books', newBookData);
        toast.success('Book saved to your cloud library!');
        if (savedBook?._id) navigate(`/book/${savedBook._id}`);
      } catch (err) {
        console.error('Failed to save to cloud:', err);
        toast.error('Failed to sync to cloud, but view is ready.');
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

  const handleQuizClose = () => {
    setSelectedConcept(null);
    fetchKnowledgeStates();
  };

  return (
    <div className="create-book-page">
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '0.5rem', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          AI Content Lab
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>{isViewing ? result && Object.keys(result)[0] : 'Generate Study Book'}</h1>
            <p>{isViewing ? (viewMode === 'map' ? 'Mastery Map view' : 'AI Study Notes') : 'Transform any educational content into a structured learning map.'}</p>
          </div>
          
          {isViewing && (
            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#0f172a', padding: '0.4rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <button 
                onClick={() => setViewMode('map')}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: viewMode === 'map' ? '#38bdf8' : 'transparent',
                  color: viewMode === 'map' ? '#000' : '#9ca3af',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🗺️ Mastery Map
              </button>
              <button 
                onClick={() => setViewMode('notes')}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: viewMode === 'notes' ? '#38bdf8' : 'transparent',
                  color: viewMode === 'notes' ? '#000' : '#9ca3af',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                📝 View Notes
              </button>
            </div>
          )}
        </div>
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
          <section className="panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid #1e293b', background: 'transparent' }}>
            {viewMode === 'map' ? (
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0 }}>Mastery Map</h2>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>Click on nodes to practice</p>
                </div>
                <ConceptGraph 
                  data={result} 
                  onSelectNode={handleConceptSelect} 
                  knowledgeStates={knowledgeStates}
                />
              </div>
            ) : (
              <div style={{ padding: '2rem' }}>
                <NotesPanel 
                  userId={JSON.parse(localStorage.getItem('thinkmap_user') || '{}').id}
                  hierarchy={result}
                />
              </div>
            )}
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

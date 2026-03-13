import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';

function DashboardPage({ user }) {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await api.get('/books');
        setBooks(data);
      } catch (err) {
        toast.error('Failed to load books from cloud');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="dashboard-page">
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '0.5rem', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Overview
        </div>
        <h1>Welcome, {user?.email.split('@')[0]}</h1>
        <p>Ready to master new concepts today?</p>
      </header>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {/* Create Book Card */}
        <div 
          onClick={() => navigate('/create-book')}
          className="panel" 
          style={{ 
            cursor: 'pointer',
            border: '1px dashed #38bdf8', 
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#38bdf810';
            e.currentTarget.style.transform = 'translateY(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>+</div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Create New Book</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>Start a new AI session</p>
        </div>

        {/* Saved Book Cards */}
        {loading ? (
          <div style={{ color: '#9ca3af' }}>Loading your cloud library...</div>
        ) : books.map((book) => (
          <div 
            key={book._id || book.id}
            onClick={() => navigate(`/book/${book._id || book.id}`)}
            className="panel" 
            style={{ 
              cursor: 'pointer',
              border: '1px solid #1e293b', 
              background: 'linear-gradient(145deg, #0f172a 0%, #020617 100%)',
              padding: '2rem',
              position: 'relative',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#38bdf8';
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1e293b';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              STUDY BOOK
            </div>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {book.title}
            </h2>
            <div style={{ color: '#9ca3af', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{book.date}</span>
              <span style={{ color: '#38bdf8' }}>View Map →</span>
            </div>
          </div>
        ))}

        {books.length === 0 && (
          <div className="panel" style={{ border: '1px solid #1e293b', background: '#020617', opacity: 0.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
            <p style={{ color: '#9ca3af', textAlign: 'center' }}>You haven't created any study books yet. Click the "+" card to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;

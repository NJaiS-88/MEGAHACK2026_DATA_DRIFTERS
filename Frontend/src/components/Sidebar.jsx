import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/image.png';
import { X, Sparkles, LayoutDashboard, Database, BarChart2, Settings, LogOut, Search, Loader } from 'lucide-react';
import { mlApi } from '../services/mlApi';

function Sidebar({ user, onLogout, isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // "What do you want to learn?" state
  const [topicInput, setTopicInput] = useState('');
  const [explaining, setExplaining] = useState(false);

  const handleExplainTopic = async (e) => {
    e.preventDefault();
    if (!topicInput.trim() || explaining) return;

    setExplaining(true);
    try {
      const userObj = JSON.parse(localStorage.getItem('thinkmap_user') || '{}');
      const data = await mlApi.post('/v1/explain-topic', {
        userId: userObj.id || 'anonymous',
        topic: topicInput.trim(),
      });

      if (data.error) {
        alert('Could not generate explanation: ' + data.error);
        return;
      }

      // Broadcast result to Dashboard
      window.dispatchEvent(
        new CustomEvent('explain-topic-result', {
          detail: {
            topic: topicInput.trim(),
            explanation: data.explanation,
            studentSummary: data.student_summary,
            userId: userObj.id || 'anonymous',
          },
        })
      );

      navigate('/dashboard');
      onClose?.();
    } catch (err) {
      console.error('Explain topic failed:', err);
      alert('Failed to generate explanation. Please make sure the ML server is running.');
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
      <div
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#09090b',
          color: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2rem 1.5rem',
          boxSizing: 'border-box',
          borderRight: '1px solid #27272a',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
          {/* Logo row */}
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={logoImage} alt="ThinkMap Logo" style={{ height: '32px', width: 'auto' }} />
            </div>
            <button
              onClick={onClose}
              className="desktop-hide"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* ── LEARN TOPIC SEARCH ── */}
          <div
            style={{
              marginBottom: '1.75rem',
              padding: '1rem',
              backgroundColor: '#18181b',
              borderRadius: '12px',
              border: '1px solid #27272a',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                color: '#71717a',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.6rem',
              }}
            >
              ✦ AI Learning Guide
            </div>
            <form onSubmit={handleExplainTopic}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="What do you want to learn?"
                  disabled={explaining}
                  style={{
                    width: '100%',
                    padding: '0.6rem 2.4rem 0.6rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#09090b',
                    border: '1px solid #27272a',
                    color: '#f9fafb',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#ffffff30')}
                  onBlur={(e) => (e.target.style.borderColor = '#27272a')}
                />
                <button
                  type="submit"
                  disabled={explaining || !topicInput.trim()}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: explaining || !topicInput.trim() ? 'default' : 'pointer',
                    color: explaining ? '#fbbf24' : topicInput.trim() ? '#ffffff' : '#52525b',
                    display: 'flex',
                    padding: '2px',
                  }}
                >
                  {explaining ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={15} />}
                </button>
              </div>
              {explaining && (
                <p style={{ fontSize: '0.72rem', color: '#fbbf24', marginTop: '0.4rem', margin: '0.4rem 0 0 0' }}>
                  Generating your personalised overview...
                </p>
              )}
            </form>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            <button
              onClick={() => { navigate('/dashboard'); onClose?.(); }}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: isActive('/dashboard') ? '#27272a' : 'transparent',
                color: isActive('/dashboard') ? '#f9fafb' : '#71717a',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            <button
              onClick={() => { navigate('/create-book'); onClose?.(); }}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: isActive('/create-book') ? '#27272a' : 'transparent',
                color: isActive('/create-book') ? '#f9fafb' : '#71717a',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Database size={20} />
              Create Book
            </button>
            <button
              onClick={() => { navigate('/progress'); onClose?.(); }}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: isActive('/progress') ? '#27272a' : 'transparent',
                color: isActive('/progress') ? '#f9fafb' : '#71717a',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <BarChart2 size={20} />
              Progress
            </button>

            <div style={{ margin: '1rem 0', borderTop: '1px solid #27272a' }} />

            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('tutor-activate', {
                    detail: { concept: 'General Guidance', explanation: 'Help me master my concepts!' },
                  })
                );
                onClose?.();
              }}
              style={{
                textAlign: 'left',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
                color: '#ffffff',
                border: '1px solid #27272a',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                marginTop: '0.5rem',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#3f3f46';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 255, 255, 0.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#27272a';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
              }}
            >
              <div
                style={{
                  backgroundColor: '#27272a',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={20} />
              </div>
              AI Tutor
            </button>
          </nav>

          {/* Bottom section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: '0.5rem', padding: '0 1rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </p>

            <button
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#71717a',
                border: 'none',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Settings size={20} />
              Settings
            </button>

            <button
              onClick={() => {
                onLogout();
                navigate('/login');
                onClose?.();
              }}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#ef4444',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

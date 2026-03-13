import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Database, BarChart2, Settings, LogOut } from 'lucide-react';

function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#0f172a',
      color: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '2rem 1.5rem',
      boxSizing: 'border-box',
      borderRight: '1px solid #1e293b'
    }}>
      <div>
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#38bdf8' }}>ThinkMap AI</h2>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>Cognitive Lab</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              textAlign: 'left',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: isActive('/dashboard') ? '#1e293b' : 'transparent',
              color: isActive('/dashboard') ? '#f9fafb' : '#9ca3af',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/create-book')}
            style={{
              textAlign: 'left',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: isActive('/create-book') ? '#1e293b' : 'transparent',
              color: isActive('/create-book') ? '#f9fafb' : '#9ca3af',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Database size={20} />
            Create Book
          </button>
          <button 
            onClick={() => navigate('/progress')}
            style={{
              textAlign: 'left',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: isActive('/progress') ? '#1e293b' : 'transparent',
              color: isActive('/progress') ? '#f9fafb' : '#9ca3af',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <BarChart2 size={20} />
            Progress
          </button>

          <div style={{ margin: '1rem 0', borderTop: '1px solid #1e293b' }}></div>

          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('tutor-activate', { 
                detail: { concept: 'General Guidance', explanation: 'Help me master my concepts!' } 
              }));
            }}
            style={{
              textAlign: 'left',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              marginTop: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.border = '1px solid rgba(56, 189, 248, 0.6)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(56, 189, 248, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.border = '1px solid rgba(56, 189, 248, 0.3)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
          >
            <div style={{ 
              backgroundColor: 'rgba(56, 189, 248, 0.15)', 
              borderRadius: '8px', 
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} />
            </div>
            AI Tutor
          </button>
        </nav>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem', padding: '0 1rem' }}>
          {user?.email}
        </p>
        
        <button style={{
          textAlign: 'left',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          color: '#9ca3af',
          border: 'none',
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Settings size={20} />
          Settings
        </button>
        
        <button 
          onClick={() => {
            onLogout();
            navigate('/login');
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
            gap: '12px'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

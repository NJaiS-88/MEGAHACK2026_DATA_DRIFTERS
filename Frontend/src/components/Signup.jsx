import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Signup({ onSignup }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state

  const handleSubmit = async (e) => { // Made handleSubmit async
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      localStorage.setItem('thinkmap_token', data.token);
      localStorage.setItem('thinkmap_user', JSON.stringify(data.user));

      toast.success('Account created successfully!');
      onSignup(data.user);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: '#f9fafb',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#0f172a',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        border: '1px solid #1e293b'
      }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'center' }}>Create Account</h2>
        <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Join us today to accelerate your learning
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@company.com"
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                backgroundColor: '#020617',
                color: '#f9fafb',
                fontSize: '1rem',
                outline: 'none'
              }}
              required 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                backgroundColor: '#020617',
                color: '#f9fafb',
                fontSize: '1rem',
                outline: 'none'
              }}
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••"
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                backgroundColor: '#020617',
                color: '#f9fafb',
                fontSize: '1rem',
                outline: 'none'
              }}
              required 
            />
          </div>

          <button 
            type="submit"
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#38bdf8',
              color: '#020617',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Create Account
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#9ca3af' }}>
          Already have an account? {' '}
          <button 
            onClick={() => navigate('/login')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#38bdf8', 
              fontWeight: '600',
              cursor: 'pointer', 
              padding: 0,
              textDecoration: 'none'
            }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="academic-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <BookOpen size={22} />
          </div>
          <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Sign In to ScholarLens
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Access your research collections, reading queue, and synthesis history
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. researcher"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.9375rem', fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={16} /> Authenticate
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Login Section */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)', margin: '1.75rem -2.5rem -2.5rem', padding: '1.25rem 2.5rem', borderRadius: '0 0 8px 8px' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.75rem' }}>
            Demo Evaluation Credentials:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillCredentials('researcher', 'ResearcherPass123!')}
              style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: '4px', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Researcher User</div>
              <div style={{ color: 'var(--text-muted)' }}>researcher / ResearcherPass123!</div>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'AdminPass123!')}
              style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: '4px', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Admin User</div>
              <div style={{ color: 'var(--text-muted)' }}>admin / AdminPass123!</div>
            </button>
          </div>
        </div>

        {/* Register link */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Create researcher account
          </Link>
        </div>

      </div>
    </div>
  );
}


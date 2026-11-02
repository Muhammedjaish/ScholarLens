import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    institution: '',
    field_of_study: '',
    password: '',
    password_confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check form inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="academic-card" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <BookOpen size={22} />
          </div>
          <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Register Researcher Account
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Create an academic workspace to curate paper collections and generate structured syntheses
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="first_name"
                className="form-input"
                placeholder="Alex"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                className="form-input"
                placeholder="Rivera"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="arivera"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="alex.rivera@university.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Institution / University</label>
              <input
                type="text"
                name="institution"
                className="form-input"
                placeholder="Stanford / MIT"
                value={formData.institution}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Field of Study</label>
              <input
                type="text"
                name="field_of_study"
                className="form-input"
                placeholder="Computer Science / NLP"
                value={formData.field_of_study}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="password_confirm"
                className="form-input"
                placeholder="••••••••••••"
                value={formData.password_confirm}
                onChange={handleChange}
                required
              />
            </div>
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
                Registering...
              </>
            ) : (
              <>
                <UserPlus size={16} /> Complete Registration
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}


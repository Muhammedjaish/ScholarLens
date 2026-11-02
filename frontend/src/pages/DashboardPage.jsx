import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { papersAPI } from '../api/papers';
import { authAPI } from '../api/auth';
import { Clock, Building, GraduationCap, Edit3 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    institution: '',
    field_of_study: '',
    bio: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        institution: user.profile?.institution || '',
        field_of_study: user.profile?.field_of_study || '',
        bio: user.profile?.bio || '',
      });
      loadHistory();
    }
  }, [user, isAuthenticated, authLoading]);

  const loadHistory = async () => {
    try {
      const response = await papersAPI.getReadingHistory();
      if (response.success) {
        setHistory(response.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage('');
    try {
      await authAPI.updateProfile(editForm);
      await refreshUser();
      setIsEditing(false);
      setMessage('Profile updated successfully.');
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="portal-container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '2rem', height: '2rem' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading researcher workspace...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="portal-container">
        
        {message && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Researcher Profile Card */}
          <div className="academic-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
                {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-secondary btn-sm"
              >
                <Edit3 size={13} /> {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {!isEditing ? (
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                </h2>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  @{user.username} &bull; {user.email}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    <Building size={16} color="var(--accent-primary)" />
                    <span>{user.profile?.institution || 'Institution not specified'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    <GraduationCap size={16} color="var(--accent-primary)" />
                    <span>{user.profile?.field_of_study || 'Field of study not specified'}</span>
                  </div>
                </div>

                {user.profile?.bio && (
                  <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: '6px', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {user.profile.bio}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.institution}
                    onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Field of Study</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.field_of_study}
                    onChange={(e) => setEditForm({ ...editForm, field_of_study: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio / Academic Focus</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={savingProfile}
                  style={{ width: '100%' }}
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            )}
          </div>

          {/* Reading History */}
          <div className="academic-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Clock size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Reading History</h3>
            </div>

            {loadingHistory ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading recent activity...</p>
            ) : history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.map((record) => (
                  <div
                    key={record.id}
                    style={{
                      padding: '0.85rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span className="badge badge-neutral font-mono" style={{ fontSize: '0.6875rem' }}>
                        arXiv:{record.paper.arxiv_id}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(record.visited_at).toLocaleDateString()}
                      </span>
                    </div>

                    <Link
                      to={`/paper/${record.paper.arxiv_id}`}
                      style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none', display: 'block', marginBottom: '0.35rem' }}
                    >
                      {record.paper.title}
                    </Link>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Link
                        to={`/paper/${record.paper.arxiv_id}`}
                        style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        Read Synthesis &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No reading history yet. Papers you inspect will be automatically logged here.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}


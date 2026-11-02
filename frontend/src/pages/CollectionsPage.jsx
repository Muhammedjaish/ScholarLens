import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collectionsAPI } from '../api/collections';
import { useAuth } from '../context/AuthContext';
import { Bookmark, Plus, Trash2, ArrowRight, BookOpen, Lock, Globe } from 'lucide-react';

export default function CollectionsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColPublic, setNewColPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      loadCollections();
    }
  }, [isAuthenticated, authLoading]);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await collectionsAPI.listCollections();
      setCollections(data);
    } catch (err) {
      console.error(err);
      setError('Could not load research collections.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const created = await collectionsAPI.createCollection({
        name: newColName.trim(),
        description: newColDesc.trim(),
        is_public: newColPublic,
      });
      setCollections([created, ...collections]);
      setShowCreateModal(false);
      setNewColName('');
      setNewColDesc('');
      setNewColPublic(false);
    } catch (err) {
      setError(err.message || 'Failed to create collection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete collection "${name}"?`)) {
      try {
        await collectionsAPI.deleteCollection(id);
        setCollections(collections.filter(c => c.id !== id));
      } catch (err) {
        alert('Could not delete collection.');
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="portal-container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '2rem', height: '2rem' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading your research collections...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="portal-container">
        
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Research Collections
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Curate, track, and organize papers for your thesis, literature review, and seminars.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} /> New Collection
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {collections.map((col) => (
              <div key={col.id} className="academic-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {col.is_public ? <Globe size={11} /> : <Lock size={11} />}
                      {col.is_public ? 'Public' : 'Private'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {col.items_count} {col.items_count === 1 ? 'paper' : 'papers'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <Link to={`/collections/${col.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                      {col.name}
                    </Link>
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {col.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => handleDelete(col.id, col.name)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0.25rem' }}
                    title="Delete collection"
                  >
                    <Trash2 size={15} />
                  </button>

                  <Link to={`/collections/${col.id}`} className="btn btn-secondary btn-sm">
                    View Papers <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="academic-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <Bookmark size={36} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              No Collections Created Yet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
              Collections allow you to group papers by research theme, manage reading progress, and attach personalized research notes.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} /> Create Your First Collection
            </button>
          </div>
        )}

      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Create Research Collection</h3>
            </div>
            <form onSubmit={handleCreateCollection} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Collection Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Deep Reinforcement Learning Benchmarks"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Research Objective</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Core papers for chapter 2 literature survey and comparative tables."
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="colPublic"
                  checked={newColPublic}
                  onChange={(e) => setNewColPublic(e.target.checked)}
                />
                <label htmlFor="colPublic" style={{ fontSize: '0.875rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                  Make collection publicly viewable
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


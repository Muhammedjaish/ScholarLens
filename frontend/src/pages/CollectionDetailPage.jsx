import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collectionsAPI } from '../api/collections';
import { useAuth } from '../context/AuthContext';
import { Bookmark, ArrowLeft, Trash2, BookOpen, FileText } from 'lucide-react';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      loadCollection();
    }
  }, [id, isAuthenticated, authLoading]);

  const loadCollection = async () => {
    setLoading(true);
    try {
      const data = await collectionsAPI.getCollectionDetail(id);
      setCollection(data);
    } catch (err) {
      console.error(err);
      setError('Could not load collection details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (paperId, newStatus) => {
    try {
      await collectionsAPI.addItem(id, {
        paper_id: paperId,
        reading_status: newStatus
      });
      loadCollection();
    } catch (err) {
      alert('Could not update reading status.');
    }
  };

  const handleRemoveItem = async (paperId, title) => {
    if (window.confirm(`Remove "${title}" from this collection?`)) {
      try {
        await collectionsAPI.removeItem(id, paperId);
        loadCollection();
      } catch (err) {
        alert('Could not remove paper.');
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="portal-container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '2rem', height: '2rem' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading collection literature...</p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="portal-container" style={{ padding: '4rem 0', maxWidth: '640px' }}>
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error || 'Collection not found.'}
        </div>
        <Link to="/collections" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Collections
        </Link>
      </div>
    );
  }

  const items = collection.items || [];
  const filteredItems = filterStatus === 'all'
    ? items
    : items.filter(item => item.reading_status === filterStatus);

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="portal-container">
        
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
            <ArrowLeft size={15} /> Back to All Collections
          </Link>
        </div>

        {/* Collection Header Card */}
        <div className="academic-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Bookmark size={20} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Research Collection
            </span>
            <span className="badge badge-neutral" style={{ marginLeft: '0.5rem' }}>
              {collection.is_public ? 'Public' : 'Private'}
            </span>
          </div>

          <h1 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            {collection.name}
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '720px', marginBottom: '1.5rem' }}>
            {collection.description || 'No description provided.'}
          </p>

          {/* Reading Status Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.5rem' }}>
              Status Filter:
            </span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilterStatus('to_read')}
              className={`btn btn-sm ${filterStatus === 'to_read' ? 'btn-primary' : 'btn-secondary'}`}
            >
              To Read ({items.filter(i => i.reading_status === 'to_read').length})
            </button>
            <button
              onClick={() => setFilterStatus('reading')}
              className={`btn btn-sm ${filterStatus === 'reading' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Reading ({items.filter(i => i.reading_status === 'reading').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`btn btn-sm ${filterStatus === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Completed ({items.filter(i => i.reading_status === 'completed').length})
            </button>
          </div>

        </div>

        {/* Papers in Collection */}
        {filteredItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredItems.map((item) => {
              const paper = item.paper;
              return (
                <div key={item.id} className="academic-card" style={{ padding: '1.5rem' }}>
                  
                  {/* Top Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-category">{paper.category}</span>
                      <span className="badge badge-neutral font-mono">arXiv:{paper.arxiv_id}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {/* Reading Status Selector */}
                      <select
                        value={item.reading_status}
                        onChange={(e) => handleStatusChange(paper.id, e.target.value)}
                        className="form-select"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem', width: 'auto' }}
                      >
                        <option value="to_read">To Read</option>
                        <option value="reading">Reading</option>
                        <option value="completed">Completed</option>
                      </select>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(paper.id, paper.title)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
                        title="Remove from collection"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <Link to={`/paper/${paper.arxiv_id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                      {paper.title}
                    </Link>
                  </h3>

                  {/* Research Notes Section */}
                  {item.notes && (
                    <div style={{ backgroundColor: 'var(--bg-muted)', borderLeft: '3px solid var(--accent-primary)', padding: '0.75rem 1rem', borderRadius: '4px', margin: '0.85rem 0', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                      <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                        Research Notes:
                      </strong>
                      {item.notes}
                    </div>
                  )}

                  {/* Abstract Preview */}
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {paper.abstract}
                  </p>

                  {/* Bottom Action Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    {paper.pdf_url && (
                      <a
                        href={paper.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <FileText size={14} /> Official PDF
                      </a>
                    )}
                    <Link to={`/paper/${paper.arxiv_id}`} className="btn btn-outline-primary btn-sm">
                      Read Synthesis &rarr;
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="academic-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
            <BookOpen size={32} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              No papers found for this status
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Add papers to this collection by searching on the home page and clicking "Save to Collection".
            </p>
            <Link to="/" className="btn btn-primary btn-sm">
              Discover Papers
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}


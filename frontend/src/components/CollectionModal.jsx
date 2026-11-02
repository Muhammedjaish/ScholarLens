import React, { useState, useEffect } from 'react';
import { collectionsAPI } from '../api/collections';
import { X, Bookmark, Check } from 'lucide-react';

export default function CollectionModal({ paper, isOpen, onClose, onSuccess }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [readingStatus, setReadingStatus] = useState('to_read');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen]);

  const loadCollections = async () => {
    try {
      const data = await collectionsAPI.listCollections();
      setCollections(data);
      if (data.length > 0) {
        setSelectedCollectionId(data[0].id);
      } else {
        setIsCreatingNew(true);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load your collections.');
    }
  };

  if (!isOpen || !paper) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let targetCollectionId = selectedCollectionId;

      if (isCreatingNew) {
        if (!newCollectionName.trim()) {
          setError('Collection name is required.');
          setLoading(false);
          return;
        }
        const created = await collectionsAPI.createCollection({
          name: newCollectionName.trim(),
          description: 'Created via paper quick-save'
        });
        targetCollectionId = created.id;
      }

      await collectionsAPI.addItem(targetCollectionId, {
        paper_id: paper.id,
        arxiv_id: paper.arxiv_id,
        reading_status: readingStatus,
        notes: notes.trim(),
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save paper to collection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bookmark size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Save to Research Collection</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Paper Title Preview */}
          <div style={{ backgroundColor: 'var(--bg-muted)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>
              {paper.title}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              arXiv:{paper.arxiv_id}
            </span>
          </div>

          {/* Existing vs New Collection Toggle */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Target Collection</label>
              <button
                type="button"
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                {isCreatingNew ? 'Choose existing collection' : '+ Create new collection'}
              </button>
            </div>

            {isCreatingNew ? (
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Attention Mechanisms, Thesis Chapter 1"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                autoFocus
                required
              />
            ) : (
              <select
                className="form-select"
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                required
              >
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} ({col.items_count || 0} papers)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Reading Status */}
          <div className="form-group">
            <label className="form-label">Reading Status</label>
            <select
              className="form-select"
              value={readingStatus}
              onChange={(e) => setReadingStatus(e.target.value)}
            >
              <option value="to_read">To Read (Queue)</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed / Annotated</option>
            </select>
          </div>

          {/* Research Notes */}
          <div className="form-group">
            <label className="form-label">Research Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Benchmark results to compare in Section 4, relevant to thesis hypothesis..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} /> Save Paper
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}


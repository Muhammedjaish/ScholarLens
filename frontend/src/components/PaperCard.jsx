import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Users, ThumbsUp, BookmarkPlus } from 'lucide-react';

export default function PaperCard({ paper, onAddToCollection }) {
  const authorNames = paper.authors && paper.authors.length > 0
    ? paper.authors.map(a => a.name).slice(0, 3).join(', ') + (paper.authors.length > 3 ? ' et al.' : '')
    : 'Unknown Authors';

  return (
    <article className="academic-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      {/* Top Meta Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-category">
            {paper.category || 'General CS'}
          </span>
          <span className="badge badge-neutral font-mono">
            arXiv:{paper.arxiv_id}
          </span>
        </div>

        {paper.published_date && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Calendar size={13} />
            <span>{paper.published_date}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35, marginBottom: '0.5rem' }}>
        <Link
          to={`/paper/${paper.arxiv_id}`}
          style={{ color: 'var(--text-main)', textDecoration: 'none' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-main)'}
        >
          {paper.title}
        </Link>
      </h3>

      {/* Authors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        <Users size={13} style={{ flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {authorNames}
        </span>
      </div>

      {/* Abstract Excerpt */}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {paper.abstract}
      </p>

      {/* Card Actions Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Vote Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <ThumbsUp size={13} />
            <span style={{ fontWeight: 600 }}>{paper.vote_score ?? 0}</span>
          </div>

          {/* Synthesis status */}
          {paper.has_summary ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              ✓ Synthesis Ready
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
              Abstract only
            </span>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onAddToCollection && (
            <button
              onClick={() => onAddToCollection(paper)}
              className="btn btn-secondary btn-sm"
              title="Add to research collection"
            >
              <BookmarkPlus size={14} /> Save
            </button>
          )}

          {paper.pdf_url && (
            <a
              href={paper.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              title="Open official arXiv PDF in new tab"
            >
              <FileText size={14} /> PDF
            </a>
          )}

          <Link to={`/paper/${paper.arxiv_id}`} className="btn btn-outline-primary btn-sm">
            Read Synthesis &rarr;
          </Link>
        </div>

      </div>
    </article>
  );
}


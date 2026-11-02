import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { papersAPI } from '../api/papers';
import SummaryViewer from '../components/SummaryViewer';
import CollectionModal from '../components/CollectionModal';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Calendar, Users, ExternalLink, ThumbsUp, ThumbsDown,
  BookmarkPlus, ArrowLeft, RefreshCw
} from 'lucide-react';

export default function PaperDetailPage() {
  const { arxivId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRawAbstract, setShowRawAbstract] = useState(false);

  useEffect(() => {
    loadPaper();
  }, [arxivId]);

  const loadPaper = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await papersAPI.getPaperDetail(arxivId);
      if (response.success) {
        setPaper(response.paper);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Paper could not be retrieved.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummarizing(true);
    setError('');
    try {
      const response = await papersAPI.generateSummary(arxivId);
      if (response.success && response.paper) {
        setPaper(response.paper);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate structured synthesis.');
    } finally {
      setSummarizing(false);
    }
  };

  const handleVote = async (value) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setVoting(true);
    try {
      const response = await papersAPI.votePaper(arxivId, value);
      if (response.success) {
        setPaper((prev) => ({
          ...prev,
          vote_score: response.vote_score,
          user_vote: response.user_vote,
        }));
      }
    } catch (err) {
      console.error(err);
      setError('Could not record vote.');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="portal-container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '2.5rem', height: '2.5rem' }}></div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Querying arXiv & Local Repositories...
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Retrieving paper metadata, authors, and classification for arXiv:{arxivId}
        </p>
      </div>
    );
  }

  if (error && !paper) {
    return (
      <div className="portal-container" style={{ padding: '4rem 0', maxWidth: '640px' }}>
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Search
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="portal-container">
        
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <span style={{ color: 'var(--text-subtle)' }}>/</span>
          <span style={{ color: 'var(--text-muted)' }}>Papers</span>
          <span style={{ color: 'var(--text-subtle)' }}>/</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>arXiv:{paper.arxiv_id}</span>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Paper Main Header Card */}
        <div className="academic-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          
          {/* Metadata Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-category">
                {paper.category || 'Computer Science'}
              </span>
              <span className="badge badge-neutral font-mono">
                arXiv:{paper.arxiv_id}
              </span>
              {paper.doi && (
                <span className="badge badge-neutral">
                  DOI: {paper.doi}
                </span>
              )}
            </div>

            {paper.published_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <Calendar size={14} />
                <span>Published: {paper.published_date}</span>
              </div>
            )}
          </div>

          {/* Paper Title */}
          <h1 className="font-serif" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.3, marginBottom: '1.25rem' }}>
            {paper.title}
          </h1>

          {/* Authors List */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
              <Users size={16} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
              <div>
                {paper.authors && paper.authors.length > 0 ? (
                  paper.authors.map((author, index) => (
                    <span key={author.id || index}>
                      <strong style={{ color: 'var(--text-main)' }}>{author.name}</strong>
                      {author.affiliation && <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}> ({author.affiliation})</span>}
                      {index < paper.authors.length - 1 && ', '}
                    </span>
                  ))
                ) : (
                  <span>Authors not specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            
            {/* Left: Voting and Feedback */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-strong)', borderRadius: '6px', overflow: 'hidden' }}>
                <button
                  onClick={() => handleVote(1)}
                  disabled={voting}
                  style={{
                    padding: '0.45rem 0.75rem',
                    background: paper.user_vote === 1 ? 'var(--accent-primary-light)' : '#ffffff',
                    color: paper.user_vote === 1 ? 'var(--accent-primary)' : 'var(--text-muted)',
                    border: 'none',
                    borderRight: '1px solid var(--border-strong)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600
                  }}
                  title="Upvote paper"
                >
                  <ThumbsUp size={14} />
                  <span>{paper.vote_score}</span>
                </button>
                <button
                  onClick={() => handleVote(-1)}
                  disabled={voting}
                  style={{
                    padding: '0.45rem 0.65rem',
                    background: paper.user_vote === -1 ? 'var(--accent-rose-light)' : '#ffffff',
                    color: paper.user_vote === -1 ? 'var(--accent-rose)' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  title="Downvote paper"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>

              {/* Add to Collection Button */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setIsModalOpen(true);
                  }
                }}
                className="btn btn-secondary btn-sm"
              >
                <BookmarkPlus size={15} /> Save to Collection
              </button>
            </div>

            {/* Right: Synthesis and External Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              
              <button
                onClick={handleGenerateSummary}
                disabled={summarizing}
                className="btn btn-primary btn-sm"
              >
                {summarizing ? (
                  <>
                    <div className="spinner" style={{ width: '0.9rem', height: '0.9rem' }}></div>
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    {paper.summary ? 'Regenerate Synthesis' : 'Generate Structured Synthesis'}
                  </>
                )}
              </button>

              {paper.pdf_url && (
                <a
                  href={paper.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <FileText size={15} /> Official arXiv PDF <ExternalLink size={12} />
                </a>
              )}
            </div>

          </div>

        </div>

        {/* Structured Synthesis Main View */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Structured Academic Synthesis
            </h2>
            <button
              onClick={() => setShowRawAbstract(!showRawAbstract)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 }}
            >
              {showRawAbstract ? 'Hide Raw Abstract' : 'View Original arXiv Abstract'}
            </button>
          </div>

          {/* Collapsible Raw Abstract */}
          {showRawAbstract && (
            <div className="academic-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#fafafa', borderLeft: '3px solid var(--border-strong)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Original Raw Abstract (arXiv.org)
              </div>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                {paper.abstract}
              </p>
            </div>
          )}

          <SummaryViewer
            summary={paper.summary}
            bibtex={paper.bibtex}
            paperTitle={paper.title}
          />
        </div>

      </div>

      {/* Collection Modal */}
      <CollectionModal
        paper={paper}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          alert('Paper successfully saved to collection.');
        }}
      />
    </div>
  );
}


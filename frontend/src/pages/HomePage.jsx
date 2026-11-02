import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { papersAPI } from '../api/papers';
import PaperCard from '../components/PaperCard';
import CollectionModal from '../components/CollectionModal';
import { useAuth } from '../context/AuthContext';
import { Search, BookMarked, Cpu, FileCheck, Database } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPapers, setRecentPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPaperForModal, setSelectedPaperForModal] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentPapers();
  }, []);

  const loadRecentPapers = async () => {
    try {
      const response = await papersAPI.searchPapers('');
      if (response.success) {
        setRecentPapers(response.results);
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend paper service. Please ensure Django is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickLookup = (id) => {
    navigate(`/paper/${id}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '4.5rem 0 3.5rem' }}>
        <div className="portal-container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          
          

          <h1 className="font-serif" style={{ fontSize: '2.75rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Academic Literature Research & Synthesis Portal
          </h1>

          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2.25rem' }}>
            Transform complex scientific preprints into structured, multi-dimensional executive summaries, key empirical findings, and BibTeX citations in seconds.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '680px', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-md)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-strong)' }}>
            <div style={{ position: 'relative', flex: 1, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '1rem' }} />
              <input
                type="text"
                placeholder="Search by topic, keyword, author, or arXiv ID (e.g. 1706.03762)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 2.85rem', border: 'none', outline: 'none', fontSize: '1rem', fontFamily: 'var(--font-sans)', color: 'var(--text-main)' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: 0, padding: '0 1.75rem', fontSize: '0.9375rem', fontWeight: 600 }}
            >
              Analyze Paper
            </button>
          </form>

          {/* Quick-try chips */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>Seminal Papers:</span>
            <button
              onClick={() => handleQuickLookup('1706.03762')}
              style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--accent-primary)', backgroundColor: 'var(--bg-surface)' }}
            >
              1706.03762 (Transformers)
            </button>
            <button
              onClick={() => handleQuickLookup('1512.03385')}
              style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--accent-primary)', backgroundColor: 'var(--bg-surface)' }}
            >
              1512.03385 (ResNet)
            </button>
            <button
              onClick={() => handleQuickLookup('1810.04805')}
              style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--accent-primary)', backgroundColor: 'var(--bg-surface)' }}
            >
              1810.04805 (BERT)
            </button>
          </div>

        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section style={{ padding: '3.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="portal-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            
            <div className="academic-card" style={{ padding: '1.5rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '6px', backgroundColor: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Cpu size={20} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Structured NLP Synthesis</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Breaks down scientific abstracts into 5 clear sections: Executive Summary, Key Empirical Findings, Methodology, Layperson Explanation, and Known Limitations.
              </p>
            </div>

            <div className="academic-card" style={{ padding: '1.5rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '6px', backgroundColor: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Database size={20} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Live arXiv Ingestion</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Fetches raw Atom feeds directly from arXiv.org, automatically parsing author affiliations, categories, DOI references, and full-text PDF links.
              </p>
            </div>

            <div className="academic-card" style={{ padding: '1.5rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '6px', backgroundColor: 'var(--accent-amber-light)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <BookMarked size={20} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Research Collections</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Organize literature into custom reading queues. Track reading statuses (To Read, In Progress, Completed) and annotate with your thesis research notes.
              </p>
            </div>

            <div className="academic-card" style={{ padding: '1.5rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '6px', backgroundColor: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FileCheck size={20} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>BibTeX Export</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Instant citation formatting ready to paste into LaTeX, Overleaf, or Zotero, strictly adhering to academic publication standards.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Featured & Recent Literature */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="portal-container">
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Indexed Literature & Benchmark Studies
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Pre-indexed foundation papers with complete structured syntheses available immediately.
              </p>
            </div>
            <Link to="/search?q=machine+learning" className="btn btn-secondary btn-sm">
              Explore More Papers &rarr;
            </Link>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem', width: '2rem', height: '2rem' }}></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading academic index...</p>
            </div>
          ) : recentPapers.length > 0 ? (
            <div>
              {recentPapers.map((paper) => (
                <PaperCard
                  key={paper.id || paper.arxiv_id}
                  paper={paper}
                  onAddToCollection={(p) => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      setSelectedPaperForModal(p);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="academic-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No papers found in local database. Try searching above!</p>
            </div>
          )}

        </div>
      </section>

      {/* Collection Modal */}
      {selectedPaperForModal && (
        <CollectionModal
          paper={selectedPaperForModal}
          isOpen={!!selectedPaperForModal}
          onClose={() => setSelectedPaperForModal(null)}
          onSuccess={() => {
            alert('Paper saved to your collection successfully.');
          }}
        />
      )}
    </div>
  );
}


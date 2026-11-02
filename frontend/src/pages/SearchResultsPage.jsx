import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { papersAPI } from '../api/papers';
import PaperCard from '../components/PaperCard';
import CollectionModal from '../components/CollectionModal';
import { useAuth } from '../context/AuthContext';
import { Search, BookOpen, AlertCircle } from 'lucide-react';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [inputQuery, setInputQuery] = useState(query);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPaperForModal, setSelectedPaperForModal] = useState(null);

  useEffect(() => {
    setInputQuery(query);
    if (query) {
      executeSearch(query);
    } else {
      setPapers([]);
      setLoading(false);
    }
  }, [query]);

  const executeSearch = async (searchTerm) => {
    setLoading(true);
    setError('');
    try {
      const response = await papersAPI.searchPapers(searchTerm);
      if (response.success) {
        setPapers(response.results);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to execute academic search.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setSearchParams({ q: inputQuery.trim() });
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="portal-container">
        
        {/* Search Input Bar */}
        <div style={{ maxWidth: '780px', margin: '0 auto 2.5rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', boxShadow: 'var(--shadow-sm)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-strong)' }}>
            <div style={{ position: 'relative', flex: 1, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '1rem' }} />
              <input
                type="text"
                placeholder="Search arXiv papers or enter specific arXiv ID..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: 'none', outline: 'none', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', color: 'var(--text-main)' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: 0, padding: '0 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}
            >
              Search
            </button>
          </form>

          {/* Results Summary Info */}
          {query && !loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <span>
                Found <strong>{papers.length}</strong> matching papers for "<strong>{query}</strong>"
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                Indexed via arXiv API & Database
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error" style={{ maxWidth: '780px', margin: '0 auto 1.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Results List */}
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="spinner" style={{ margin: '0 auto 1.25rem', width: '2rem', height: '2rem' }}></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                Querying academic databases and arXiv preprints...
              </p>
            </div>
          ) : papers.length > 0 ? (
            <div>
              {papers.map((paper) => (
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
          ) : query ? (
            <div className="academic-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <BookOpen size={32} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                No matching academic papers found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                Try searching by a broader keyword, an author's last name, or entering an exact arXiv identifier like <code>1706.03762</code>.
              </p>
            </div>
          ) : null}
        </div>

      </div>

      {/* Collection Modal */}
      {selectedPaperForModal && (
        <CollectionModal
          paper={selectedPaperForModal}
          isOpen={!!selectedPaperForModal}
          onClose={() => setSelectedPaperForModal(null)}
          onSuccess={() => {
            alert('Paper saved to your collection.');
          }}
        />
      )}
    </div>
  );
}


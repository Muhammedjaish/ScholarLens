import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Bookmark, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div className="portal-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', color: 'var(--text-main)' }}>
          <div style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff', padding: '0.45rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={19} />
          </div>
          <div>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'block', lineHeight: 1.2 }}>ScholarLens</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Research Portal</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            <Search size={15} /> Discover
          </Link>
          <Link to="/collections" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            <Bookmark size={15} /> Collections
          </Link>
        </nav>

        {/* User Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                  {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                </div>
                <span>{user.first_name || user.username}</span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '120%',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                    minWidth: '220px',
                    padding: '0.5rem 0',
                    zIndex: 50
                  }}
                >
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.first_name} {user.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{user.username}</div>
                    {user.profile?.institution && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
                        {user.profile.institution}
                      </div>
                    )}
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-main)',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <UserIcon size={15} /> Researcher Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      color: 'var(--accent-rose)',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-rose-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}


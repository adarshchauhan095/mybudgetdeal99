import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  Compass,
  Zap,
  Layers,
  FolderTree,
  ShieldCheck,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const { settings } = useSite();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearchQuery.trim())}`);
      setNavSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'var(--nav-height)',
      background: 'rgba(11, 15, 25, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      zIndex: 1000
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(249, 115, 22, 0.4)'
          }}>
            <Compass size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 60%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
              lineHeight: 1.1
            }}>
              {settings.siteName}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Amazon Discoveries
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            flex: 1,
            maxWidth: '460px',
            position: 'relative',
            display: 'none'
          }}
          className="desktop-search-form"
        >
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search products, study table setup, car kit, brands..."
            value={navSearchQuery}
            onChange={(e) => setNavSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.75rem',
              paddingRight: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
        </form>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav-links">
          <Link
            to="/collections"
            className={`btn btn-sm ${isActive('/collections') ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            <Layers size={16} />
            <span>Setups</span>
          </Link>
          <Link
            to="/categories"
            className={`btn btn-sm ${isActive('/categories') ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            <FolderTree size={16} />
            <span>Categories</span>
          </Link>
          <Link
            to="/deals"
            className={`btn btn-sm ${isActive('/deals') ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', color: '#f87171' }}
          >
            <Zap size={16} />
            <span>Deals</span>
          </Link>

          {isAdmin ? (
            <Link to="/admin" className="btn btn-sm btn-secondary" style={{ marginLeft: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--accent-green)" />
              <span>Admin</span>
            </Link>
          ) : (
            <Link to="/admin" title="Admin Portal" style={{ color: 'var(--text-muted)', padding: '0.4rem', borderRadius: '6px' }}>
              <Lock size={16} />
            </Link>
          )}
        </nav>

        {/* Mobile Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="mobile-nav-toggle">
          <button
            onClick={() => navigate('/search')}
            style={{ color: 'var(--text-primary)', padding: '0.5rem' }}
            aria-label="Search"
          >
            <Search size={22} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: 'var(--text-primary)', padding: '0.5rem' }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 'var(--nav-height)',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(11, 15, 25, 0.98)',
          backdropFilter: 'blur(20px)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease forwards'
        }}>
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search products & setups..."
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.06)'
              }}
            />
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Link
              to="/collections"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 600
              }}
            >
              <Layers size={18} color="var(--accent-primary)" />
              Curated Setups & Groups
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 600
              }}
            >
              <FolderTree size={18} color="var(--accent-blue)" />
              All Categories
            </Link>
            <Link
              to="/deals"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 600
              }}
            >
              <Zap size={18} color="#f87171" />
              Verified Amazon Deals
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 600
              }}
            >
              <Compass size={18} color="var(--accent-green)" />
              All Products
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={18} color="var(--accent-primary)" />
              Admin Portal
            </Link>
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Amazon Associates Discovery Platform
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 820px) {
          .desktop-search-form { display: block !important; }
          .desktop-nav-links { display: flex !important; }
          .mobile-nav-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};

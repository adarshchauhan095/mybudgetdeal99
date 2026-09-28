import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Layers,
  FolderTree,
  Zap,
  Image as ImageIcon,
  Sliders,
  BarChart3,
  Settings,
  History,
  Activity,
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';

export const AdminLayout: React.FC = () => {
  const { signOut, isAdmin } = useAuth();
  const { settings } = useSite();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
          Authentication Required
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Please sign in to access the administration dashboard.
        </p>
        <Link to="/admin/login" className="btn btn-primary">
          Go to Sign In
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Add Product (URL)', path: '/admin/products/new', icon: PlusCircle, highlight: true },
    { label: 'Curated Setups', path: '/admin/collections', icon: Layers },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Deals Manager', path: '/admin/deals', icon: Zap },
    { label: 'Banner Carousel', path: '/admin/banners', icon: ImageIcon },
    { label: 'Homepage Builder', path: '/admin/homepage', icon: Sliders },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Affiliate & Settings', path: '/admin/settings', icon: Settings },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: History },
    { label: 'System Health', path: '/admin/health', icon: Activity }
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--nav-height))' }}>
      
      {/* Admin Sidebar */}
      <aside style={{
        width: '260px',
        background: '#0d1322',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        gap: '0.35rem',
        flexShrink: 0
      }}
      className="admin-sidebar"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem 1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>Admin Control Center</span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: active ? 700 : 500,
                background: active
                  ? 'var(--accent-primary)'
                  : item.highlight
                  ? 'rgba(249, 115, 22, 0.12)'
                  : 'transparent',
                color: active
                  ? '#ffffff'
                  : item.highlight
                  ? 'var(--accent-primary)'
                  : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}
          >
            <ExternalLink size={16} />
            <span>View Live Site</span>
          </a>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: '#f87171',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace Container */}
      <main style={{ flex: 1, padding: '2rem', overflowX: 'auto' }}>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar {
            width: 200px !important;
          }
        }
        @media (max-width: 720px) {
          .admin-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

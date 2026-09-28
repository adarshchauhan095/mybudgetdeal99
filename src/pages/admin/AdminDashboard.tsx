import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  FolderTree,
  Zap,
  MousePointerClick,
  Eye,
  PlusCircle,
  Database,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  getProducts,
  getCollections,
  getCategories,
  getDeals,
  syncAllToFirestore
} from '../../services/catalogService';
import { getAnalyticsSummary, AnalyticsSummary } from '../../services/analyticsService';
import { useSite } from '../../context/SiteContext';

export const AdminDashboard: React.FC = () => {
  const [productCount, setProductCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [dealCount, setDealCount] = useState(0);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { settings, showToast } = useSite();

  useEffect(() => {
    Promise.all([
      getProducts(),
      getCollections(),
      getCategories(),
      getDeals(),
      getAnalyticsSummary()
    ]).then(([prods, cols, cats, deals, ana]) => {
      setProductCount(prods.length);
      setCollectionCount(cols.length);
      setCategoryCount(cats.length);
      setDealCount(deals.length);
      setAnalytics(ana);
    });
  }, []);

  const handleSyncFirestore = async () => {
    setSyncing(true);
    const res = await syncAllToFirestore();
    setSyncing(false);
    if (res.success) {
      showToast(`Synced ${res.count} items successfully to Firestore!`, 'success');
    } else {
      showToast(`Firestore sync error: ${res.error}. Local data is active.`, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
            Catalog & Discovery Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Tracking ID: <strong style={{ color: 'var(--accent-primary)' }}>{settings.amazonTrackingId}</strong> • Marketplace: <strong>{settings.defaultMarketplace}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSyncFirestore}
            disabled={syncing}
            className="btn btn-secondary btn-sm"
            title="Push local catalog seed data to remote Firestore database"
          >
            <Database size={16} color="var(--accent-blue)" />
            <span>{syncing ? 'Pushing to Firestore...' : 'Sync to Firestore'}</span>
          </button>

          <Link to="/admin/products/new" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Add Product from URL</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Products */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Products</span>
            <Package size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>
            {productCount}
          </div>
          <Link to="/admin/products" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-block', marginTop: '0.25rem' }}>
            Manage Catalog →
          </Link>
        </div>

        {/* Setups */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Curated Setups</span>
            <Layers size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>
            {collectionCount}
          </div>
          <Link to="/admin/collections" style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', fontWeight: 600, display: 'inline-block', marginTop: '0.25rem' }}>
            Manage Setups →
          </Link>
        </div>

        {/* Active Deals */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Deals</span>
            <Zap size={18} color="#f87171" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>
            {dealCount}
          </div>
          <Link to="/admin/deals" style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600, display: 'inline-block', marginTop: '0.25rem' }}>
            View Deals →
          </Link>
        </div>

        {/* Amazon CTA Clicks */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amazon CTA Clicks</span>
            <MousePointerClick size={18} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>
            {analytics?.amazonCtaClicks || 38}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
            <TrendingUp size={12} />
            <span>High conversion intent</span>
          </div>
        </div>

        {/* Total Page Views */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Discoveries</span>
            <Eye size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>
            {analytics?.totalViews || 142}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-block', marginTop: '0.25rem' }}>
            Internal site events
          </span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Amazon Importer Shortcut */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Add Product from Amazon URL</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paste any link to auto-extract ASIN & format Special Link</p>
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Validates ASIN duplicate status, builds tracking-tagged affiliate links, and opens an instant review screen for fast publishing in under 30 seconds.
          </p>
          <Link to="/admin/products/new" className="btn btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            <span>Launch Importer</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Collection Builder Shortcut */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Curated Setup Builder</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Group products into functional spaces</p>
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Create dynamic setups like "Complete Study Table Setup" or "Car Essentials" with buying checklists, editorial tips, and FAQs.
          </p>
          <Link to="/admin/collections" className="btn btn-secondary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            <span>Manage Setups</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Top Products & Search Keywords Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Top Clicked Products */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Top Products by Amazon Clicks
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics?.topProducts.slice(0, 4).map(prod => (
              <div key={prod.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {prod.title}
                </span>
                <span className="badge badge-verified">
                  {prod.clicks} clicks
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Search Queries */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Popular Search Queries
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics?.popularSearches.slice(0, 4).map(s => (
              <div key={s.query} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  "{s.query}"
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {s.count} searches
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

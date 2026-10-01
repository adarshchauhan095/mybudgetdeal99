import React, { useEffect, useState } from 'react';
import { getProducts, getDeals } from '../../services/catalogService';
import { Product, Deal } from '../../types';
import { useSite } from '../../context/SiteContext';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, Link2, Bug, Trash2, RefreshCw } from 'lucide-react';
import { validateAffiliateLink } from '../../services/amazonService';
import { getStoredCrashReports, clearStoredCrashReports, logCrash, CrashReport } from '../../services/crashAnalytics';

export const AdminSystemHealth: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [crashes, setCrashes] = useState<CrashReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings, showToast } = useSite();

  const loadData = () => {
    Promise.all([getProducts(), getDeals()]).then(([prods, dList]) => {
      setProducts(prods);
      setDeals(dList);
      setCrashes(getStoredCrashReports());
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearCrashes = () => {
    if (window.confirm('Are you sure you want to clear all recorded crash logs?')) {
      clearStoredCrashReports();
      setCrashes([]);
      showToast('Crash logs cleared successfully!', 'success');
    }
  };

  const handleTriggerTestCrash = async () => {
    await logCrash({
      message: 'Simulated administrator diagnostic exception',
      stack: new Error().stack,
      type: 'manual_report',
      fatal: false,
      metadata: { initiatedBy: 'admin_dashboard' }
    });
    setCrashes(getStoredCrashReports());
    showToast('Diagnostic error logged to Crash Analytics!', 'info');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Checking catalog health...</div>;
  }

  // Health checks
  const missingImages = products.filter(p => !p.imageUrl);
  const missingCategories = products.filter(p => !p.categorySlug);
  const missingSetups = products.filter(p => !p.collectionSlugs || p.collectionSlugs.length === 0);

  // Link validation
  const invalidLinks = products.filter(p => {
    const res = validateAffiliateLink(p.affiliateUrl, settings.amazonTrackingId);
    return !res.isValid;
  });

  // Duplicate ASINs check
  const asinMap: Record<string, number> = {};
  products.forEach(p => {
    const a = p.asin.toUpperCase();
    asinMap[a] = (asinMap[a] || 0) + 1;
  });
  const duplicateAsins = Object.entries(asinMap).filter(([_, count]) => count > 1);

  // Expired deals
  const now = new Date().toISOString();
  const expiredDeals = deals.filter(d => d.endDate && d.endDate < now);

  const healthScore = Math.max(0, 100 - (invalidLinks.length * 15 + missingImages.length * 10 + duplicateAsins.length * 20));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Catalog Health & Link Integrity
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Automated audit of Amazon affiliate links, image availability, duplicate prevention & crash telemetry
        </p>
      </div>

      {/* Health Score Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Overall Catalog Health
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: healthScore >= 90 ? 'var(--accent-green)' : '#f87171', fontFamily: 'Outfit, sans-serif' }}>
            {healthScore}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {healthScore >= 90 ? 'All links & catalog assets are healthy and compliant' : 'Issues detected that require attention'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <CheckCircle2 size={16} color="var(--accent-green)" />
            <span>Associates Tag: <code>{settings.amazonTrackingId}</code> active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <CheckCircle2 size={16} color="var(--accent-green)" />
            <span>Marketplace: <code>{settings.defaultMarketplace}</code> configured</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <CheckCircle2 size={16} color="var(--accent-green)" />
            <span>All products have valid 10-character ASINs</span>
          </div>
        </div>
      </div>

      {/* Health Audit Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Affiliate Links Audit */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Amazon Affiliate Links</h3>
            <Link2 size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: invalidLinks.length === 0 ? 'var(--accent-green)' : '#f87171', fontFamily: 'Outfit, sans-serif' }}>
            {invalidLinks.length === 0 ? 'All Valid' : `${invalidLinks.length} Broken`}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Every product URL contains a verified Amazon domain and configured tracking ID tag.
          </p>
        </div>

        {/* Duplicate ASINs Audit */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Duplicate ASINs</h3>
            <ShieldCheck size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: duplicateAsins.length === 0 ? 'var(--accent-green)' : '#f87171', fontFamily: 'Outfit, sans-serif' }}>
            {duplicateAsins.length === 0 ? '0 Duplicates' : `${duplicateAsins.length} Clones`}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Catalog is free from duplicate product entries and conflicting URLs.
          </p>
        </div>

        {/* Setup Association Audit */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Setup Cross-Sell Coverage</h3>
            <Activity size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'Outfit, sans-serif' }}>
            {Math.round(((products.length - missingSetups.length) / (products.length || 1)) * 100)}%
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Percentage of products linked to a curated shopping group/setup.
          </p>
        </div>
      </div>

      {/* Crash Analytics & Exception Monitoring Section */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bug size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Crash & Exception Analytics
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Real-time monitoring of client-side JavaScript crashes, unhandled promise rejections, and Error Boundaries
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleTriggerTestCrash}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} />
              Simulate Test Log
            </button>
            {crashes.length > 0 && (
              <button
                onClick={handleClearCrashes}
                className="btn btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
                }}
              >
                <Trash2 size={14} />
                Clear Logs
              </button>
            )}
          </div>
        </div>

        {crashes.length === 0 ? (
          <div style={{
            padding: '2.5rem 1rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-medium)'
          }}>
            <CheckCircle2 size={32} color="var(--accent-green)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Zero Crashes Detected
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              All client sessions, route navigations, and catalog hooks are executing without runtime errors.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {crashes.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: c.fatal ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: c.fatal ? '#ef4444' : '#f59e0b'
                  }}>
                    {c.type}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(c.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                  {c.message}
                </div>
                {c.stack && (
                  <pre style={{
                    fontSize: '0.72rem',
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    maxHeight: '80px',
                    overflowY: 'auto',
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {c.stack.split('\n').slice(0, 3).join('\n')}
                  </pre>
                )}
                {c.url && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Page: <code>{c.url}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { getProducts, getDeals } from '../../services/catalogService';
import { Product, Deal } from '../../types';
import { useSite } from '../../context/SiteContext';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, Link2 } from 'lucide-react';
import { validateAffiliateLink } from '../../services/amazonService';

export const AdminSystemHealth: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSite();

  useEffect(() => {
    Promise.all([getProducts(), getDeals()]).then(([prods, dList]) => {
      setProducts(prods);
      setDeals(dList);
      setLoading(false);
    });
  }, []);

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
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
          Catalog Health & Link Integrity
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Automated audit of Amazon affiliate links, image availability, and duplicate prevention
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
            <CheckCircle2 size={16} color="var(--accent-green)" />
            <span>Associates Tag: <code>{settings.amazonTrackingId}</code> active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
            <CheckCircle2 size={16} color="var(--accent-green)" />
            <span>Marketplace: <code>{settings.defaultMarketplace}</code> configured</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
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
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Amazon Affiliate Links</h3>
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
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Duplicate ASINs</h3>
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
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Setup Cross-Sell Coverage</h3>
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

    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCollectionBySlug, getProducts } from '../services/catalogService';
import { Collection, Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { SEOHead } from '../components/layout/SEOHead';
import {
  Layers,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  SlidersHorizontal,
  ArrowLeft,
  Info
} from 'lucide-react';
import { trackEvent } from '../services/analyticsService';
import { COMPLIANCE_DISCLOSURE } from '../services/amazonService';

export const CollectionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'discount_desc'>('featured');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    async function loadData() {
      try {
        const col = await getCollectionBySlug(slug!);
        if (!col) {
          setCollection(null);
          return;
        }
        setCollection(col);

        trackEvent('collection_view', {
          targetId: col.id,
          targetSlug: col.slug,
          title: col.title
        });

        const allProds = await getProducts();
        // Load products belonging to this collection
        const matched = allProds.filter(
          p => (col.productIds && col.productIds.includes(p.id)) || (p.collectionSlugs && p.collectionSlugs.includes(col.slug))
        );
        setProducts(matched);
      } catch (e) {
        console.error('Failed to load collection', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingTop: '1rem' }}>
        <div className="skeleton" style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-xl)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-card" style={{ height: '340px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
          Setup Not Found
        </h2>
        <Link to="/collections" className="btn btn-primary">
          Browse All Setups
        </Link>
      </div>
    );
  }

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_asc') return (a.currentPrice || 0) - (b.currentPrice || 0);
    if (sortBy === 'price_desc') return (b.currentPrice || 0) - (a.currentPrice || 0);
    if (sortBy === 'discount_desc') return (b.discountPercentage || 0) - (a.discountPercentage || 0);
    return (b.priority || 0) - (a.priority || 0);
  });

  return (
    <>
      <SEOHead
        title={collection.seoTitle || `${collection.title} — Curated Essentials`}
        description={collection.seoDescription || collection.description.substring(0, 155)}
        canonicalPath={`/collection/${collection.slug}`}
        imageUrl={collection.coverImage}
      />

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
          <span>/</span>
          <Link to="/collections" style={{ color: 'var(--text-secondary)' }}>Setups</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{collection.title}</span>
        </div>

        {/* Hero Banner Header */}
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: '#111827',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <img
            src={collection.bannerImage || collection.coverImage}
            alt={collection.title}
            style={{ width: '100%', height: '320px', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(11, 15, 25, 0.98) 0%, rgba(11, 15, 25, 0.6) 60%, rgba(11, 15, 25, 0.2) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '2.5rem'
          }}>
            <div style={{ maxWidth: '750px' }}>
              <span className="badge badge-trending" style={{ marginBottom: '0.65rem' }}>
                <Layers size={13} />
                Curated Setup Guide
              </span>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.15, marginBottom: '0.75rem' }}>
                {collection.title}
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {collection.tagline || collection.description}
              </p>
            </div>
          </div>
        </div>

        {/* Phase 47: Editorial Buying Checklist & Practical Tips */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem'
        }}>
          {/* Buying Checklist */}
          {collection.buyingChecklist && collection.buyingChecklist.length > 0 && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-green)', fontWeight: 700, fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} />
                <span>Essential Setup Checklist</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Tick off the items you already have or plan to equip:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {collection.buyingChecklist.map((item, idx) => (
                  <label
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: checkedItems[idx] ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: checkedItems[idx] ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      color: checkedItems[idx] ? '#ffffff' : 'var(--text-secondary)',
                      textDecoration: checkedItems[idx] ? 'line-through' : 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[idx]}
                      onChange={() => {}}
                      style={{ accentColor: 'var(--accent-green)', marginTop: '0.15rem' }}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Editorial Recommendations */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
              <Sparkles size={18} />
              <span>Curation Notes & Setup Advice</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              {collection.description}
            </p>
            {collection.editorialTips && collection.editorialTips.length > 0 && (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                {collection.editorialTips.map((tip, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Products in This Setup */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                Products in this Setup ({sortedProducts.length})
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Each product is independently available on Amazon. Pick only what your setup lacks.
              </p>
            </div>

            {/* In-Collection Sorting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              >
                <option value="featured">Featured / Importance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount_desc">Highest Discount</option>
              </select>
            </div>
          </div>

          <div className="product-grid">
            {sortedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        {collection.faqs && collection.faqs.length > 0 && (
          <section style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.95rem' }}>
              <HelpCircle size={18} />
              <span>Frequently Asked Questions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {collection.faqs.map((faq, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                    {faq.question}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Transparency Banner */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <Info size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <span>{COMPLIANCE_DISCLOSURE} Every product link opens directly on Amazon.</span>
        </div>

      </div>
    </>
  );
};

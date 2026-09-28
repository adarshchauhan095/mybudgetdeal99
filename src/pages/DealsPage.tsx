import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/catalogService';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { SEOHead } from '../components/layout/SEOHead';
import { Zap, Clock, ShieldCheck, Flame } from 'lucide-react';
import { trackEvent } from '../services/analyticsService';
import { PRICE_DISCLAIMER } from '../services/amazonService';

export const DealsPage: React.FC = () => {
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [minDiscount, setMinDiscount] = useState<number | undefined>(undefined);

  useEffect(() => {
    trackEvent('page_view', { title: 'Deals Hub', targetSlug: '/deals' });

    getProducts({ isDeal: true, minDiscount })
      .then(setDealProducts)
      .finally(() => setLoading(false));
  }, [minDiscount]);

  return (
    <>
      <SEOHead
        title="Verified Amazon Deals & Discount Drops"
        description="Browse today's verified Amazon deals on desk gear, car accessories, fast chargers, and organizers with discounts up to 50%."
        canonicalPath="/deals"
      />

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Deals Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <Flame size={18} />
            <span>Limited-Time Price Drops</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
            Verified Amazon Deals
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px', marginBottom: '1.5rem' }}>
            We scan and curate authentic price drops on high-utility gear. No artificially inflated MSRPs or fake discounts.
          </p>

          {/* Quick Discount Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by savings:</span>
            <button
              onClick={() => setMinDiscount(undefined)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: minDiscount === undefined ? '#f87171' : 'rgba(255, 255, 255, 0.05)',
                color: minDiscount === undefined ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              All Deals
            </button>
            {[30, 40, 50].map((pct) => (
              <button
                key={pct}
                onClick={() => setMinDiscount(pct)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: minDiscount === pct ? '#f87171' : 'rgba(255, 255, 255, 0.05)',
                  color: minDiscount === pct ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {pct}%+ Off
              </button>
            ))}
          </div>
        </div>

        {/* Deals Listing */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            Loading active deals...
          </div>
        ) : dealProducts.length > 0 ? (
          <div className="product-grid">
            {dealProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <Zap size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              No deals matching this criteria
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>Try selecting a lower discount threshold.</p>
          </div>
        )}

        {/* Disclaimer Notice */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <Clock size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <span>{PRICE_DISCLAIMER}</span>
        </div>

      </div>
    </>
  );
};

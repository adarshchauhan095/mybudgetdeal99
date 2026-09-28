import React from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { trackEvent } from '../../services/analyticsService';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, formatPrice } = useSite();

  if (!quickViewProduct) return null;

  const product = quickViewProduct;

  const handleClose = () => setQuickViewProduct(null);

  const handleAmazonCta = () => {
    trackEvent('amazon_cta_click', {
      targetId: product.id,
      targetSlug: product.slug,
      title: product.title
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease forwards'
    }}
    onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.8)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            border: '1px solid var(--border-medium)'
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Product Media */}
        <div style={{ background: '#131b2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
          />
        </div>

        {/* Product Information */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            {product.brand} • {product.categoryName}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.3, marginBottom: '1rem' }}>
            {product.title}
          </h3>

          {/* Pricing */}
          {product.priceDisplayStatus === 'show' && product.currentPrice ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>
                {formatPrice(product.currentPrice, product.currency)}
              </span>
              {product.previousPrice && (
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {formatPrice(product.previousPrice, product.currency)}
                </span>
              )}
              {product.discountPercentage && (
                <span className="badge badge-deal">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
              Current pricing available live on Amazon
            </div>
          )}

          {/* Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Key Highlights
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {product.highlights.slice(0, 3).map((h, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Check size={14} color="var(--accent-green)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleAmazonCta}
              className="btn btn-amazon btn-lg"
              style={{ width: '100%' }}
            >
              <span>View Product on Amazon</span>
              <ExternalLink size={18} />
            </a>

            <Link
              to={`/product/${product.slug}`}
              onClick={handleClose}
              className="btn btn-outline"
              style={{ width: '100%' }}
            >
              <span>Full Details & Setups</span>
              <ArrowRight size={16} />
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <ShieldCheck size={13} color="var(--accent-green)" />
              <span>Compliant Amazon Associates Special Link</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

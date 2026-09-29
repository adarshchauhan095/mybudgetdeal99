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

        {/* Product Media with Thumbnails */}
        <div style={{ background: '#131b2e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', gap: '1rem' }}>
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
          />

          {product.additionalImages && product.additionalImages.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', width: '100%', justifyContent: 'center' }}>
              {[product.imageUrl, ...product.additionalImages].map((img, idx) => (
                <div key={idx} style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-medium)', background: '#0b0f19' }}>
                  <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            {product.categoryName}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.3, marginBottom: '0.75rem' }}>
            {product.title}
          </h3>

          {/* Emotional Hook Line */}
          {product.hookLine && (
            <div style={{
              background: 'rgba(255, 153, 0, 0.1)',
              borderLeft: '3px solid var(--accent-primary)',
              padding: '0.65rem 0.85rem',
              borderRadius: '0 8px 8px 0',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              color: '#ffffff',
              lineHeight: 1.5
            }}>
              {product.hookLine}
            </div>
          )}

          {/* Pricing */}
          {product.priceDisplayStatus === 'show' && product.currentPrice ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>
                {formatPrice(product.currentPrice, product.currency)}
              </span>
              {product.previousPrice && (
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
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

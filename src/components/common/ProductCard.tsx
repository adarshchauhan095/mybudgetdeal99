import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Eye, Share2, ShieldCheck, Zap } from 'lucide-react';
import { Product } from '../../types';
import { useSite } from '../../context/SiteContext';
import { trackEvent } from '../../services/analyticsService';

interface ProductCardProps {
  product: Product;
  showCollectionTag?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showCollectionTag = false }) => {
  const { formatPrice, setQuickViewProduct, showToast } = useSite();

  const handleAmazonCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('amazon_cta_click', {
      targetId: product.id,
      targetSlug: product.slug,
      title: product.title
    });
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}/product/${product.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Product link copied to clipboard!', 'success');
      });
    } else {
      showToast('Sharing not supported on this browser', 'info');
    }
    trackEvent('product_share', { targetId: product.id, targetSlug: product.slug });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setQuickViewProduct(product);
  };

  const savingsAmount = product.previousPrice && product.currentPrice
    ? product.previousPrice - product.currentPrice
    : 0;

  return (
    <div className="product-card">
      {/* Product Image Wrap */}
      <Link to={`/product/${product.slug}`} className="product-card-img-wrap" aria-label={product.title}>
        <img
          src={product.imageUrl}
          alt={product.title}
          className="product-card-img"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Badges */}
        <div className="product-card-badges">
          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="badge badge-deal" style={{ fontWeight: 800, letterSpacing: '0.02em' }}>
              <Zap size={11} fill="#f87171" />
              {product.discountPercentage}% OFF
            </span>
          ) : null}
        </div>

        {/* Floating Quick Actions */}
        <div className="product-card-actions">
          <button
            onClick={handleQuickView}
            className="card-action-btn"
            title="Quick View"
            aria-label="Quick View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={handleShareClick}
            className="card-action-btn"
            title="Share Product"
            aria-label="Share Product"
          >
            <Share2 size={16} />
          </button>
        </div>
      </Link>

      {/* Card Body */}
      <div className="product-card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span className="product-card-brand">{product.brand}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{product.categoryName}</span>
        </div>

        <Link to={`/product/${product.slug}`} title={product.title}>
          <h3 className="product-card-title">
            {product.title}
          </h3>
        </Link>

        {/* Emotional Hook Line */}
        {product.hookLine && (
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            margin: '0.35rem 0 0.5rem 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.hookLine}
          </p>
        )}

        {/* Pricing Row */}
        {product.priceDisplayStatus === 'show' && product.currentPrice ? (
          <div style={{ marginBottom: '0.85rem' }}>
            <div className="product-card-price-row" style={{ alignItems: 'baseline' }}>
              <span className="price-current" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {formatPrice(product.currentPrice, product.currency)}
              </span>
              {product.previousPrice && (
                <span className="price-prev">
                  {formatPrice(product.previousPrice, product.currency)}
                </span>
              )}
            </div>
            {savingsAmount > 0 && (
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 600, marginTop: '0.15rem' }}>
                You save {formatPrice(savingsAmount, product.currency)} ({product.discountPercentage}%)
              </div>
            )}
          </div>
        ) : (
          <div className="product-card-price-row" style={{ marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Check price on Amazon
            </span>
          </div>
        )}

        {/* Amazon Call to Action Button */}
        <a
          href={product.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleAmazonCtaClick}
          className="btn btn-amazon-glow"
          style={{ width: '100%', padding: '0.65rem 0.75rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
        >
          <span>Check Deal on Amazon</span>
          <ExternalLink size={15} />
        </a>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          marginTop: '0.6rem',
          fontSize: '0.7rem',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={12} color="var(--accent-green)" />
          <span>Amazon Verified • Tag: mybudgetdeal9-21</span>
        </div>
      </div>
    </div>
  );
};

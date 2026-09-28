import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Eye, Share2, ShieldCheck, Zap, Sparkles } from 'lucide-react';
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
            // Fallback placeholder if image load fails
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Badges */}
        <div className="product-card-badges">
          {product.isDeal && product.discountPercentage ? (
            <span className="badge badge-deal">
              <Zap size={12} />
              {product.discountPercentage}% OFF
            </span>
          ) : null}
          {product.isBestseller && (
            <span className="badge badge-bestseller">
              ★ Bestseller
            </span>
          )}
          {product.isEditorsPick && (
            <span className="badge badge-featured">
              <Sparkles size={12} />
              Editor's Pick
            </span>
          )}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span className="product-card-brand">{product.brand}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{product.categoryName}</span>
        </div>

        <Link to={`/product/${product.slug}`} title={product.title}>
          <h3 className="product-card-title">
            {product.shortTitle || product.title}
          </h3>
        </Link>

        {/* Pricing Row */}
        {product.priceDisplayStatus === 'show' && product.currentPrice ? (
          <div className="product-card-price-row">
            <span className="price-current">
              {formatPrice(product.currentPrice, product.currency)}
            </span>
            {product.previousPrice && (
              <span className="price-prev">
                {formatPrice(product.previousPrice, product.currency)}
              </span>
            )}
            {product.discountPercentage && (
              <span className="price-discount">
                Save {product.discountPercentage}%
              </span>
            )}
          </div>
        ) : (
          <div className="product-card-price-row">
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
          className="btn btn-amazon"
          style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
        >
          <span>View on Amazon</span>
          <ExternalLink size={14} />
        </a>

        {/* Amazon Associate Tag Micro Disclaimer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          marginTop: '0.5rem',
          fontSize: '0.7rem',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={12} color="var(--accent-green)" />
          <span>Affiliate Special Link</span>
        </div>
      </div>
    </div>
  );
};

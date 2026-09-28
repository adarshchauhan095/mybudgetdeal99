import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getProductBySlug,
  getProducts,
  getCollections
} from '../services/catalogService';
import { Product, Collection } from '../types';
import { useSite } from '../context/SiteContext';
import { SEOHead } from '../components/layout/SEOHead';
import { ProductCard } from '../components/common/ProductCard';
import {
  ExternalLink,
  ShieldCheck,
  Check,
  Zap,
  Layers,
  Share2,
  Clock,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { trackEvent } from '../services/analyticsService';
import { COMPLIANCE_DISCLOSURE, PRICE_DISCLAIMER } from '../services/amazonService';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [parentCollection, setParentCollection] = useState<Collection | null>(null);
  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice, showToast } = useSite();
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    async function loadProductData() {
      try {
        const prod = await getProductBySlug(slug!);
        if (!prod) {
          setProduct(null);
          return;
        }
        setProduct(prod);

        // Track internal analytics
        trackEvent('product_view', {
          targetId: prod.id,
          targetSlug: prod.slug,
          title: prod.title
        });

        // Load related products & setups
        const [allProds, allCols] = await Promise.all([
          getProducts(),
          getCollections()
        ]);

        // Related items in same category
        const related = allProds
          .filter(p => p.id !== prod.id && (p.categorySlug === prod.categorySlug || p.brand === prod.brand))
          .slice(0, 4);
        setRelatedProducts(related);

        // If product belongs to a collection, load that collection and its sibling products
        if (prod.collectionSlugs && prod.collectionSlugs.length > 0) {
          const colSlug = prod.collectionSlugs[0];
          const foundCol = allCols.find(c => c.slug === colSlug);
          if (foundCol) {
            setParentCollection(foundCol);
            const siblings = allProds.filter(p => p.id !== prod.id && foundCol.productIds?.includes(p.id));
            setCollectionProducts(siblings);
          }
        }
      } catch (e) {
        console.error('Failed to load product details', e);
      } finally {
        setLoading(false);
      }
    }

    loadProductData();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading product information...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem', color: '#ffffff' }}>
          Product Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          The product you are looking for may have been archived or moved.
        </p>
        <Link to="/products" className="btn btn-primary">
          Browse All Products
        </Link>
      </div>
    );
  }

  const handleAmazonCta = () => {
    trackEvent('amazon_cta_click', {
      targetId: product.id,
      targetSlug: product.slug,
      title: product.title
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'success');
      trackEvent('product_share', { targetId: product.id, targetSlug: product.slug });
    }
  };

  const formattedDate = product.lastVerified
    ? new Date(product.lastVerified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent';

  // Schema.org structured data for Google Rich Results
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": [product.imageUrl],
    "description": product.description,
    "sku": product.asin,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    ...(product.currentPrice ? {
      "offers": {
        "@type": "Offer",
        "url": product.amazonUrl,
        "priceCurrency": product.currency || "INR",
        "price": product.currentPrice,
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Amazon"
        }
      }
    } : {})
  };

  return (
    <>
      <SEOHead
        title={product.title}
        description={product.description.substring(0, 155)}
        canonicalPath={`/product/${product.slug}`}
        imageUrl={product.imageUrl}
        ogType="product"
        jsonLd={productJsonLd}
      />

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* Breadcrumb Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: 'var(--text-secondary)' }}>Products</Link>
          <span>/</span>
          <Link to={`/category/${product.categorySlug}`} style={{ color: 'var(--text-secondary)' }}>
            {product.categoryName}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
            {product.shortTitle || product.title}
          </span>
        </nav>

        {/* Main Product Hero Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 1.25fr)',
          gap: '2.5rem',
          alignItems: 'start'
        }}
        className="product-detail-hero"
        >
          {/* Left: Product Image Box */}
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            background: '#131b2e',
            border: '1px solid var(--border-medium)',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <img
              src={product.imageUrl}
              alt={product.title}
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'contain',
                transition: 'transform 0.3s ease'
              }}
            />

            {/* Badges */}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {product.isDeal && product.discountPercentage && (
                <span className="badge badge-deal">
                  <Zap size={13} />
                  {product.discountPercentage}% OFF
                </span>
              )}
              {product.isBestseller && (
                <span className="badge badge-bestseller">
                  ★ Amazon Bestseller
                </span>
              )}
              {product.isEditorsPick && (
                <span className="badge badge-featured">
                  <Sparkles size={13} />
                  Editor's Choice
                </span>
              )}
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Share Product"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
          </div>

          {/* Right: Product Details & Amazon CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Brand & Category */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {product.brand}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ASIN: <code style={{ color: 'var(--accent-blue)' }}>{product.asin}</code>
              </div>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, color: '#ffffff' }}>
              {product.title}
            </h1>

            {/* Pricing Section with Price Disclaimer */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}>
              {product.priceDisplayStatus === 'show' && product.currentPrice ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>
                    {formatPrice(product.currentPrice, product.currency)}
                  </span>
                  {product.previousPrice && (
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {formatPrice(product.previousPrice, product.currency)}
                    </span>
                  )}
                  {product.discountPercentage && (
                    <span className="badge badge-deal" style={{ fontSize: '0.85rem' }}>
                      Save {product.discountPercentage}%
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                  Check Current Price on Amazon
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <Clock size={13} />
                <span>Verified {formattedDate}. Subject to change by Amazon.</span>
              </div>
            </div>

            {/* Primary Amazon Special Link CTA Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={handleAmazonCta}
                className="btn btn-amazon btn-lg"
                style={{ width: '100%', justifyContent: 'center', fontSize: '1.15rem' }}
              >
                <span>View on Amazon</span>
                <ExternalLink size={20} />
              </a>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                color: 'var(--text-muted)'
              }}>
                <ShieldCheck size={14} color="var(--accent-green)" />
                <span>Redirects safely to official Amazon product page</span>
              </div>
            </div>

            {/* Highlights List */}
            {product.highlights && product.highlights.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Key Features & Highlights
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {product.highlights.map((h, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                      <Check size={16} color="var(--accent-green)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Compliance Note */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}>
              <Info size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <strong>Affiliate Transparency:</strong> {COMPLIANCE_DISCLOSURE}
              </div>
            </div>

          </div>
        </div>

        {/* Phase 46: Separation of Editorial Review vs Amazon Data */}
        <section style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <Sparkles size={16} />
            <span>Our Independent Editorial Analysis</span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
            Why We Selected This Product
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {product.editorialReview || product.description}
          </p>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>
            Manufacturer Description
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            {product.description}
          </p>
        </section>

        {/* Phase 20: Collection Cross-Selling ("Complete the Setup") */}
        {parentCollection && collectionProducts.length > 0 && (
          <section style={{
            background: 'linear-gradient(180deg, rgba(31, 41, 61, 0.4) 0%, rgba(11, 15, 25, 0.6) 100%)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem 1.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-trending" style={{ marginBottom: '0.5rem' }}>
                  Part of Curated Setup
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
                  Complete the Setup: {parentCollection.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
                  This product was selected as part of a coordinated setup. Check out matching items:
                </p>
              </div>
              <Link to={`/collection/${parentCollection.slug}`} className="btn btn-outline btn-sm">
                <span>View Full Setup Guide</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="product-grid">
              {collectionProducts.slice(0, 4).map(sibling => (
                <ProductCard key={sibling.id} product={sibling} />
              ))}
            </div>
          </section>
        )}

        {/* Related Products in Same Category */}
        {relatedProducts.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Similar Recommendations</h2>
              <Link to={`/category/${product.categorySlug}`} className="btn btn-outline btn-sm">
                <span>More in {product.categoryName}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="product-grid">
              {relatedProducts.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}

      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-detail-hero {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

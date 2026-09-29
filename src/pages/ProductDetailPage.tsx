import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getProductBySlug,
  getProducts
} from '../services/catalogService';
import { Product } from '../types';
import { useSite } from '../context/SiteContext';
import { SEOHead } from '../components/layout/SEOHead';
import { ProductCard } from '../components/common/ProductCard';
import {
  ExternalLink,
  ShieldCheck,
  Zap,
  Share2,
  Sparkles,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  X,
  Flame
} from 'lucide-react';
import { trackEvent } from '../services/analyticsService';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { formatPrice, showToast } = useSite();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setSelectedImageIndex(0);
    setZoomLevel(1);
    setIsFullscreen(false);

    async function loadProductData() {
      try {
        const prod = await getProductBySlug(slug!);
        if (!prod) {
          setProduct(null);
          return;
        }
        setProduct(prod);

        trackEvent('product_view', {
          targetId: prod.id,
          targetSlug: prod.slug,
          title: prod.title
        });

        const allProds = await getProducts();
        const related = allProds
          .filter(p => p.id !== prod.id && (p.categorySlug === prod.categorySlug || p.brand === prod.brand))
          .slice(0, 4);
        setRelatedProducts(related);
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
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingTop: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          <div className="skeleton" style={{ width: '100%', height: '420px', borderRadius: 'var(--radius-xl)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton skeleton-title" style={{ width: '90%', height: '36px' }} />
            <div className="skeleton skeleton-title" style={{ width: '65%', height: '36px' }} />
            <div className="skeleton skeleton-badge" style={{ width: '140px', height: '32px', margin: '0.5rem 0' }} />
            <div className="skeleton skeleton-text" style={{ width: '100%', height: '18px' }} />
            <div className="skeleton skeleton-text" style={{ width: '95%', height: '18px' }} />
            <div className="skeleton skeleton-btn" style={{ height: '52px', marginTop: '1rem', width: '220px' }} />
          </div>
        </div>
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

  // All available product images
  const allImages = [
    product.imageUrl,
    ...(product.additionalImages || [])
  ].filter(Boolean);

  const activeImage = allImages[selectedImageIndex] || product.imageUrl;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.35, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.35, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    setZoomLevel(1);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    setZoomLevel(1);
  };

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

  const savingsAmount = product.previousPrice && product.currentPrice
    ? product.previousPrice - product.currentPrice
    : 0;

  return (
    <>
      <SEOHead
        title={product.title}
        description={product.hookLine || product.description.substring(0, 155)}
        canonicalPath={`/product/${product.slug}`}
        imageUrl={product.imageUrl}
        ogType="product"
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
          <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px' }}>
            {product.title}
          </span>
        </nav>

        {/* Main Product Hero Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1.2fr)',
          gap: '3rem',
          alignItems: 'start'
        }}
        className="product-detail-hero"
        >
          {/* Left Column: Multiple Images Gallery, Fullscreen & Zoom Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Main Image Display Box */}
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              background: '#131b2e',
              border: '1px solid var(--border-medium)',
              height: '460px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {/* Zoomable Image Container */}
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: zoomLevel > 1 ? 'grab' : 'zoom-in'
              }}
              onClick={() => {
                if (zoomLevel === 1) handleZoomIn();
                else handleResetZoom();
              }}
              >
                <img
                  src={activeImage}
                  alt={product.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transform: `scale(${zoomLevel})`,
                    transition: 'transform 0.25s ease',
                    userSelect: 'none'
                  }}
                  draggable={false}
                />
              </div>

              {/* Discount Badge */}
              {product.discountPercentage && product.discountPercentage > 0 && (
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
                  <span className="badge badge-deal" style={{ fontWeight: 800, fontSize: '0.85rem', padding: '0.35rem 0.8rem' }}>
                    <Flame size={14} fill="#f87171" />
                    {product.discountPercentage}% OFF
                  </span>
                </div>
              )}

              {/* Top Right Actions: Fullscreen & Share */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="card-action-btn"
                  title="View Fullscreen & Zoom"
                  aria-label="Fullscreen"
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  onClick={handleShare}
                  className="card-action-btn"
                  title="Share Product"
                  aria-label="Share"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Interactive Zoom In / Zoom Out Floating Controls */}
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-medium)',
                zIndex: 10
              }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                  disabled={zoomLevel <= 0.7}
                  style={{ color: '#ffffff', opacity: zoomLevel <= 0.7 ? 0.4 : 1, padding: '2px' }}
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span
                  onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
                  style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', minWidth: '38px', textAlign: 'center', cursor: 'pointer' }}
                  title="Click to reset zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                  disabled={zoomLevel >= 3}
                  style={{ color: '#ffffff', opacity: zoomLevel >= 3 ? 0.4 : 1, padding: '2px' }}
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              {/* Previous / Next Arrow buttons on main image if multiple images */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      border: '1px solid var(--border-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    title="Previous Image"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      border: '1px solid var(--border-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    title="Next Image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Carousel / Selector Strip */}
            {allImages.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                scrollbarWidth: 'thin'
              }}>
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setZoomLevel(1);
                    }}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: selectedImageIndex === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                      background: '#151d2f',
                      padding: '3px',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: selectedImageIndex === idx ? 1 : 0.65
                    }}
                    title={`View photo ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </button>
                ))}
              </div>
            )}
            
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              💡 Click photo to zoom in/out • Click expand icon for full screen
            </span>
          </div>

          {/* Right Column: Title, Emotional Hook, Pricing & Amazon CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Category / Department Tag */}
            <div>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(255, 153, 0, 0.1)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 153, 0, 0.25)'
              }}>
                {product.categoryName}
              </span>
            </div>

            {/* Product Title */}
            <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, color: '#ffffff' }}>
              {product.title}
            </h1>

            {/* 🔥 Emotional Hook Message Box ("Why You Need This / What You're Missing Without It") */}
            {product.hookLine && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.12) 0%, rgba(17, 24, 39, 0.95) 100%)',
                border: '1.5px solid var(--accent-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: '0 8px 24px -6px rgba(255, 153, 0, 0.18)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Sparkles size={16} />
                  <span>Why You Can't Miss Out On This:</span>
                </div>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: '#ffffff',
                  fontWeight: 500
                }}>
                  {product.hookLine}
                </p>
              </div>
            )}

            {/* Pricing Section */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem'
            }}>
              {product.currentPrice ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>
                      {formatPrice(product.currentPrice, product.currency)}
                    </span>
                    {product.previousPrice && (
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {formatPrice(product.previousPrice, product.currency)}
                      </span>
                    )}
                    {product.discountPercentage && (
                      <span className="badge badge-deal" style={{ fontSize: '0.9rem', fontWeight: 800, padding: '0.3rem 0.75rem' }}>
                        <Flame size={14} fill="#f87171" />
                        {product.discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                  {savingsAmount > 0 && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                      You save {formatPrice(savingsAmount, product.currency)} ({product.discountPercentage}% savings)
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  Check Current Deal Price on Amazon
                </div>
              )}
            </div>

            {/* Primary Amazon Special Link CTA Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={handleAmazonCta}
                className="btn btn-amazon-glow btn-lg"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  padding: '1rem 1.5rem',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <span>Buy on Amazon</span>
                <ExternalLink size={22} />
              </a>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                color: 'var(--text-muted)'
              }}>
                <ShieldCheck size={15} color="var(--accent-green)" />
                <span>Direct fulfillment on official Amazon India store</span>
              </div>
            </div>

            {/* Main Product Description */}
            {product.description && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                  Product Details & Overview
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.96rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line'
                }}>
                  {product.description}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Similar Recommendations */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>
                You Might Also Like
              </h2>
              <Link to={`/category/${product.categorySlug}`} className="btn btn-outline btn-sm">
                <span>More Deals in {product.categoryName}</span>
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

      {/* Fullscreen Lightbox Modal with Zoom In & Zoom Out */}
      {isFullscreen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 16, 0.96)',
          backdropFilter: 'blur(20px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          {/* Top Bar Controls */}
          <div style={{
            position: 'absolute',
            top: '1.25rem',
            left: '1.5rem',
            right: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10000
          }}>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.title} ({selectedImageIndex + 1} of {allImages.length})
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Zoom Buttons in Modal */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-medium)'
              }}>
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.7}
                  style={{ color: '#ffffff', opacity: zoomLevel <= 0.7 ? 0.4 : 1 }}
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <span
                  onClick={handleResetZoom}
                  style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-primary)', minWidth: '42px', textAlign: 'center', cursor: 'pointer' }}
                >
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  style={{ color: '#ffffff', opacity: zoomLevel >= 3 ? 0.4 : 1 }}
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
              </div>

              {/* Close Fullscreen Button */}
              <button
                onClick={() => {
                  setIsFullscreen(false);
                  setZoomLevel(1);
                }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Close Fullscreen"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Fullscreen Image Container */}
          <div style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            padding: '4rem 1rem'
          }}>
            <img
              src={activeImage}
              alt={product.title}
              style={{
                maxWidth: '90vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.25s ease'
              }}
            />
          </div>

          {/* Previous / Next Arrow buttons in Fullscreen */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                style={{
                  position: 'absolute',
                  left: '1.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Previous Image"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={handleNextImage}
                style={{
                  position: 'absolute',
                  right: '1.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Next Image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Bottom Thumbnails in Fullscreen */}
          {allImages.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              overflowX: 'auto',
              padding: '0.5rem',
              maxWidth: '80%',
              zIndex: 10000
            }}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setZoomLevel(1);
                  }}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: selectedImageIndex === idx ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.2)',
                    background: '#151d2f',
                    padding: '2px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    opacity: selectedImageIndex === idx ? 1 : 0.6
                  }}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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

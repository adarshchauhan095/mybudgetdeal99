import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Banner } from '../../types';
import { trackEvent } from '../../services/analyticsService';

interface BannerCarouselProps {
  banners: Banner[];
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const activeBanners = banners.filter(b => b.isActive);

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  if (!activeBanners.length) return null;

  const current = activeBanners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  const handleBannerCtaClick = () => {
    trackEvent('banner_click', {
      targetId: current.id,
      title: current.title,
      targetSlug: current.ctaTarget
    });
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        aspectRatio: '21 / 9',
        minHeight: '260px'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="banner-carousel-container"
    >
      {/* Background Banner Image */}
      <img
        src={current.desktopImage}
        alt={current.title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'all 0.6s ease'
        }}
      />

      {/* Dark Vignette Overlay for Crisp Readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.75) 45%, rgba(11, 15, 25, 0.2) 100%)',
        display: 'flex',
        alignItems: 'center',
        padding: '2.5rem'
      }}
      className="banner-overlay"
      >
        <div style={{ maxWidth: '580px', zIndex: 2 }}>
          <span className="badge badge-trending" style={{ marginBottom: '0.85rem' }}>
            Featured Discovery
          </span>
          <h2 style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '0.75rem',
            color: '#ffffff'
          }}
          className="banner-title"
          >
            {current.title}
          </h2>
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            lineHeight: 1.5
          }}
          className="banner-subtitle"
          >
            {current.subtitle}
          </p>

          <Link
            to={current.ctaTarget}
            onClick={handleBannerCtaClick}
            className="btn btn-primary btn-lg"
            style={{ display: 'inline-flex' }}
          >
            <span>{current.ctaText || "Explore Now"}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {activeBanners.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '2rem',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 3
        }}>
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: currentIndex === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentIndex === idx ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .banner-carousel-container {
            aspect-ratio: 16 / 10 !important;
            border-radius: var(--radius-lg) !important;
          }
          .banner-overlay {
            padding: 1.25rem !important;
            background: linear-gradient(to top, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.7) 100%) !important;
            align-items: flex-end !important;
          }
          .banner-title {
            font-size: 1.35rem !important;
          }
          .banner-subtitle {
            font-size: 0.88rem !important;
            margin-bottom: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

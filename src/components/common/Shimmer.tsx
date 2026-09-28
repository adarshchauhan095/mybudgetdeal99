import React from 'react';

/**
 * Shimmering skeleton placeholder for ProductCard
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-card">
      {/* Product Image Placeholder */}
      <div className="skeleton" style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-md)' }} />
      
      {/* Badge & Category */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
        <div className="skeleton skeleton-badge" style={{ width: '65px', height: '18px' }} />
        <div className="skeleton skeleton-badge" style={{ width: '45px', height: '18px' }} />
      </div>

      {/* Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: '0.25rem 0' }}>
        <div className="skeleton skeleton-text" style={{ width: '90%', height: '16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '60%', height: '16px' }} />
      </div>

      {/* Price row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto' }}>
        <div className="skeleton skeleton-title" style={{ width: '80px', height: '24px', margin: 0 }} />
        <div className="skeleton skeleton-text" style={{ width: '50px', height: '14px', margin: 0 }} />
      </div>

      {/* Button */}
      <div className="skeleton skeleton-btn" style={{ height: '38px', marginTop: '0.5rem' }} />
    </div>
  );
};

/**
 * Shimmering skeleton placeholder for CollectionCard
 */
export const CollectionCardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-card" style={{ padding: 0 }}>
      {/* Cover Image Placeholder */}
      <div className="skeleton" style={{ width: '100%', height: '190px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />
      
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Category & Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton skeleton-badge" style={{ width: '85px', height: '18px' }} />
          <div className="skeleton skeleton-badge" style={{ width: '70px', height: '18px' }} />
        </div>

        {/* Title */}
        <div className="skeleton skeleton-title" style={{ width: '80%', height: '22px', margin: 0 }} />
        <div className="skeleton skeleton-text" style={{ width: '95%', height: '14px' }} />

        {/* Checklist items placeholder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: '0.5rem 0' }}>
          <div className="skeleton skeleton-text" style={{ width: '80%', height: '12px' }} />
          <div className="skeleton skeleton-text" style={{ width: '70%', height: '12px' }} />
          <div className="skeleton skeleton-text" style={{ width: '60%', height: '12px' }} />
        </div>

        {/* CTA */}
        <div className="skeleton skeleton-btn" style={{ height: '42px', marginTop: 'auto' }} />
      </div>
    </div>
  );
};

/**
 * Shimmering skeleton placeholder for Categories
 */
export const CategoryGridSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div
          key={i}
          className="skeleton-card"
          style={{ alignItems: 'center', padding: '1.5rem', textAlign: 'center', gap: '0.75rem' }}
        >
          <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
          <div className="skeleton skeleton-title" style={{ width: '80px', height: '18px', margin: 0 }} />
          <div className="skeleton skeleton-text" style={{ width: '50px', height: '12px', margin: 0 }} />
        </div>
      ))}
    </div>
  );
};

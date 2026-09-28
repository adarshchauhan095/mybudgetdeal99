import React from 'react';
import { FilterState, Category } from '../../types';
import { RotateCcw, Filter, Check, SlidersHorizontal } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  categories: Category[];
  availableBrands: string[];
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  categories,
  availableBrands,
  onChange,
  onReset
}) => {
  const selectedCategory = categories.find(c => c.slug === filters.categorySlug);

  return (
    <aside style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
          <SlidersHorizontal size={18} color="var(--accent-primary)" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.78rem',
            color: 'var(--accent-primary)',
            background: 'transparent',
            fontWeight: 600
          }}
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Sort By
        </label>
        <select
          value={filters.sortBy || 'featured'}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
          style={{ width: '100%' }}
        >
          <option value="featured">Featured / Priority</option>
          <option value="newest">Newest Additions</option>
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="discount_desc">Highest Discount</option>
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Category
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button
            onClick={() => onChange({ ...filters, categorySlug: undefined, subcategorySlug: undefined })}
            style={{
              textAlign: 'left',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              background: !filters.categorySlug ? 'var(--accent-light)' : 'transparent',
              color: !filters.categorySlug ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: !filters.categorySlug ? 600 : 400
            }}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => onChange({ ...filters, categorySlug: c.slug, subcategorySlug: undefined })}
              style={{
                textAlign: 'left',
                padding: '0.45rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                background: filters.categorySlug === c.slug ? 'var(--accent-light)' : 'transparent',
                color: filters.categorySlug === c.slug ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: filters.categorySlug === c.slug ? 600 : 400
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories if category selected */}
      {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Subcategory
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {selectedCategory.subcategories.map(sc => (
              <button
                key={sc.slug}
                onClick={() => onChange({
                  ...filters,
                  subcategorySlug: filters.subcategorySlug === sc.slug ? undefined : sc.slug
                })}
                style={{
                  textAlign: 'left',
                  padding: '0.4rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem',
                  background: filters.subcategorySlug === sc.slug ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: filters.subcategorySlug === sc.slug ? 'var(--accent-blue)' : 'var(--text-muted)'
                }}
              >
                {sc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Deals & Discount Toggle */}
      <div>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
          Deals & Badges
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!filters.isDeal}
              onChange={(e) => onChange({ ...filters, isDeal: e.target.checked || undefined })}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
            />
            <span style={{ color: '#f87171', fontWeight: 600 }}>Active Deals Only</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!filters.isFeatured}
              onChange={(e) => onChange({ ...filters, isFeatured: e.target.checked || undefined })}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
            />
            <span>Featured Picks</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!filters.isTrending}
              onChange={(e) => onChange({ ...filters, isTrending: e.target.checked || undefined })}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
            />
            <span>Trending This Week</span>
          </label>
        </div>
      </div>

      {/* Minimum Discount Filter */}
      <div>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Minimum Discount
        </label>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[10, 20, 30, 40, 50].map((pct) => (
            <button
              key={pct}
              onClick={() => onChange({
                ...filters,
                minDiscount: filters.minDiscount === pct ? undefined : pct
              })}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: filters.minDiscount === pct ? 'var(--accent-green-bg)' : 'rgba(255, 255, 255, 0.05)',
                color: filters.minDiscount === pct ? 'var(--accent-green)' : 'var(--text-secondary)',
                border: filters.minDiscount === pct ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)'
              }}
            >
              {pct}%+
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      {availableBrands.length > 0 && (
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Brand
          </label>
          <select
            value={filters.brand || ''}
            onChange={(e) => onChange({ ...filters, brand: e.target.value || undefined })}
            style={{ width: '100%' }}
          >
            <option value="">All Brands</option>
            {availableBrands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      {/* Max Budget Filter */}
      <div>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Maximum Price: {filters.maxPrice ? `₹${filters.maxPrice}` : 'Any'}
        </label>
        <input
          type="range"
          min="300"
          max="5000"
          step="100"
          value={filters.maxPrice || 5000}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          <span>₹300</span>
          <span>₹5,000+</span>
        </div>
      </div>

    </aside>
  );
};

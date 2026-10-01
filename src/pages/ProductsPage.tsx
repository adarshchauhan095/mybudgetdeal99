import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/catalogService';
import { Product, Category, FilterState } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/Shimmer';
import { FilterSidebar } from '../components/common/FilterSidebar';
import { SEOHead } from '../components/layout/SEOHead';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { trackEvent } from '../services/analyticsService';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterState>({
    categorySlug: searchParams.get('category') || undefined,
    subcategorySlug: searchParams.get('subcategory') || undefined,
    isDeal: searchParams.get('deal') === 'true' || undefined,
    searchQuery: searchParams.get('q') || undefined,
    sortBy: (searchParams.get('sort') as any) || 'featured'
  });

  useEffect(() => {
    trackEvent('page_view', { title: 'Product Catalog', targetSlug: '/products' });

    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts(filters)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);

    // Sync URL search params
    const params = new URLSearchParams();
    if (newFilters.categorySlug) params.set('category', newFilters.categorySlug);
    if (newFilters.subcategorySlug) params.set('subcategory', newFilters.subcategorySlug);
    if (newFilters.isDeal) params.set('deal', 'true');
    if (newFilters.searchQuery) params.set('q', newFilters.searchQuery);
    if (newFilters.sortBy) params.set('sort', newFilters.sortBy);
    setSearchParams(params);

    trackEvent('filter_used', { metadata: newFilters });
  };

  const handleReset = () => {
    setFilters({ sortBy: 'featured' });
    setSearchParams({});
  };

  const availableBrands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean);

  return (
    <>
      <SEOHead
        title="Browse All Amazon Products & Deals"
        description="Search our full catalog of useful Amazon tools, office accessories, car gadgets, and organizers. Filter by price, category, and discounts."
        canonicalPath="/products"
      />

      <div className="container">
        
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Product Catalog
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Discover curated, high-utility items backed by real Amazon reviews and direct fulfillment.
          </p>
        </div>

        {/* Mobile Filter Toggle & Search */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }} className="mobile-filter-bar">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search in catalog..."
              value={filters.searchQuery || ''}
              onChange={(e) => handleFilterChange({ ...filters, searchQuery: e.target.value || undefined })}
              style={{ width: '100%', paddingLeft: '2.75rem' }}
            />
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="btn btn-secondary mobile-filter-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
          </button>
        </div>

        {/* Active Filter Chips */}
        {(filters.categorySlug || filters.subcategorySlug || filters.isDeal || filters.minDiscount || filters.searchQuery) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active filters:</span>
            {filters.categorySlug && (
              <span className="badge badge-trending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Category: {filters.categorySlug}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleFilterChange({ ...filters, categorySlug: undefined, subcategorySlug: undefined })} />
              </span>
            )}
            {filters.subcategorySlug && (
              <span className="badge badge-trending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Subcategory: {filters.subcategorySlug}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleFilterChange({ ...filters, subcategorySlug: undefined })} />
              </span>
            )}
            {filters.isDeal && (
              <span className="badge badge-deal" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Deals Only
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleFilterChange({ ...filters, isDeal: undefined })} />
              </span>
            )}
            {filters.minDiscount && (
              <span className="badge badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                {filters.minDiscount}%+ Off
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleFilterChange({ ...filters, minDiscount: undefined })} />
              </span>
            )}
            {filters.searchQuery && (
              <span className="badge badge-trending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                "{filters.searchQuery}"
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleFilterChange({ ...filters, searchQuery: undefined })} />
              </span>
            )}
            <button
              onClick={handleReset}
              style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'underline', marginLeft: '0.5rem' }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }} className="catalog-grid-layout">
          
          {/* Desktop Filter Sidebar */}
          <div className="desktop-filter-col">
            <FilterSidebar
              filters={filters}
              categories={categories}
              availableBrands={availableBrands}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Product Results */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <span>Showing <strong>{products.length}</strong> products</span>
              <span>Sorted by <strong>{filters.sortBy || 'featured'}</strong></span>
            </div>

            {loading ? (
              <div className="product-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="product-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '3.5rem 1.5rem',
                textAlign: 'center'
              }}>
                <Search size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  No matching products found
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  Try relaxing your price filters, selecting a different category, or clearing the search query.
                </p>
                <button onClick={handleReset} className="btn btn-primary">
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 860px) {
          .catalog-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .desktop-filter-col {
            display: ${mobileFilterOpen ? 'block' : 'none'};
            margin-bottom: 1.5rem;
          }
        }
        @media (min-width: 861px) {
          .mobile-filter-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

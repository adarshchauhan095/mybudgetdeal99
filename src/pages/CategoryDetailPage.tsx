import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getCategoryBySlug, getProducts } from '../services/catalogService';
import { Category, Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { SEOHead } from '../components/layout/SEOHead';
import { ArrowLeft, FolderTree, Sparkles } from 'lucide-react';
import { trackEvent } from '../services/analyticsService';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState<string | undefined>(
    searchParams.get('subcategory') || undefined
  );
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'discount_desc'>('featured');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    async function loadData() {
      try {
        const cat = await getCategoryBySlug(slug!);
        if (!cat) {
          setCategory(null);
          return;
        }
        setCategory(cat);

        trackEvent('category_view', {
          targetId: cat.id,
          targetSlug: cat.slug,
          title: cat.name
        });

        const allProds = await getProducts({
          categorySlug: cat.slug,
          subcategorySlug: activeSubcategory
        });
        setProducts(allProds);
      } catch (e) {
        console.error('Failed to load category', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, activeSubcategory]);

  const handleSubcategorySelect = (subSlug?: string) => {
    setActiveSubcategory(subSlug);
    const params = new URLSearchParams();
    if (subSlug) params.set('subcategory', subSlug);
    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading category products...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
          Category Not Found
        </h2>
        <Link to="/categories" className="btn btn-primary">
          All Categories
        </Link>
      </div>
    );
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_asc') return (a.currentPrice || 0) - (b.currentPrice || 0);
    if (sortBy === 'price_desc') return (b.currentPrice || 0) - (a.currentPrice || 0);
    if (sortBy === 'discount_desc') return (b.discountPercentage || 0) - (a.discountPercentage || 0);
    return (b.priority || 0) - (a.priority || 0);
  });

  return (
    <>
      <SEOHead
        title={category.seoTitle || `${category.name} Products & Amazon Deals`}
        description={category.seoDescription || category.description || `Browse top curated Amazon products in ${category.name}`}
        canonicalPath={`/category/${category.slug}`}
      />

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
          <span>/</span>
          <Link to="/categories" style={{ color: 'var(--text-secondary)' }}>Categories</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{category.name}</span>
        </div>

        {/* Header */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <FolderTree size={18} />
            <span>Department</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.75rem', color: '#ffffff' }}>
            {category.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '680px' }}>
            {category.description}
          </p>

          {/* Subcategory Filter Tabs */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <button
                onClick={() => handleSubcategorySelect(undefined)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: !activeSubcategory ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: !activeSubcategory ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                All Subcategories
              </button>
              {category.subcategories.map(sc => (
                <button
                  key={sc.slug}
                  onClick={() => handleSubcategorySelect(sc.slug)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    background: activeSubcategory === sc.slug ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: activeSubcategory === sc.slug ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {sc.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid & Sorting */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{sortedProducts.length}</strong> items in this category
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              >
                <option value="featured">Featured / Importance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount_desc">Highest Discount</option>
              </select>
            </div>
          </div>

          {sortedProducts.length > 0 ? (
            <div className="product-grid">
              {sortedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
              No products found in this subcategory yet.
            </div>
          )}
        </section>

      </div>
    </>
  );
};

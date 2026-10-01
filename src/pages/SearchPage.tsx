import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCollections } from '../services/catalogService';
import { Product, Collection } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { CollectionCard } from '../components/common/CollectionCard';
import { SEOHead } from '../components/layout/SEOHead';
import { Search, X, Sparkles, Layers, SlidersHorizontal } from 'lucide-react';
import { trackEvent } from '../services/analyticsService';

const POPULAR_SEARCHES = [
  'Study table setup',
  'Car vacuum',
  'Laptop stand',
  'Desk lamp',
  'Cable clips',
  'Fast charger',
  'Car mount',
  'Kitchen rack'
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(queryParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [matchingCollections, setMatchingCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputVal(queryParam);

    if (!queryParam.trim()) {
      setProducts([]);
      setMatchingCollections([]);
      return;
    }

    setLoading(true);
    trackEvent('search', { title: 'User Search', metadata: { query: queryParam } });

    Promise.all([
      getProducts({ searchQuery: queryParam }),
      getCollections()
    ]).then(([prods, cols]) => {
      setProducts(prods);

      const q = queryParam.toLowerCase().trim();
      const matchedCols = cols.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
      setMatchingCollections(matchedCols);
    }).finally(() => {
      setLoading(false);
    });
  }, [queryParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  const handleChipClick = (term: string) => {
    setInputVal(term);
    setSearchParams({ q: term });
  };

  return (
    <>
      <SEOHead
        title={queryParam ? `Search results for "${queryParam}"` : "Search Products & Curated Setups"}
        description="Search through useful Amazon accessories, gadgets, and curated setups with real reviews and transparent Special Links."
        canonicalPath={`/search${queryParam ? `?q=${encodeURIComponent(queryParam)}` : ''}`}
      />

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Search Input Box */}
        <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
            <Search size={22} color="var(--accent-primary)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search products, setups, brands (e.g. study table, car vacuum)..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '3.25rem',
                paddingRight: '3rem',
                paddingTop: '1rem',
                paddingBottom: '1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '1.05rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-md)'
              }}
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => { setInputVal(''); setSearchParams({}); }}
                style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            )}
          </form>

          {/* Popular Searches Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Popular:</span>
            {POPULAR_SEARCHES.map(term => (
              <button
                key={term}
                onClick={() => handleChipClick(term)}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {queryParam ? (
          <div>
            <div style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
              Search results for <strong style={{ color: 'var(--text-primary)' }}>"{queryParam}"</strong> (
              {products.length} products{matchingCollections.length > 0 ? `, ${matchingCollections.length} setups` : ''})
            </div>

            {/* Matching Curated Collections First */}
            {matchingCollections.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
                  <Layers size={16} />
                  <span>Matching Curated Setups</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {matchingCollections.map(col => (
                    <CollectionCard key={col.id} collection={col} />
                  ))}
                </div>
              </div>
            )}

            {/* Matching Products */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                Searching catalog...
              </div>
            ) : products.length > 0 ? (
              <div className="product-grid">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  No exact matches found for "{queryParam}"
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  Try checking for typos or browse our curated setups or full catalog.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Link to="/collections" className="btn btn-primary">
                    Browse Curated Setups
                  </Link>
                  <Link to="/products" className="btn btn-outline">
                    View All Products
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            Enter a search term above to find products or setups.
          </div>
        )}

      </div>
    </>
  );
};

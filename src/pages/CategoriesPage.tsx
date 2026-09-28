import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/catalogService';
import { Category } from '../types';
import { SEOHead } from '../components/layout/SEOHead';
import { FolderTree, ArrowRight } from 'lucide-react';
import { trackEvent } from '../services/analyticsService';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('page_view', { title: 'Categories Directory', targetSlug: '/categories' });

    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEOHead
        title="Browse Amazon Product Categories"
        description="Explore curated departments: Office & Study, Automotive & Car, Electronics, and Home & Kitchen gear on Amazon."
        canonicalPath="/categories"
      />

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <FolderTree size={18} />
            <span>Departments</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Shop By Department
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px' }}>
            Find the right tools and gear categorized by room, use case, and functional requirements.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            Loading categories...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}>
            {categories.map(cat => (
              <div
                key={cat.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: '#111827' }}>
                  {cat.imageUrl && (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                    />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11, 15, 25, 0.9) 0%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff' }}>
                      {cat.name}
                    </h3>
                  </div>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5, flex: 1 }}>
                    {cat.description}
                  </p>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                      {cat.subcategories.map(sc => (
                        <Link
                          key={sc.slug}
                          to={`/category/${cat.slug}?subcategory=${sc.slug}`}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {sc.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link to={`/category/${cat.slug}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span>Browse Category</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
};

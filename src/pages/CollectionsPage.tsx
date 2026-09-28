import React, { useEffect, useState } from 'react';
import { getCollections } from '../services/catalogService';
import { Collection } from '../types';
import { CollectionCard } from '../components/common/CollectionCard';
import { SEOHead } from '../components/layout/SEOHead';
import { Layers, Sparkles } from 'lucide-react';
import { trackEvent } from '../services/analyticsService';

export const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('page_view', { title: 'Collections Index', targetSlug: '/collections' });

    getCollections()
      .then(setCollections)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEOHead
        title="Curated Amazon Product Setups & Kits"
        description="Explore complete matching setups for study desks, car kits, and home workstations. Coordinated gear bundles that work together seamlessly."
        canonicalPath="/collections"
      />

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <Layers size={18} />
            <span>System B • Curated Groups</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Curated Shopping Setups
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px' }}>
            Stop buying random disconnected items. Every setup is curated to create an organized, ergonomic, and aesthetic space on Amazon.
          </p>
        </div>

        {/* Collections Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            Loading curated setups...
          </div>
        ) : collections.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {collections.map(col => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            No setups found.
          </div>
        )}

      </div>
    </>
  );
};

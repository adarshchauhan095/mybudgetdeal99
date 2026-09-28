import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Collection } from '../../types';

interface CollectionCardProps {
  collection: Collection;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  return (
    <div style={{
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all var(--transition-normal)'
    }}
    className="collection-card-hover"
    >
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        background: '#151d2f'
      }}>
        <img
          src={collection.coverImage}
          alt={collection.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          className="collection-img"
          loading="lazy"
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(11, 15, 25, 0.9) 0%, rgba(11, 15, 25, 0.2) 60%, transparent 100%)'
        }} />

        <div style={{
          position: 'absolute',
          top: '0.85rem',
          left: '0.85rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <span className="badge badge-trending" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)' }}>
            <Layers size={12} />
            {collection.productIds?.length || 0} Products Setup
          </span>
        </div>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
          {collection.title}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
          {collection.tagline || collection.description}
        </p>

        {collection.buyingChecklist && collection.buyingChecklist.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            color: 'var(--accent-green)',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={14} />
            <span>Includes complete setup checklist & tips</span>
          </div>
        )}

        <Link
          to={`/collection/${collection.slug}`}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <span>Explore Curated Setup</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <style>{`
        .collection-card-hover:hover {
          transform: translateY(-4px);
          border-color: var(--border-medium);
          box-shadow: var(--shadow-lg), 0 0 20px rgba(249, 115, 22, 0.1);
        }
        .collection-card-hover:hover .collection-img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

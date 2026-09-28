import React, { useEffect, useState } from 'react';
import {
  getBanners,
  saveBanner,
  deleteBanner
} from '../../services/catalogService';
import { Banner } from '../../types';
import { useSite } from '../../context/SiteContext';
import { logAdminAction } from '../../services/auditService';
import { Image as ImageIcon, Plus, Trash2, Edit } from 'lucide-react';

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const { showToast } = useSite();

  const loadData = () => {
    getBanners().then(setBanners);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNew = () => {
    setEditingBanner({
      id: `banner-${Date.now()}`,
      title: 'New Featured Carousel Banner',
      subtitle: 'Hand-picked gear and curated setups on Amazon under budget.',
      desktopImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Explore Now',
      ctaTarget: '/collections',
      linkedType: 'collection',
      linkedSlug: 'complete-study-table-setup',
      priority: 80,
      isActive: true,
      displayOrder: banners.length + 1
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner || !editingBanner.title) return;

    const toSave: Banner = {
      id: editingBanner.id || `banner-${Date.now()}`,
      title: editingBanner.title,
      subtitle: editingBanner.subtitle || '',
      desktopImage: editingBanner.desktopImage || 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1600&q=80',
      ctaText: editingBanner.ctaText || 'Explore Now',
      ctaTarget: editingBanner.ctaTarget || '/collections',
      linkedType: editingBanner.linkedType || 'custom',
      linkedSlug: editingBanner.linkedSlug || '',
      priority: editingBanner.priority || 80,
      isActive: editingBanner.isActive !== false,
      displayOrder: editingBanner.displayOrder || 1
    };

    await saveBanner(toSave);
    await logAdminAction('admin@mybudgetdeal99.com', 'Save Banner', 'banner', toSave.id, toSave.title);
    showToast('Banner saved!', 'success');
    setEditingBanner(null);
    loadData();
  };

  const handleDelete = async (b: Banner) => {
    if (window.confirm(`Delete banner "${b.title}"?`)) {
      await deleteBanner(b.id);
      await logAdminAction('admin@mybudgetdeal99.com', 'Delete Banner', 'banner', b.id, b.title);
      showToast('Banner deleted', 'info');
      loadData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
            Homepage Banner Carousel
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage hero visual banners, headlines, and call-to-action destinations
          </p>
        </div>

        <button onClick={handleNew} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Hero Banner</span>
        </button>
      </div>

      {editingBanner && (
        <form onSubmit={handleSave} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
            Configure Carousel Slide
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Banner Headline *
              </label>
              <input
                type="text"
                value={editingBanner.title || ''}
                onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Subtitle / Pitch
              </label>
              <input
                type="text"
                value={editingBanner.subtitle || ''}
                onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Image URL (1600x600 recommended) *
            </label>
            <input
              type="text"
              value={editingBanner.desktopImage || ''}
              onChange={(e) => setEditingBanner({ ...editingBanner, desktopImage: e.target.value })}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                CTA Button Text
              </label>
              <input
                type="text"
                value={editingBanner.ctaText || ''}
                onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                CTA Target Route
              </label>
              <input
                type="text"
                value={editingBanner.ctaTarget || ''}
                onChange={(e) => setEditingBanner({ ...editingBanner, ctaTarget: e.target.value })}
                placeholder="e.g. /collection/complete-study-table-setup"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Display Order
              </label>
              <input
                type="number"
                value={editingBanner.displayOrder || 1}
                onChange={(e) => setEditingBanner({ ...editingBanner, displayOrder: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setEditingBanner(null)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Banner
            </button>
          </div>
        </form>
      )}

      {/* Banners List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {banners.map((b) => (
          <div
            key={b.id}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ position: 'relative', height: '140px' }}>
              <img src={b.desktopImage} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11, 15, 25, 0.95), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem' }}>
                <span className="badge badge-trending">Order #{b.displayOrder}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>{b.title}</h3>
              </div>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{b.subtitle}</p>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                CTA: "{b.ctaText}" → {b.ctaTarget}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <button onClick={() => setEditingBanner(b)} className="card-action-btn" style={{ width: '30px', height: '30px' }}>
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(b)} className="card-action-btn" style={{ width: '30px', height: '30px', color: '#f87171' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

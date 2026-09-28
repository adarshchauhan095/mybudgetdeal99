import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getCollections,
  saveCollection,
  deleteCollection,
  getProducts
} from '../../services/catalogService';
import { Collection, Product } from '../../types';
import { useSite } from '../../context/SiteContext';
import { logAdminAction } from '../../services/auditService';
import { Layers, Plus, Edit, Trash2, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { generateSlug } from '../../services/amazonService';

export const AdminCollections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingCol, setEditingCol] = useState<Partial<Collection> | null>(null);
  const [checklistInput, setChecklistInput] = useState('');
  const [tipsInput, setTipsInput] = useState('');
  const { showToast } = useSite();

  const loadData = () => {
    Promise.all([getCollections(), getProducts()]).then(([cols, prods]) => {
      setCollections(cols);
      setProducts(prods);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (col: Collection) => {
    setEditingCol(col);
    setChecklistInput(col.buyingChecklist?.join('\n') || '');
    setTipsInput(col.editorialTips?.join('\n') || '');
  };

  const handleNew = () => {
    const newCol: Partial<Collection> = {
      id: `col-${Date.now()}`,
      title: '',
      slug: '',
      tagline: '',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
      categorySlug: 'office-and-study',
      tags: ['setup', 'curated'],
      productIds: [],
      buyingChecklist: [],
      editorialTips: [],
      isFeatured: true,
      status: 'active',
      priority: 90
    };
    setEditingCol(newCol);
    setChecklistInput('');
    setTipsInput('');
  };

  const handleToggleProduct = (prodId: string) => {
    if (!editingCol) return;
    const current = editingCol.productIds || [];
    const updated = current.includes(prodId)
      ? current.filter(id => id !== prodId)
      : [...current, prodId];
    setEditingCol({ ...editingCol, productIds: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol || !editingCol.title) {
      showToast('Collection title is required', 'error');
      return;
    }

    const checklist = checklistInput.split('\n').map(s => s.trim()).filter(Boolean);
    const tips = tipsInput.split('\n').map(s => s.trim()).filter(Boolean);

    const toSave: Collection = {
      id: editingCol.id || `col-${Date.now()}`,
      title: editingCol.title,
      slug: editingCol.slug || generateSlug(editingCol.title),
      tagline: editingCol.tagline || '',
      description: editingCol.description || editingCol.tagline || '',
      coverImage: editingCol.coverImage || 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
      categorySlug: editingCol.categorySlug || 'office-and-study',
      tags: editingCol.tags || ['setup'],
      productIds: editingCol.productIds || [],
      buyingChecklist: checklist,
      editorialTips: tips,
      isFeatured: !!editingCol.isFeatured,
      status: editingCol.status || 'active',
      priority: editingCol.priority || 80,
      createdAt: editingCol.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveCollection(toSave);
    await logAdminAction('admin@mybudgetdeal99.com', 'Save Collection', 'collection', toSave.id, toSave.title);
    showToast('Curated Setup saved!', 'success');
    setEditingCol(null);
    loadData();
  };

  const handleDelete = async (col: Collection) => {
    if (window.confirm(`Delete collection "${col.title}"?`)) {
      await deleteCollection(col.id);
      await logAdminAction('admin@mybudgetdeal99.com', 'Delete Collection', 'collection', col.id, col.title);
      showToast('Collection deleted', 'info');
      loadData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
            Curated Setups & Groups (System B)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Build coordinated product sets (e.g., Complete Study Table Setup, Car Essentials)
          </p>
        </div>

        <button onClick={handleNew} className="btn btn-primary">
          <Plus size={18} />
          <span>Create New Setup</span>
        </button>
      </div>

      {/* Edit Form Modal/Drawer */}
      {editingCol && (
        <form onSubmit={handleSave} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
            {editingCol.id?.startsWith('col-') && !collections.find(c => c.id === editingCol.id) ? 'New Curated Setup' : 'Edit Curated Setup'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Setup Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Complete Reception Desk Setup"
                value={editingCol.title || ''}
                onChange={(e) => setEditingCol({ ...editingCol, title: e.target.value, slug: generateSlug(e.target.value) })}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Slug (URL Path)
              </label>
              <input
                type="text"
                value={editingCol.slug || ''}
                onChange={(e) => setEditingCol({ ...editingCol, slug: e.target.value })}
                style={{ width: '100%' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Tagline / Short Intro
            </label>
            <input
              type="text"
              placeholder="e.g. Everything you need for an organized, ergonomic study space."
              value={editingCol.tagline || ''}
              onChange={(e) => setEditingCol({ ...editingCol, tagline: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Cover Image URL
            </label>
            <input
              type="text"
              value={editingCol.coverImage || ''}
              onChange={(e) => setEditingCol({ ...editingCol, coverImage: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          {/* Phase 47 Editorial Checklist & Tips Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Buying Checklist (1 per line)
              </label>
              <textarea
                rows={4}
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                placeholder="Check desk dimensions&#10;Verify lamp has warm color modes&#10;Measure cable distance to power outlet"
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Editorial Setup Tips (1 per line)
              </label>
              <textarea
                rows={4}
                value={tipsInput}
                onChange={(e) => setTipsInput(e.target.value)}
                placeholder="Keep only active notebooks on desktop&#10;Angle task light from left if right-handed"
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Assign Products to Collection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              Assign Products to this Setup ({editingCol.productIds?.length || 0} selected)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.5rem',
              maxHeight: '220px',
              overflowY: 'auto',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)'
            }}>
              {products.map(p => (
                <label
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    color: editingCol.productIds?.includes(p.id) ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editingCol.productIds?.includes(p.id)}
                    onChange={() => handleToggleProduct(p.id)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setEditingCol(null)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Setup
            </button>
          </div>
        </form>
      )}

      {/* Existing Collections Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {collections.map(col => (
          <div
            key={col.id}
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
              <img src={col.coverImage} alt={col.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11, 15, 25, 0.95), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem' }}>
                <span className="badge badge-trending" style={{ marginBottom: '0.25rem' }}>
                  {col.productIds?.length || 0} Products
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                  {col.title}
                </h3>
              </div>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {col.tagline || col.description}
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <Link to={`/collection/${col.slug}`} target="_blank" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>View Live</span>
                  <ExternalLink size={12} />
                </Link>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => handleEdit(col)} className="card-action-btn" style={{ width: '30px', height: '30px' }}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(col)} className="card-action-btn" style={{ width: '30px', height: '30px', color: '#f87171' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

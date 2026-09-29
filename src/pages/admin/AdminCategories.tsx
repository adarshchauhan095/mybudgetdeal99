import React, { useEffect, useState } from 'react';
import {
  getCategories,
  saveCategory,
  deleteCategory
} from '../../services/catalogService';
import { Category, SubCategory } from '../../types';
import { useSite } from '../../context/SiteContext';
import { logAdminAction } from '../../services/auditService';
import { FolderTree, Plus, Edit, Trash2, CheckCircle2, Upload, Image, X } from 'lucide-react';
import { generateSlug } from '../../services/amazonService';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);
  const [subcatsInput, setSubcatsInput] = useState('');
  const { showToast } = useSite();

  const loadData = () => {
    getCategories().then(setCategories);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (cat: Category) => {
    setEditingCat(cat);
    setSubcatsInput(cat.subcategories?.map(s => s.name).join(', ') || '');
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && editingCat) {
        setEditingCat(prev => prev ? ({ ...prev, imageUrl: dataUrl }) : null);
        showToast('Category image attached successfully', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNew = () => {
    setEditingCat({
      id: `cat-${Date.now()}`,
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      priority: 80,
      isActive: true,
      subcategories: []
    });
    setSubcatsInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCat.name) {
      showToast('Category name is required', 'error');
      return;
    }

    const subList: SubCategory[] = subcatsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(name => ({ name, slug: generateSlug(name) }));

    const toSave: Category = {
      id: editingCat.id || `cat-${Date.now()}`,
      name: editingCat.name,
      slug: editingCat.slug || generateSlug(editingCat.name),
      description: editingCat.description || '',
      imageUrl: editingCat.imageUrl || '',
      priority: editingCat.priority || 80,
      isActive: editingCat.isActive !== false,
      subcategories: subList,
      createdAt: editingCat.createdAt || new Date().toISOString()
    };

    await saveCategory(toSave);
    await logAdminAction('admin@mybudgetdeal99.com', 'Save Category', 'category', toSave.id, toSave.name);
    showToast('Category saved successfully!', 'success');
    setEditingCat(null);
    loadData();
  };

  const handleDelete = async (cat: Category) => {
    if (window.confirm(`Delete category "${cat.name}"?`)) {
      await deleteCategory(cat.id);
      await logAdminAction('admin@mybudgetdeal99.com', 'Delete Category', 'category', cat.id, cat.name);
      showToast('Category deleted', 'info');
      loadData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
            Category & Taxonomy Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Configure shopping departments and subcategory structures
          </p>
        </div>

        <button onClick={handleNew} className="btn btn-primary">
          <Plus size={18} />
          <span>New Department</span>
        </button>
      </div>

      {editingCat && (
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
            {categories.find(c => c.id === editingCat.id) ? 'Edit Department' : 'Create Department'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Department Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Smart Home & Lighting"
                value={editingCat.name || ''}
                onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value, slug: generateSlug(e.target.value) })}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Slug (URL Identifier)
              </label>
              <input
                type="text"
                value={editingCat.slug || ''}
                onChange={(e) => setEditingCat({ ...editingCat, slug: e.target.value })}
                style={{ width: '100%' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Description
            </label>
            <input
              type="text"
              value={editingCat.description || ''}
              onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              Department Image (Upload or URL)
            </label>
            
            {editingCat.imageUrl ? (
              <div style={{
                position: 'relative',
                display: 'inline-block',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                marginBottom: '0.75rem',
                maxHeight: '140px'
              }}>
                <img
                  src={editingCat.imageUrl}
                  alt="Department preview"
                  style={{ height: '120px', width: '220px', objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={() => setEditingCat({ ...editingCat, imageUrl: '' })}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '4px',
                    cursor: 'pointer'
                  }}
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                background: 'rgba(255, 153, 0, 0.1)',
                border: '1px dashed var(--accent-primary)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                <Upload size={16} />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or paste URL:</span>

              <input
                type="text"
                placeholder="https://..."
                value={editingCat.imageUrl || ''}
                onChange={(e) => setEditingCat({ ...editingCat, imageUrl: e.target.value })}
                style={{ flex: 1, minWidth: '220px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Subcategories (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Smart Plugs, LED Strips, Motion Sensors"
              value={subcatsInput}
              onChange={(e) => setSubcatsInput(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setEditingCat(null)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Department
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {categories.map(cat => (
          <div
            key={cat.id}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                {cat.name}
              </h3>
              <span className="badge badge-verified">
                Active
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {cat.description}
            </p>

            {cat.subcategories && cat.subcategories.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                {cat.subcategories.map(sc => (
                  <span key={sc.slug} style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
                    {sc.name}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <button onClick={() => handleEdit(cat)} className="card-action-btn" style={{ width: '30px', height: '30px' }}>
                <Edit size={14} />
              </button>
              <button onClick={() => handleDelete(cat)} className="card-action-btn" style={{ width: '30px', height: '30px', color: '#f87171' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  getHomepageSections,
  saveHomepageSections
} from '../../services/catalogService';
import { HomepageSection, SectionType } from '../../types';
import { useSite } from '../../context/SiteContext';
import { logAdminAction } from '../../services/auditService';
import { Sliders, ArrowUp, ArrowDown, Eye, EyeOff, Save, CheckCircle2, Plus, Trash2, X } from 'lucide-react';

export const AdminHomepageBuilder: React.FC = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [saving, setSaving] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSection, setNewSection] = useState<{
    title: string;
    subtitle: string;
    sectionType: SectionType;
    contentSource: 'featured' | 'trending' | 'deals' | 'newest' | 'custom';
    itemLimit: number;
  }>({
    title: '',
    subtitle: '',
    sectionType: 'trending_products',
    contentSource: 'featured',
    itemLimit: 6
  });
  const { showToast } = useSite();

  useEffect(() => {
    getHomepageSections().then(setSections);
  }, []);

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...sections];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    updated.forEach((s, i) => (s.order = i + 1));
    setSections(updated);
  };

  const moveDown = (idx: number) => {
    if (idx === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    updated.forEach((s, i) => (s.order = i + 1));
    setSections(updated);
  };

  const toggleVisibility = (idx: number) => {
    const updated = [...sections];
    updated[idx].isVisible = !updated[idx].isVisible;
    setSections(updated);
  };

  const handleTitleChange = (idx: number, title: string) => {
    const updated = [...sections];
    updated[idx].title = title;
    setSections(updated);
  };

  const handleSubtitleChange = (idx: number, subtitle: string) => {
    const updated = [...sections];
    updated[idx].subtitle = subtitle;
    setSections(updated);
  };

  const handleLimitChange = (idx: number, limit: number) => {
    const updated = [...sections];
    updated[idx].itemLimit = limit;
    setSections(updated);
  };

  const handleDeleteSection = (idx: number) => {
    const target = sections[idx];
    if (window.confirm(`Delete section "${target.title}" from homepage?`)) {
      const updated = sections.filter((_, i) => i !== idx);
      updated.forEach((s, i) => (s.order = i + 1));
      setSections(updated);
      showToast(`Removed "${target.title}" section`, 'info');
    }
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSection.title.trim()) {
      showToast('Section title is required', 'error');
      return;
    }

    const created: HomepageSection = {
      id: `sec-${Date.now()}`,
      sectionType: newSection.sectionType,
      title: newSection.title.trim(),
      subtitle: newSection.subtitle.trim() || undefined,
      contentSource: newSection.contentSource,
      itemLimit: newSection.itemLimit || 6,
      order: sections.length + 1,
      isVisible: true
    };

    setSections([...sections, created]);
    setIsAddingNew(false);
    setNewSection({
      title: '',
      subtitle: '',
      sectionType: 'trending_products',
      contentSource: 'featured',
      itemLimit: 6
    });
    showToast(`Added section "${created.title}"`, 'success');
  };

  const handleSave = async () => {
    setSaving(true);
    await saveHomepageSections(sections);
    await logAdminAction('admin@mybudgetdeal99.com', 'Update Homepage Layout', 'settings', 'homepage', 'Homepage Sections');
    setSaving(false);
    showToast('Homepage layout updated successfully!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
            Homepage Layout Builder
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Add, delete, reorder, and configure custom sections directly displayed on your homepage
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="btn btn-secondary"
          >
            <Plus size={18} />
            <span>Add Section</span>
          </button>

          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save Layout'}</span>
          </button>
        </div>
      </div>

      {isAddingNew && (
        <form onSubmit={handleCreateSection} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              Add New Homepage Section
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="card-action-btn"
              style={{ width: '28px', height: '28px' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Section Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Budget Best-Sellers Under ₹999"
                value={newSection.title}
                onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Subtitle / Pitch
              </label>
              <input
                type="text"
                placeholder="e.g. Handpicked customer favorites with instant Prime delivery"
                value={newSection.subtitle}
                onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Section Display Type
              </label>
              <select
                value={newSection.sectionType}
                onChange={(e) => setNewSection({ ...newSection, sectionType: e.target.value as SectionType })}
                style={{ width: '100%' }}
              >
                <option value="trending_products">Trending Products Carousel</option>
                <option value="featured_deals">Featured Deals Spotlight</option>
                <option value="curated_collections">Curated Collections Grid</option>
                <option value="popular_categories">Popular Categories Grid</option>
                <option value="best_value">Best Value Under Budget</option>
                <option value="editorial">Editorial Trust Block</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Content Source
              </label>
              <select
                value={newSection.contentSource}
                onChange={(e) => setNewSection({ ...newSection, contentSource: e.target.value as any })}
                style={{ width: '100%' }}
              >
                <option value="featured">Featured Catalog</option>
                <option value="trending">Trending Deals</option>
                <option value="deals">Active Lightning Deals</option>
                <option value="newest">Latest Added</option>
                <option value="custom">Curated Manual Set</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Item Limit
              </label>
              <input
                type="number"
                min="2"
                max="24"
                value={newSection.itemLimit}
                onChange={(e) => setNewSection({ ...newSection, itemLimit: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
            >
              Add Section to Front-End
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            style={{
              background: 'var(--bg-card)',
              border: sec.isVisible ? '1px solid var(--border-subtle)' : '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              opacity: sec.isVisible ? 1 : 0.6,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--accent-primary)'
              }}>
                #{sec.order}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => handleTitleChange(idx, e.target.value)}
                  placeholder="Section Title"
                  style={{ fontWeight: 700, fontSize: '1rem', background: 'transparent', border: '1px solid var(--border-subtle)', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
                />
                <input
                  type="text"
                  value={sec.subtitle || ''}
                  onChange={(e) => handleSubtitleChange(idx, e.target.value)}
                  placeholder="Section subtitle / catchphrase (optional)"
                  style={{ fontSize: '0.82rem', background: 'transparent', border: '1px dashed var(--border-subtle)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Type: <code>{sec.sectionType}</code> • Source: <code>{sec.contentSource || 'default'}</code>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>Limit:</span>
                <input
                  type="number"
                  min="2"
                  max="24"
                  value={sec.itemLimit}
                  onChange={(e) => handleLimitChange(idx, Number(e.target.value))}
                  style={{ width: '60px', padding: '0.3rem 0.5rem', textAlign: 'center' }}
                />
              </div>

              <button
                type="button"
                onClick={() => toggleVisibility(idx)}
                className="btn btn-secondary btn-sm"
                title={sec.isVisible ? 'Hide Section' : 'Show Section'}
              >
                {sec.isVisible ? <Eye size={16} color="var(--accent-green)" /> : <EyeOff size={16} />}
                <span>{sec.isVisible ? 'Visible' : 'Hidden'}</span>
              </button>

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="card-action-btn"
                  style={{ width: '32px', height: '32px', opacity: idx === 0 ? 0.3 : 1 }}
                  title="Move Up"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === sections.length - 1}
                  className="card-action-btn"
                  style={{ width: '32px', height: '32px', opacity: idx === sections.length - 1 ? 0.3 : 1 }}
                  title="Move Down"
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSection(idx)}
                  className="card-action-btn"
                  style={{ width: '32px', height: '32px', color: 'var(--accent-red)' }}
                  title="Delete Section"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  getHomepageSections,
  saveHomepageSections
} from '../../services/catalogService';
import { HomepageSection } from '../../types';
import { useSite } from '../../context/SiteContext';
import { logAdminAction } from '../../services/auditService';
import { Sliders, ArrowUp, ArrowDown, Eye, EyeOff, Save, CheckCircle2 } from 'lucide-react';

export const AdminHomepageBuilder: React.FC = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [saving, setSaving] = useState(false);
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
    // Reassign order
    updated.forEach((s, i) => (s.order = i + 1));
    setSections(updated);
  };

  const moveDown = (idx: number) => {
    if (idx === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    // Reassign order
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

  const handleLimitChange = (idx: number, limit: number) => {
    const updated = [...sections];
    updated[idx].itemLimit = limit;
    setSections(updated);
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
            Control section order, titles, item limits, and visibility on the storefront
          </p>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          <Save size={18} />
          <span>{saving ? 'Saving...' : 'Save Layout'}</span>
        </button>
      </div>

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

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => handleTitleChange(idx, e.target.value)}
                  style={{ fontWeight: 700, fontSize: '1rem', background: 'transparent', border: '1px solid transparent', padding: '0.2rem 0.4rem' }}
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
                  max="20"
                  value={sec.itemLimit}
                  onChange={(e) => handleLimitChange(idx, Number(e.target.value))}
                  style={{ width: '60px', padding: '0.3rem 0.5rem', textAlign: 'center' }}
                />
              </div>

              <button
                onClick={() => toggleVisibility(idx)}
                className="btn btn-secondary btn-sm"
                title={sec.isVisible ? 'Hide Section' : 'Show Section'}
              >
                {sec.isVisible ? <Eye size={16} color="var(--accent-green)" /> : <EyeOff size={16} />}
                <span>{sec.isVisible ? 'Visible' : 'Hidden'}</span>
              </button>

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="card-action-btn"
                  style={{ width: '32px', height: '32px', opacity: idx === 0 ? 0.3 : 1 }}
                  title="Move Up"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === sections.length - 1}
                  className="card-action-btn"
                  style={{ width: '32px', height: '32px', opacity: idx === sections.length - 1 ? 0.3 : 1 }}
                  title="Move Down"
                >
                  <ArrowDown size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

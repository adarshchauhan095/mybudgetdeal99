import React, { useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { SiteSettings } from '../../types';
import { syncAllToFirestore } from '../../services/catalogService';
import { logAdminAction } from '../../services/auditService';
import { Settings, ShieldCheck, Database, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, showToast } = useSite();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [syncing, setSyncing] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    await logAdminAction('admin@mybudgetdeal99.com', 'Update Site Settings', 'settings', 'general', 'Platform Settings');
  };

  const handleSyncFirestore = async () => {
    setSyncing(true);
    const res = await syncAllToFirestore();
    setSyncing(false);
    if (res.success) {
      showToast(`Synced ${res.count} items to Firestore successfully!`, 'success');
    } else {
      showToast(`Firestore Sync Error: ${res.error}. (Local fallback active)`, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px' }}>
      
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
          Affiliate & Platform Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Centralized Amazon Associates credentials, compliance text, and Firestore sync
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Amazon Associates Credentials */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <ShieldCheck size={18} />
            <span>Amazon Associates Credentials</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Associates Tracking ID *
              </label>
              <input
                type="text"
                value={formData.amazonTrackingId}
                onChange={(e) => setFormData({ ...formData, amazonTrackingId: e.target.value })}
                style={{ width: '100%', fontFamily: 'monospace' }}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Appended to all outbound "View on Amazon" links
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Default Amazon Marketplace
              </label>
              <select
                value={formData.defaultMarketplace}
                onChange={(e) => setFormData({ ...formData, defaultMarketplace: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="amazon.in">Amazon India (amazon.in)</option>
                <option value="amazon.com">Amazon US (amazon.com)</option>
                <option value="amazon.co.uk">Amazon UK (amazon.co.uk)</option>
                <option value="amazon.ca">Amazon Canada (amazon.ca)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Mandatory Amazon Operating Agreement Disclosure *
            </label>
            <textarea
              rows={3}
              value={formData.affiliateDisclosure}
              onChange={(e) => setFormData({ ...formData, affiliateDisclosure: e.target.value })}
              style={{ width: '100%', fontSize: '0.88rem' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Pricing & Stock Timestamp Disclaimer
            </label>
            <textarea
              rows={3}
              value={formData.priceDisclaimer}
              onChange={(e) => setFormData({ ...formData, priceDisclaimer: e.target.value })}
              style={{ width: '100%', fontSize: '0.88rem' }}
              required
            />
          </div>
        </div>

        {/* General Site Branding */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            General Branding
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Platform Name
              </label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Default Currency
              </label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Support Email
            </label>
            <input
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.85rem 2rem' }}>
          <Save size={18} />
          <span>Save Platform Settings</span>
        </button>
      </form>

      {/* Database Synchronization Panel */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '1rem' }}>
          <Database size={18} />
          <span>Firestore Cloud Database Sync</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Project: <code>mybudgetdeal99-f5d2a</code>. Click below to push all current local seed products, setups, categories, deals, and settings directly into your remote Firestore cloud collections.
        </p>

        <button
          type="button"
          onClick={handleSyncFirestore}
          disabled={syncing}
          className="btn btn-secondary"
          style={{ alignSelf: 'flex-start' }}
        >
          <Database size={16} color="var(--accent-blue)" />
          <span>{syncing ? 'Pushing Data...' : 'Push All Catalog Data to Firestore'}</span>
        </button>
      </div>

    </div>
  );
};

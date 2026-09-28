import React, { useEffect, useState } from 'react';
import {
  getDeals,
  saveDeal,
  deleteDeal,
  getProducts
} from '../../services/catalogService';
import { Deal, Product } from '../../types';
import { useSite } from '../../context/SiteContext';
import { logAdminAction } from '../../services/auditService';
import { Zap, Plus, Trash2, Edit, CheckCircle2 } from 'lucide-react';

export const AdminDeals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingDeal, setEditingDeal] = useState<Partial<Deal> | null>(null);
  const { formatPrice, showToast } = useSite();

  const loadData = () => {
    Promise.all([getDeals(), getProducts()]).then(([dList, pList]) => {
      setDeals(dList);
      setProducts(pList);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNew = () => {
    const defaultProd = products[0];
    setEditingDeal({
      id: `deal-${Date.now()}`,
      productId: defaultProd?.id || '',
      productTitle: defaultProd?.title || '',
      dealTitle: 'Special Limited Discount',
      badgeText: '40% OFF',
      currentPrice: defaultProd?.currentPrice || 999,
      previousPrice: defaultProd?.previousPrice || 1999,
      discountPercentage: 40,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      status: 'active',
      priority: 90
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal || !editingDeal.productId) {
      showToast('Please select a product for the deal', 'error');
      return;
    }

    const prod = products.find(p => p.id === editingDeal.productId);
    const toSave: Deal = {
      id: editingDeal.id || `deal-${Date.now()}`,
      productId: editingDeal.productId,
      productTitle: prod ? prod.title : editingDeal.productTitle || '',
      dealTitle: editingDeal.dealTitle || 'Verified Amazon Deal',
      badgeText: editingDeal.badgeText || `${editingDeal.discountPercentage}% OFF`,
      currentPrice: editingDeal.currentPrice,
      previousPrice: editingDeal.previousPrice,
      discountPercentage: Number(editingDeal.discountPercentage) || 30,
      startDate: editingDeal.startDate || new Date().toISOString(),
      endDate: editingDeal.endDate || new Date(Date.now() + 86400000 * 7).toISOString(),
      status: editingDeal.status || 'active',
      priority: editingDeal.priority || 80
    };

    await saveDeal(toSave);
    await logAdminAction('admin@mybudgetdeal99.com', 'Save Deal', 'deal', toSave.id, toSave.dealTitle);
    showToast('Deal updated successfully!', 'success');
    setEditingDeal(null);
    loadData();
  };

  const handleDelete = async (deal: Deal) => {
    if (window.confirm(`Delete deal "${deal.dealTitle}"?`)) {
      await deleteDeal(deal.id);
      await logAdminAction('admin@mybudgetdeal99.com', 'Delete Deal', 'deal', deal.id, deal.dealTitle);
      showToast('Deal removed', 'info');
      loadData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
            Verified Deals Hub Manager
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Configure featured price drops, discounts, and expiry schedules
          </p>
        </div>

        <button onClick={handleNew} className="btn btn-primary">
          <Plus size={18} />
          <span>Create New Deal</span>
        </button>
      </div>

      {editingDeal && (
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
            Configure Deal
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Select Product *
            </label>
            <select
              value={editingDeal.productId || ''}
              onChange={(e) => {
                const p = products.find(prod => prod.id === e.target.value);
                setEditingDeal({
                  ...editingDeal,
                  productId: e.target.value,
                  productTitle: p?.title,
                  currentPrice: p?.currentPrice,
                  previousPrice: p?.previousPrice,
                  discountPercentage: p?.discountPercentage
                });
              }}
              style={{ width: '100%' }}
              required
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.asin}) — {formatPrice(p.currentPrice)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Deal Title / Campaign
              </label>
              <input
                type="text"
                value={editingDeal.dealTitle || ''}
                onChange={(e) => setEditingDeal({ ...editingDeal, dealTitle: e.target.value })}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Badge Text
              </label>
              <input
                type="text"
                value={editingDeal.badgeText || ''}
                onChange={(e) => setEditingDeal({ ...editingDeal, badgeText: e.target.value })}
                placeholder="e.g. 50% OFF"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Discount Percentage (%)
              </label>
              <input
                type="number"
                value={editingDeal.discountPercentage || ''}
                onChange={(e) => setEditingDeal({ ...editingDeal, discountPercentage: Number(e.target.value) })}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Status
              </label>
              <select
                value={editingDeal.status || 'active'}
                onChange={(e) => setEditingDeal({ ...editingDeal, status: e.target.value as any })}
                style={{ width: '100%' }}
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setEditingDeal(null)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Deal
            </button>
          </div>
        </form>
      )}

      {/* Deals Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Deal Campaign</th>
              <th style={{ padding: '0.85rem 1rem' }}>Linked Product</th>
              <th style={{ padding: '0.85rem 1rem' }}>Discount Badge</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.map(deal => (
              <tr key={deal.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#ffffff' }}>
                  {deal.dealTitle}
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {deal.productTitle}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span className="badge badge-deal">{deal.badgeText}</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span className="badge badge-verified">{deal.status}</span>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <button onClick={() => setEditingDeal(deal)} className="card-action-btn" style={{ width: '30px', height: '30px' }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(deal)} className="card-action-btn" style={{ width: '30px', height: '30px', color: '#f87171' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

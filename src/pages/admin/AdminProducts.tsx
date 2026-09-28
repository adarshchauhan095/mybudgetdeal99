import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getProducts,
  saveProduct,
  deleteProduct
} from '../../services/catalogService';
import { Product } from '../../types';
import { useSite } from '../../context/SiteContext';
import { logAdminAction } from '../../services/auditService';
import {
  Package,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Zap,
  CheckCircle2,
  EyeOff,
  Filter,
  Layers
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice, showToast } = useSite();

  const loadData = () => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    const updated = { ...product, status: newStatus as any };
    await saveProduct(updated);
    await logAdminAction('admin@mybudgetdeal99.com', `Toggle status to ${newStatus}`, 'product', product.id, product.title);
    showToast(`Product status changed to ${newStatus}`, 'success');
    loadData();
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
      await deleteProduct(product.id);
      await logAdminAction('admin@mybudgetdeal99.com', 'Delete product', 'product', product.id, product.title);
      showToast('Product deleted from catalog', 'info');
      loadData();
    }
  };

  // Bulk Operations (Phase 11 & 34)
  const handleBulkActivate = async () => {
    for (const id of selectedIds) {
      const p = products.find(prod => prod.id === id);
      if (p) await saveProduct({ ...p, status: 'active' });
    }
    showToast(`Activated ${selectedIds.length} products`, 'success');
    setSelectedIds([]);
    loadData();
  };

  const handleBulkDeactivate = async () => {
    for (const id of selectedIds) {
      const p = products.find(prod => prod.id === id);
      if (p) await saveProduct({ ...p, status: 'inactive' });
    }
    showToast(`Deactivated ${selectedIds.length} products`, 'info');
    setSelectedIds([]);
    loadData();
  };

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.asin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
            Product Catalog Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Total catalog items: <strong>{products.length}</strong>
          </p>
        </div>

        <Link to="/admin/products/new" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add Product from Amazon URL</span>
        </Link>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by title, ASIN, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', fontSize: '0.85rem' }}
          />
        </div>

        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {selectedIds.length} selected:
            </span>
            <button onClick={handleBulkActivate} className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-green)' }}>
              Activate
            </button>
            <button onClick={handleBulkDeactivate} className="btn btn-secondary btn-sm" style={{ color: 'var(--text-muted)' }}>
              Deactivate
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '0.85rem 1rem', width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filtered.length && filtered.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(filtered.map(p => p.id));
                    else setSelectedIds([]);
                  }}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
              </th>
              <th style={{ padding: '0.85rem 1rem' }}>Product</th>
              <th style={{ padding: '0.85rem 1rem' }}>ASIN</th>
              <th style={{ padding: '0.85rem 1rem' }}>Department</th>
              <th style={{ padding: '0.85rem 1rem' }}>Price & Discount</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading catalog...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(prod.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(prev => [...prev, prod.id]);
                        else setSelectedIds(prev => prev.filter(id => id !== prod.id));
                      }}
                      style={{ accentColor: 'var(--accent-primary)' }}
                    />
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        style={{ width: '42px', height: '42px', objectFit: 'contain', background: '#151d2f', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#ffffff', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {prod.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                          {prod.brand} {prod.isDeal && '• Deal Active'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <code style={{ fontSize: '0.82rem', color: 'var(--accent-blue)', background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                      {prod.asin}
                    </code>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {prod.categoryName}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>
                      {prod.currentPrice ? formatPrice(prod.currentPrice, prod.currency) : '—'}
                    </div>
                    {prod.discountPercentage && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>
                        {prod.discountPercentage}% OFF
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <button
                      onClick={() => handleToggleStatus(prod)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: prod.status === 'active' ? 'var(--accent-green-bg)' : 'rgba(255, 255, 255, 0.05)',
                        color: prod.status === 'active' ? 'var(--accent-green)' : 'var(--text-muted)',
                        border: prod.status === 'active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer'
                      }}
                    >
                      {prod.status}
                    </button>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <a
                        href={prod.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-action-btn"
                        style={{ width: '30px', height: '30px' }}
                        title="Test Amazon Affiliate Link"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <Link
                        to={`/admin/products/edit/${prod.id}`}
                        className="card-action-btn"
                        style={{ width: '30px', height: '30px' }}
                        title="Edit Product"
                      >
                        <Edit size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(prod)}
                        className="card-action-btn"
                        style={{ width: '30px', height: '30px', color: '#f87171' }}
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

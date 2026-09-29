import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getProductBySlug,
  saveProduct,
  getCategories
} from '../../services/catalogService';
import {
  parseAmazonUrl,
  buildAffiliateUrl,
  generateSlug
} from '../../services/amazonService';
import { Product, Category } from '../../types';
import { useSite } from '../../context/SiteContext';
import { logAdminAction } from '../../services/auditService';
import {
  ArrowLeft,
  Sparkles,
  Link as LinkIcon,
  Upload,
  X,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';

export const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { settings, showToast, formatPrice } = useSite();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState('');

  // Simplified Form State — only the minimum essential fields
  const [productData, setProductData] = useState<Partial<Product>>({
    id: `prod-${Date.now()}`,
    asin: '',
    title: '',
    slug: '',
    categorySlug: 'office-and-study',
    categoryName: 'Office & Study',
    imageUrl: '',
    additionalImages: [],
    amazonUrl: '',
    affiliateUrl: '',
    currency: 'INR',
    previousPrice: 999, // MRP / Original price
    currentPrice: 449,  // Discounted price
    discountPercentage: 55,
    hookLine: '',       // Emotional hook / FOMO / Life benefit
    description: '',    // Main description
    status: 'active',
    isDeal: true,
    priceDisplayStatus: 'show',
    availabilityStatus: 'in_stock'
  });

  const [amazonUrlInput, setAmazonUrlInput] = useState('');
  const [extraImageUrlInput, setExtraImageUrlInput] = useState('');

  useEffect(() => {
    getCategories().then(setCategories);

    if (!isNew && id) {
      setLoading(true);
      getProductBySlug(id).then((p) => {
        if (p) {
          setProductData(p);
          setAmazonUrlInput(p.amazonUrl || p.affiliateUrl || '');
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  // Handle Price Changes & Auto-calculate Discount %
  const handlePriceChange = (field: 'previousPrice' | 'currentPrice', val: number) => {
    setProductData(prev => {
      const prevPrice = field === 'previousPrice' ? val : (prev.previousPrice || 0);
      const currPrice = field === 'currentPrice' ? val : (prev.currentPrice || 0);
      let discount = prev.discountPercentage;
      if (prevPrice > 0 && currPrice > 0 && prevPrice >= currPrice) {
        discount = Math.round(((prevPrice - currPrice) / prevPrice) * 100);
      }
      return {
        ...prev,
        [field]: val,
        discountPercentage: discount,
        isDeal: (discount || 0) > 0
      };
    });
  };

  // Amazon URL Parser & Auto-generator
  const handleAmazonUrlChange = (url: string) => {
    setAmazonUrlInput(url);
    if (!url.trim()) return;

    const parsed = parseAmazonUrl(url);
    if (parsed.isValid && parsed.asin) {
      const affUrl = buildAffiliateUrl(parsed.asin, settings.amazonTrackingId, parsed.marketplace);
      setProductData(prev => ({
        ...prev,
        asin: parsed.asin,
        amazonUrl: parsed.canonicalUrl || url,
        affiliateUrl: affUrl,
        slug: prev.slug || (prev.title ? generateSlug(prev.title, parsed.asin) : generateSlug(`product-${parsed.asin}`, parsed.asin))
      }));
    }
  };

  // Main Image Upload Handler
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, WEBP).');
      showToast('Invalid file format. Please upload an image.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image file size must be less than 5 MB.');
      showToast('Image too large (max 5MB).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setProductData(prev => ({ ...prev, imageUrl: dataUrl }));
        setImageError('');
        showToast('Main product image uploaded!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Additional Gallery Image Upload Handler (Multiple Files)
  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setProductData(prev => ({
            ...prev,
            additionalImages: [...(prev.additionalImages || []), dataUrl]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    showToast('Additional image(s) uploaded', 'success');
  };

  const handleAddExtraImageByUrl = () => {
    if (!extraImageUrlInput.trim()) return;
    setProductData(prev => ({
      ...prev,
      additionalImages: [...(prev.additionalImages || []), extraImageUrlInput.trim()]
    }));
    setExtraImageUrlInput('');
    showToast('Image URL added to gallery', 'success');
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setProductData(prev => {
      const list = [...(prev.additionalImages || [])];
      list.splice(index, 1);
      return { ...prev, additionalImages: list };
    });
  };

  // Submission Validation
  const hasValidImage = !!productData.imageUrl && productData.imageUrl.trim().length > 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productData.title || productData.title.trim().length < 3) {
      showToast('Please enter a clear product title', 'error');
      return;
    }

    if (!hasValidImage) {
      setImageError('Product image is MANDATORY. Please upload or provide an image.');
      showToast('Main product image is mandatory', 'error');
      return;
    }

    if (!productData.affiliateUrl && !productData.amazonUrl) {
      showToast('Please provide an Amazon product link or ASIN', 'error');
      return;
    }

    setSaving(true);
    try {
      const selectedCategory = categories.find(c => c.slug === productData.categorySlug);

      const finalProduct: Product = {
        id: productData.id || `prod-${Date.now()}`,
        asin: productData.asin || 'B000000000',
        title: productData.title.trim(),
        shortTitle: productData.title.trim().slice(0, 60),
        slug: productData.slug || generateSlug(productData.title, productData.asin || 'mbd'),
        categorySlug: productData.categorySlug || 'office-and-study',
        categoryName: selectedCategory ? selectedCategory.name : (productData.categoryName || 'General'),
        brand: productData.brand || 'Amazon Verified',
        imageUrl: productData.imageUrl!,
        additionalImages: productData.additionalImages || [],
        amazonUrl: productData.amazonUrl || productData.affiliateUrl || '',
        affiliateUrl: productData.affiliateUrl || productData.amazonUrl || '',
        currency: 'INR',
        previousPrice: Number(productData.previousPrice) || undefined,
        currentPrice: Number(productData.currentPrice) || undefined,
        discountPercentage: Number(productData.discountPercentage) || undefined,
        hookLine: productData.hookLine?.trim() || '',
        description: productData.description?.trim() || '',
        status: 'active',
        isDeal: !!(productData.discountPercentage && productData.discountPercentage > 0),
        isFeatured: false,
        isTrending: true,
        isNew: false,
        priceDisplayStatus: 'show',
        availabilityStatus: 'in_stock',
        highlights: [],
        tags: [productData.categorySlug || 'deal'],
        collectionSlugs: [],
        keywords: [],
        priority: 85,
        source: 'admin_manual',
        lastVerified: new Date().toISOString(),
        createdAt: productData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveProduct(finalProduct);
      await logAdminAction('admin@mybudgetdeal99.com', isNew ? 'Create Product' : 'Update Product', 'product', finalProduct.id, finalProduct.title);
      showToast(`Product "${finalProduct.title}" saved successfully!`, 'success');
      navigate('/admin/products');
    } catch (err) {
      console.error('Error saving product', err);
      showToast('Failed to save product. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading product details...
      </div>
    );
  }

  const savingsAmount = (productData.previousPrice || 0) - (productData.currentPrice || 0);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/products" className="card-action-btn" title="Back to products list">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              {isNew ? 'Add New Product' : 'Edit Product'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Only the actual essential details shown to customers during purchase
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
        >
          {saving ? 'Saving...' : (isNew ? 'Publish to Front-End' : 'Save Changes')}
        </button>
      </div>

      {/* Main Simplified Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* 1. Product Title & Amazon URL */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>1. Product Identity & Amazon Link</span>
          </h2>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
              Product Title * (What customer reads)
            </label>
            <input
              type="text"
              placeholder="e.g. Automatic Wireless Water Can Dispenser Pump with USB Charging"
              value={productData.title || ''}
              onChange={(e) => setProductData({ ...productData, title: e.target.value, slug: generateSlug(e.target.value, productData.asin || 'mbd') })}
              required
              style={{ width: '100%', fontSize: '1rem', fontWeight: 600 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
                Amazon Product URL / Affiliate Link *
              </label>
              <div style={{ position: 'relative' }}>
                <LinkIcon size={16} color="var(--accent-primary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="https://www.amazon.in/dp/B07YZ367F6?tag=mybudgetdeal9-21..."
                  value={amazonUrlInput}
                  onChange={(e) => handleAmazonUrlChange(e.target.value)}
                  required
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Auto-appends your tracking tag: <code>{settings.amazonTrackingId}</code>
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
                Category / Department *
              </label>
              <select
                value={productData.categorySlug || 'office-and-study'}
                onChange={(e) => {
                  const cat = categories.find(c => c.slug === e.target.value);
                  setProductData({
                    ...productData,
                    categorySlug: e.target.value,
                    categoryName: cat ? cat.name : 'General'
                  });
                }}
                style={{ width: '100%' }}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Multiple Images of Product */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              2. Product Images (Multiple Images Allowed)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              Customers can swipe/click through all images, view on full-screen, and zoom in & out on the frontend.
            </p>
          </div>

          {/* Main Mandatory Image */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Main Product Image * (Mandatory)
            </label>

            {productData.imageUrl ? (
              <div style={{
                position: 'relative',
                display: 'inline-block',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '2px solid var(--accent-primary)',
                marginBottom: '1rem',
                maxHeight: '180px'
              }}>
                <img
                  src={productData.imageUrl}
                  alt="Main preview"
                  style={{ height: '160px', width: '160px', objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={() => setProductData({ ...productData, imageUrl: '' })}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '6px',
                    cursor: 'pointer'
                  }}
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                background: 'rgba(255, 153, 0, 0.1)',
                border: '1px dashed var(--accent-primary)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-primary)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                <Upload size={16} />
                <span>Upload Main Image from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or paste image URL:</span>

              <input
                type="text"
                placeholder="https://m.media-amazon.com/images/..."
                value={productData.imageUrl || ''}
                onChange={(e) => {
                  setProductData({ ...productData, imageUrl: e.target.value });
                  setImageError('');
                }}
                style={{ flex: 1, minWidth: '220px' }}
              />
            </div>
            {imageError && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-red)', marginTop: '0.4rem', display: 'block' }}>
                {imageError}
              </span>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Additional Gallery Images */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Additional Gallery Images (Customer can scroll and zoom in/out)
            </label>

            {/* Gallery Thumbnails List */}
            {productData.additionalImages && productData.additionalImages.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {productData.additionalImages.map((imgUrl, idx) => (
                  <div key={idx} style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-medium)',
                    background: '#151d2f'
                  }}>
                    <img
                      src={imgUrl}
                      alt={`Gallery ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.8)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '3px',
                        cursor: 'pointer'
                      }}
                      title="Remove from gallery"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                <Upload size={15} />
                <span>Upload More Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAdditionalImageUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or add URL:</span>

              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  placeholder="https://..."
                  value={extraImageUrlInput}
                  onChange={(e) => setExtraImageUrlInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddExtraImageByUrl}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Pricing, Discount, and Savings */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
            3. Pricing & Discount
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
                Original Price / MRP (₹)
              </label>
              <input
                type="number"
                min="1"
                placeholder="999"
                value={productData.previousPrice || ''}
                onChange={(e) => handlePriceChange('previousPrice', Number(e.target.value))}
                style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
                Discounted Price / Customer Pays (₹) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="449"
                value={productData.currentPrice || ''}
                onChange={(e) => handlePriceChange('currentPrice', Number(e.target.value))}
                required
                style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
                Discount % (Auto-calculated)
              </label>
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#f87171',
                fontWeight: 800,
                fontSize: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Flame size={18} fill="#f87171" />
                  <span>{productData.discountPercentage || 0}% OFF</span>
                </div>
                {savingsAmount > 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>
                    Save {formatPrice(savingsAmount)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Emotional Hook Message (FOMO / Life Benefit) */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.08) 0%, rgba(17, 24, 39, 0.95) 100%)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
            <Sparkles size={20} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              4. Emotional Hook Message (Why Customer Needs This) *
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            A hook line where customer connects emotionally—showing <strong>what they are missing out on without this product</strong> and <strong>how their life or situation benefits immediately</strong> when they have it.
          </p>

          <textarea
            rows={3}
            placeholder="e.g. Stop straining your back and spilling water from heavy 20L jars every single day. If you don't have this, you're wasting daily energy on a tedious chore. With one press, get smooth, mess-free water in seconds right from your desk or kitchen."
            value={productData.hookLine || ''}
            onChange={(e) => setProductData({ ...productData, hookLine: e.target.value })}
            required
            style={{ width: '100%', fontSize: '0.95rem', lineHeight: 1.5 }}
          />
        </div>

        {/* 5. Main Product Description */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
            5. Main Product Description
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Concise, impactful description of the build quality, materials, and real-life utility.
          </p>

          <textarea
            rows={5}
            placeholder="Describe the product simply and clearly for the customer..."
            value={productData.description || ''}
            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
            required
            style={{ width: '100%', fontSize: '0.95rem', lineHeight: 1.5 }}
          />
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/admin/products" className="btn btn-outline">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
          >
            {saving ? 'Saving...' : (isNew ? 'Publish to Front-End' : 'Save Changes')}
          </button>
        </div>

      </form>

    </div>
  );
};

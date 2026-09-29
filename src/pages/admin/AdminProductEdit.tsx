import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getProductBySlug,
  saveProduct,
  getCategories,
  getCollections,
  checkProductDuplicate
} from '../../services/catalogService';
import {
  parseAmazonUrl,
  buildAffiliateUrl,
  generateSlug,
  validateAffiliateLink
} from '../../services/amazonService';
import { Product, Category, Collection } from '../../types';
import { useSite } from '../../context/SiteContext';
import { logAdminAction } from '../../services/auditService';
import {
  ArrowLeft,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';

export const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { settings, showToast } = useSite();

  // Categories & Collections for assignment
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Raw URL Importer State
  const [importUrl, setImportUrl] = useState('');
  const [importError, setImportError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<Product | null>(null);

  // Form State
  const [productData, setProductData] = useState<Partial<Product>>({
    id: `prod-${Date.now()}`,
    asin: '',
    title: '',
    shortTitle: '',
    slug: '',
    description: '',
    editorialReview: '',
    highlights: [''],
    brand: '',
    categorySlug: 'office-and-study',
    categoryName: 'Office & Study',
    subcategorySlug: '',
    tags: [],
    collectionSlugs: [],
    keywords: [],
    imageUrl: '',
    additionalImages: [],
    amazonUrl: '',
    affiliateUrl: '',
    currency: 'INR',
    currentPrice: 999,
    previousPrice: 1999,
    discountPercentage: 50,
    priceDisplayStatus: 'show',
    availabilityStatus: 'in_stock',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
    isDeal: false,
    isBestseller: false,
    isEditorsPick: false,
    priority: 80,
    source: 'admin_manual',
    lastVerified: new Date().toISOString()
  });

  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState('');

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, WEBP, GIF).');
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
        showToast('Product image uploaded successfully!', 'success');
      }
    };
    reader.onerror = () => {
      setImageError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

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

  const handleRemoveMainImage = () => {
    setProductData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setProductData(prev => {
      const list = [...(prev.additionalImages || [])];
      list.splice(index, 1);
      return { ...prev, additionalImages: list };
    });
  };

  useEffect(() => {
    Promise.all([getCategories(), getCollections()]).then(([cats, cols]) => {
      setCategories(cats);
      setCollections(cols);
    });

    if (!isNew && id) {
      getProductBySlug(id).then((p) => {
        if (p) {
          setProductData(p);
          setTagsInput(p.tags?.join(', ') || '');
        }
      });
    }
  }, [id, isNew]);

  // Phase 33: Smart URL Import Action
  const handleAnalyzeUrl = async () => {
    setImportError('');
    setDuplicateWarning(null);

    const parsed = parseAmazonUrl(importUrl);
    if (!parsed.isValid || !parsed.asin) {
      setImportError(parsed.error || 'Could not parse Amazon ASIN from this URL');
      return;
    }

    // Check duplicate ASIN
    const dup = await checkProductDuplicate(parsed.asin, productData.id);
    if (dup) {
      setDuplicateWarning(dup);
    }

    const canonicalUrl = parsed.canonicalUrl || `https://www.${parsed.marketplace}/dp/${parsed.asin}`;
    const affUrl = buildAffiliateUrl(parsed.asin, settings.amazonTrackingId, parsed.marketplace);
    const suggestedTitle = parsed.suggestedTitle || productData.title || `Amazon Product (${parsed.asin})`;
    const slug = generateSlug(suggestedTitle, parsed.asin);

    setProductData(prev => ({
      ...prev,
      asin: parsed.asin,
      amazonUrl: canonicalUrl,
      affiliateUrl: affUrl,
      title: prev.title || suggestedTitle,
      slug: prev.slug || slug,
      source: 'amazon_link_tool',
      lastVerified: new Date().toISOString()
    }));

    showToast(`ASIN ${parsed.asin} extracted successfully!`, 'success');
  };

  const handleHighlightChange = (index: number, val: string) => {
    const list = [...(productData.highlights || [])];
    list[index] = val;
    setProductData({ ...productData, highlights: list });
  };

  const addHighlight = () => {
    setProductData({ ...productData, highlights: [...(productData.highlights || []), ''] });
  };

  const removeHighlight = (idx: number) => {
    const list = [...(productData.highlights || [])];
    list.splice(idx, 1);
    setProductData({ ...productData, highlights: list });
  };

  const toggleCollection = (colSlug: string) => {
    const current = productData.collectionSlugs || [];
    const updated = current.includes(colSlug)
      ? current.filter(s => s !== colSlug)
      : [...current, colSlug];
    setProductData({ ...productData, collectionSlugs: updated });
  };

  // Phase 50: Publish Checklist Validation
  const hasValidImage = !!productData.imageUrl && productData.imageUrl.trim().length > 10;

  const checklist = [
    { label: '10-character Amazon ASIN provided', valid: !!productData.asin && productData.asin.length === 10 },
    { label: 'Product Title specified', valid: !!productData.title && productData.title.trim().length > 5 },
    { label: 'Valid Special Link with Tracking ID', valid: !!productData.affiliateUrl && productData.affiliateUrl.includes('tag=') },
    { label: 'Category department assigned', valid: !!productData.categorySlug },
    { label: 'Mandatory Product Image uploaded or set *', valid: hasValidImage }
  ];

  const canPublish = checklist.every(c => c.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasValidImage) {
      setImageError('Product image is MANDATORY. Please upload an image file or provide a valid image URL.');
      showToast('Product Image is MANDATORY. Please upload an image.', 'error');
      return;
    }

    if (!canPublish) {
      showToast('Please fix checklist requirements before publishing', 'error');
      return;
    }

    setSaving(true);
    try {
      const selectedCat = categories.find(c => c.slug === productData.categorySlug);
      const cleanTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

      const toSave: Product = {
        id: productData.id || `prod-${Date.now()}`,
        asin: productData.asin!.toUpperCase().trim(),
        title: productData.title!,
        shortTitle: productData.shortTitle || productData.title,
        slug: productData.slug || generateSlug(productData.title!, productData.asin),
        description: productData.description || 'Quality product available on Amazon.',
        editorialReview: productData.editorialReview || '',
        highlights: (productData.highlights || []).filter(h => h.trim().length > 0),
        brand: productData.brand || 'Generic',
        categorySlug: productData.categorySlug || 'office-and-study',
        categoryName: selectedCat ? selectedCat.name : 'Office & Study',
        subcategorySlug: productData.subcategorySlug || undefined,
        tags: cleanTags,
        collectionSlugs: productData.collectionSlugs || [],
        keywords: cleanTags,
        imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
        amazonUrl: productData.amazonUrl || `https://www.amazon.in/dp/${productData.asin}`,
        affiliateUrl: productData.affiliateUrl || buildAffiliateUrl(productData.asin!, settings.amazonTrackingId),
        currency: productData.currency || 'INR',
        currentPrice: productData.currentPrice ? Number(productData.currentPrice) : undefined,
        previousPrice: productData.previousPrice ? Number(productData.previousPrice) : undefined,
        discountPercentage: productData.discountPercentage ? Number(productData.discountPercentage) : undefined,
        priceDisplayStatus: productData.priceDisplayStatus || 'show',
        availabilityStatus: productData.availabilityStatus || 'in_stock',
        status: productData.status || 'active',
        isFeatured: !!productData.isFeatured,
        isTrending: !!productData.isTrending,
        isNew: !!productData.isNew,
        isDeal: !!productData.isDeal,
        isBestseller: !!productData.isBestseller,
        isEditorsPick: !!productData.isEditorsPick,
        priority: productData.priority ? Number(productData.priority) : 80,
        source: productData.source || 'admin_manual',
        lastVerified: new Date().toISOString(),
        createdAt: productData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveProduct(toSave);
      await logAdminAction(
        'admin@mybudgetdeal99.com',
        isNew ? 'Create Product' : 'Update Product',
        'product',
        toSave.id,
        toSave.title
      );

      showToast(isNew ? 'Product added successfully!' : 'Product updated successfully!', 'success');
      navigate('/admin/products');
    } catch (err: any) {
      showToast(`Save failed: ${err?.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/admin/products')} className="card-action-btn" title="Back to products">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              {isNew ? 'Add Product to Catalog' : 'Edit Catalog Product'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Phase 33 Smart Importer with ASIN verification and duplicate detection
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !canPublish}
          className="btn btn-primary"
        >
          <span>{saving ? 'Publishing...' : 'Save & Publish Product'}</span>
          <CheckCircle2 size={16} />
        </button>
      </div>

      {/* Phase 33: Paste Amazon URL Quick Importer */}
      {isNew && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
            <LinkIcon size={18} />
            <span>Step 1: Paste Amazon Product URL to Auto-Extract ASIN</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Paste URL e.g. https://www.amazon.in/dp/B08N5WRW11 or amzn.to/..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleAnalyzeUrl}
              className="btn btn-secondary"
            >
              <span>Analyze & Extract</span>
              <Sparkles size={16} color="var(--accent-primary)" />
            </button>
          </div>

          {importError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontSize: '0.85rem' }}>
              <AlertTriangle size={15} />
              <span>{importError}</span>
            </div>
          )}

          {duplicateWarning && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: '#fbbf24'
            }}>
              <div>
                <strong>Duplicate Warning:</strong> ASIN <code>{duplicateWarning.asin}</code> already exists as "{duplicateWarning.title}".
              </div>
              <Link to={`/admin/products/edit/${duplicateWarning.id}`} style={{ textDecoration: 'underline', fontWeight: 600 }}>
                Edit Existing Product →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Core Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card: Core Information */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              Core Product Information
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Full Product Title *
              </label>
              <input
                type="text"
                value={productData.title || ''}
                onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Short Title (for cards)
                </label>
                <input
                  type="text"
                  value={productData.shortTitle || ''}
                  onChange={(e) => setProductData({ ...productData, shortTitle: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={productData.brand || ''}
                  onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Amazon ASIN (10 chars) *
                </label>
                <input
                  type="text"
                  value={productData.asin || ''}
                  onChange={(e) => setProductData({ ...productData, asin: e.target.value.toUpperCase() })}
                  maxLength={10}
                  style={{ width: '100%', fontFamily: 'monospace' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={productData.slug || ''}
                  onChange={(e) => setProductData({ ...productData, slug: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Canonical Amazon URL
              </label>
              <input
                type="text"
                value={productData.amazonUrl || ''}
                onChange={(e) => setProductData({ ...productData, amazonUrl: e.target.value })}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Affiliate Special Link (with tracking ID) *
              </label>
              <input
                type="text"
                value={productData.affiliateUrl || ''}
                onChange={(e) => setProductData({ ...productData, affiliateUrl: e.target.value })}
                style={{ width: '100%', fontSize: '0.85rem' }}
                required
              />
            </div>

            {/* Mandatory Product Image Upload Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: imageError || (!productData.imageUrl && !isNew)
                ? '1px dashed #ef4444'
                : !productData.imageUrl
                ? '1px dashed var(--accent-primary)'
                : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  <ImageIcon size={18} color="var(--accent-primary)" />
                  <span>Main Product Image <span style={{ color: '#ef4444' }}>* (Mandatory)</span></span>
                </label>
                {productData.imageUrl && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={14} /> Image Attached
                  </span>
                )}
              </div>

              {imageError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <AlertTriangle size={15} />
                  <span>{imageError}</span>
                </div>
              )}

              {/* Main Image Preview if exists */}
              {productData.imageUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#0e1526', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#182238', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img
                      src={productData.imageUrl}
                      alt="Main Preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={() => setImageError('Failed to display image from URL. Please check the URL or upload a valid file.')}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600, wordBreak: 'break-all' }}>
                      {productData.imageUrl.startsWith('data:') ? 'Custom Uploaded Image (Base64 Data)' : productData.imageUrl}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}>
                        <Upload size={13} />
                        <span>Replace File</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/gif"
                          onChange={handleImageFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveMainImage}
                        className="btn btn-sm"
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                      >
                        <Trash2 size={13} />
                        <span>Remove Image</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Drag & Drop Upload Zone */
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  padding: '2rem 1.5rem',
                  border: '2px dashed var(--accent-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(249, 115, 22, 0.04)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background 0.2s ease'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--accent-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)'
                  }}>
                    <Upload size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                      Click to upload product image file
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Supports PNG, JPG, WEBP, GIF up to 5 MB
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleImageFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}

              {/* Direct URL input fallback */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Or paste direct image URL (e.g. Amazon CDN):
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    value={productData.imageUrl || ''}
                    onChange={(e) => {
                      setProductData({ ...productData, imageUrl: e.target.value });
                      setImageError('');
                    }}
                    placeholder="https://m.media-amazon.com/images/I/..."
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  />
                  {productData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(productData.imageUrl, '_blank')}
                      className="btn btn-secondary btn-sm"
                      title="Open image in new tab"
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Additional Gallery Images */}
              <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Additional Gallery Images ({productData.additionalImages?.length || 0})
                  </span>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    <Plus size={13} />
                    <span>Add Gallery Image</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAdditionalImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {productData.additionalImages && productData.additionalImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {productData.additionalImages.map((imgUrl, i) => (
                      <div key={i} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#111827', border: '1px solid var(--border-subtle)' }}>
                        <img src={imgUrl} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalImage(i)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card: Phase 46 Content Isolation (Editorial vs Amazon) */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <Sparkles size={16} />
              <span>Editorial Review vs Manufacturer Content</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Our Editorial Assessment (Why we recommend it)
              </label>
              <textarea
                rows={4}
                value={productData.editorialReview || ''}
                onChange={(e) => setProductData({ ...productData, editorialReview: e.target.value })}
                placeholder="Share hands-on testing notes, dimensions compatibility, and setup synergy..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Standard Product Description
              </label>
              <textarea
                rows={3}
                value={productData.description || ''}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* Dynamic Highlights List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                  Bullet Point Highlights
                </label>
                <button type="button" onClick={addHighlight} className="btn btn-secondary btn-sm">
                  <Plus size={14} />
                  <span>Add Bullet</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {productData.highlights?.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => handleHighlightChange(i, e.target.value)}
                      placeholder={`Highlight #${i + 1}`}
                      style={{ flex: 1, fontSize: '0.88rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeHighlight(i)}
                      className="card-action-btn"
                      style={{ width: '36px', height: '36px', color: '#f87171' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Availability */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              Pricing & Stock Status
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Current Price (₹ / $)
                </label>
                <input
                  type="number"
                  value={productData.currentPrice || ''}
                  onChange={(e) => setProductData({ ...productData, currentPrice: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Previous Price (MSRP)
                </label>
                <input
                  type="number"
                  value={productData.previousPrice || ''}
                  onChange={(e) => setProductData({ ...productData, previousPrice: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Discount %
                </label>
                <input
                  type="number"
                  value={productData.discountPercentage || ''}
                  onChange={(e) => setProductData({ ...productData, discountPercentage: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Price Display Mode
                </label>
                <select
                  value={productData.priceDisplayStatus || 'show'}
                  onChange={(e) => setProductData({ ...productData, priceDisplayStatus: e.target.value as any })}
                  style={{ width: '100%' }}
                >
                  <option value="show">Show Verified Price</option>
                  <option value="check_amazon">"Check price on Amazon"</option>
                  <option value="hide">Hide Price Completely</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Availability Status
                </label>
                <select
                  value={productData.availabilityStatus || 'in_stock'}
                  onChange={(e) => setProductData({ ...productData, availabilityStatus: e.target.value as any })}
                  style={{ width: '100%' }}
                >
                  <option value="in_stock">In Stock on Amazon</option>
                  <option value="out_of_stock">Temporarily Out of Stock</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Taxonomy, Setups & Publish Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Phase 50: Publish Checklist Card */}
          <div style={{
            background: canPublish ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: canPublish ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.92rem', color: canPublish ? 'var(--accent-green)' : '#f87171', marginBottom: '0.75rem' }}>
              <ShieldCheck size={18} />
              <span>Phase 50 Publish Checklist</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {checklist.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: item.valid ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {item.valid ? (
                    <CheckCircle2 size={14} color="var(--accent-green)" />
                  ) : (
                    <AlertTriangle size={14} color="#f87171" />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department / Category Selection */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Department & Hierarchy</h4>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Primary Category *
              </label>
              <select
                value={productData.categorySlug || ''}
                onChange={(e) => {
                  const cat = categories.find(c => c.slug === e.target.value);
                  setProductData({
                    ...productData,
                    categorySlug: e.target.value,
                    categoryName: cat?.name || e.target.value,
                    subcategorySlug: undefined
                  });
                }}
                style={{ width: '100%' }}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategories */}
            {categories.find(c => c.slug === productData.categorySlug)?.subcategories && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Subcategory
                </label>
                <select
                  value={productData.subcategorySlug || ''}
                  onChange={(e) => setProductData({ ...productData, subcategorySlug: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="">None (Top level)</option>
                  {categories.find(c => c.slug === productData.categorySlug)?.subcategories?.map(sc => (
                    <option key={sc.slug} value={sc.slug}>{sc.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Assign to Curated Setups / Collections */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
              <Layers size={16} />
              <span>Assign to Curated Setups</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Select which setups this item belongs to (enables cross-selling):
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {collections.map(col => (
                <label
                  key={col.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    color: productData.collectionSlugs?.includes(col.slug) ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={productData.collectionSlugs?.includes(col.slug)}
                    onChange={() => toggleCollection(col.slug)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>{col.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags & Keywords */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Search Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. study lamp, led, desk setup, wfh"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              style={{ width: '100%', fontSize: '0.85rem' }}
            />
          </div>

          {/* Flags & Badges */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>Display Badges</h4>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!productData.isDeal}
                onChange={(e) => setProductData({ ...productData, isDeal: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span style={{ color: '#f87171', fontWeight: 600 }}>Mark as Deal Drop</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!productData.isFeatured}
                onChange={(e) => setProductData({ ...productData, isFeatured: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span>Homepage Featured</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!productData.isTrending}
                onChange={(e) => setProductData({ ...productData, isTrending: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span>Trending Product</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!productData.isEditorsPick}
                onChange={(e) => setProductData({ ...productData, isEditorsPick: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span>Editor's Pick</span>
            </label>
          </div>

        </div>

      </form>

    </div>
  );
};

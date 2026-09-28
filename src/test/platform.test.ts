import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Firestore so automated test suite runs offline with zero gRPC delays
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn().mockRejectedValue(new Error('Mock offline')),
  getDoc: vi.fn().mockRejectedValue(new Error('Mock offline')),
  setDoc: vi.fn().mockResolvedValue(undefined),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn()
}));
import {
  extractAsin,
  detectMarketplace,
  parseAmazonUrl,
  buildAffiliateUrl,
  validateAffiliateLink,
  generateSlug,
  COMPLIANCE_DISCLOSURE,
  PRICE_DISCLAIMER
} from '../services/amazonService';
import {
  getProducts,
  getProductBySlug,
  checkProductDuplicate,
  saveProduct,
  deleteProduct,
  getCollections,
  getCollectionBySlug,
  saveCollection,
  getCategories,
  getDeals,
  clearCatalogCache
} from '../services/catalogService';
import { Product, Collection } from '../types';

describe('Phase 38 & 39 — Amazon URL & Affiliate Link Engine', () => {
  it('extracts 10-character ASIN from various Amazon URL formats', () => {
    // Standard dp format
    expect(extractAsin('https://www.amazon.in/dp/B08N5WRW11')).toBe('B08N5WRW11');
    // Product format
    expect(extractAsin('https://www.amazon.com/gp/product/B091J3K922?ref_=pe_foo')).toBe('B091J3K922');
    // Mobile aw/d format
    expect(extractAsin('https://www.amazon.in/gp/aw/d/B08R74TY33/')).toBe('B08R74TY33');
    // Direct ASIN string
    expect(extractAsin('B07P9W1X44')).toBe('B07P9W1X44');
    // Invalid / empty
    expect(extractAsin('')).toBeNull();
    expect(extractAsin('https://google.com')).toBeNull();
  });

  it('detects Amazon marketplace correctly', () => {
    expect(detectMarketplace('https://www.amazon.in/dp/B08N5WRW11')).toBe('amazon.in');
    expect(detectMarketplace('https://www.amazon.com/dp/B08N5WRW11')).toBe('amazon.com');
  });

  it('parses valid Amazon URLs and detects invalid domains', () => {
    const valid = parseAmazonUrl('https://www.amazon.in/Ergonomic-Desk-Lamp/dp/B08N5WRW11?ref=test');
    expect(valid.isValid).toBe(true);
    expect(valid.asin).toBe('B08N5WRW11');
    expect(valid.canonicalUrl).toBe('https://www.amazon.in/dp/B08N5WRW11');

    const invalid = parseAmazonUrl('https://suspicious-site.com/fake-deal');
    expect(invalid.isValid).toBe(false);
    expect(invalid.error).toBeDefined();
  });

  it('generates compliant Amazon Associates Special Links with tracking ID', () => {
    const link = buildAffiliateUrl('B08N5WRW11', 'mybudgetdeal99-21', 'amazon.in');
    expect(link).toContain('https://www.amazon.in/dp/B08N5WRW11');
    expect(link).toContain('tag=mybudgetdeal99-21');
    expect(link).toContain('linkCode=as2');
  });

  it('validates affiliate link structure and tracking tag', () => {
    const good = validateAffiliateLink('https://www.amazon.in/dp/B08N5WRW11?tag=mybudgetdeal99-21&linkCode=as2', 'mybudgetdeal99-21');
    expect(good.isValid).toBe(true);
    expect(good.hasTag).toBe(true);

    const missingTag = validateAffiliateLink('https://www.amazon.in/dp/B08N5WRW11');
    expect(missingTag.isValid).toBe(false);
    expect(missingTag.hasTag).toBe(false);

    const nonAmazon = validateAffiliateLink('https://example.com/p/123');
    expect(nonAmazon.isValid).toBe(false);
  });

  it('generates clean SEO-friendly URL slugs', () => {
    expect(generateSlug('Ergonomic LED Desk Lamp 2026')).toBe('ergonomic-led-desk-lamp-2026');
    expect(generateSlug('Complete Car Essentials Setup!')).toBe('complete-car-essentials-setup');
  });

  it('includes mandatory Amazon Associates Operating Agreement disclosures', () => {
    expect(COMPLIANCE_DISCLOSURE).toBe('As an Amazon Associate I earn from qualifying purchases.');
    expect(PRICE_DISCLAIMER).toContain('accurate as of the');
  });
});

describe('Phase 38 — Catalog, Product CRUD, Search & Filtering', () => {
  beforeEach(() => {
    clearCatalogCache();
  });

  it('loads products from catalog with seed fallback', async () => {
    const products = await getProducts();
    expect(products.length).toBeGreaterThan(0);
    const first = products[0];
    expect(first.asin).toBeDefined();
    expect(first.slug).toBeDefined();
    expect(first.affiliateUrl).toContain('tag=');
  });

  it('finds product by dynamic slug', async () => {
    const prod = await getProductBySlug('ergonomic-eye-care-led-desk-lamp');
    expect(prod).not.toBeNull();
    expect(prod?.asin).toBe('B08N5WRW11');
  });

  it('detects duplicate ASINs in catalog', async () => {
    const duplicate = await checkProductDuplicate('B08N5WRW11');
    expect(duplicate).not.toBeNull();
    expect(duplicate?.id).toBe('prod-desk-lamp-01');

    const brandNew = await checkProductDuplicate('B099999999');
    expect(brandNew).toBeNull();
  });

  it('filters products by category and subcategory', async () => {
    const autoProds = await getProducts({ categorySlug: 'automotive' });
    expect(autoProds.length).toBeGreaterThan(0);
    expect(autoProds.every(p => p.categorySlug === 'automotive')).toBe(true);
  });

  it('filters products by deals and discounts', async () => {
    const deals = await getProducts({ isDeal: true });
    expect(deals.length).toBeGreaterThan(0);
    expect(deals.every(p => p.isDeal)).toBe(true);

    const heavyDiscount = await getProducts({ minDiscount: 45 });
    expect(heavyDiscount.every(p => (p.discountPercentage || 0) >= 45)).toBe(true);
  });

  it('supports multi-field keyword search', async () => {
    const searchVacuum = await getProducts({ searchQuery: 'vacuum' });
    expect(searchVacuum.length).toBeGreaterThan(0);
    expect(searchVacuum[0].title.toLowerCase()).toContain('vacuum');

    const searchBrand = await getProducts({ searchQuery: 'LuminoTech' });
    expect(searchBrand.length).toBeGreaterThan(0);

    const noResult = await getProducts({ searchQuery: 'xyznonexistentword99' });
    expect(noResult.length).toBe(0);
  });

  it('creates, updates, and deletes a product', async () => {
    const testProd: Product = {
      id: `test-prod-${Date.now()}`,
      asin: 'B08TEST123',
      title: 'Automated Test Product',
      slug: 'automated-test-product',
      description: 'Test description',
      highlights: ['Feature 1', 'Feature 2'],
      brand: 'TestBrand',
      categorySlug: 'office-and-study',
      categoryName: 'Office & Study',
      tags: ['test'],
      collectionSlugs: [],
      keywords: ['test'],
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46',
      amazonUrl: 'https://www.amazon.in/dp/B08TEST123',
      affiliateUrl: 'https://www.amazon.in/dp/B08TEST123?tag=mybudgetdeal99-21&linkCode=as2',
      currency: 'INR',
      currentPrice: 899,
      priceDisplayStatus: 'show',
      availabilityStatus: 'in_stock',
      status: 'active',
      isFeatured: false,
      isTrending: false,
      isNew: true,
      isDeal: false,
      priority: 50,
      source: 'admin_manual',
      lastVerified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save
    await saveProduct(testProd);
    const fetched = await getProductBySlug(testProd.slug);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('Automated Test Product');

    // Update
    testProd.title = 'Updated Test Product';
    await saveProduct(testProd);
    const updated = await getProductBySlug(testProd.slug);
    expect(updated?.title).toBe('Updated Test Product');

    // Delete
    await deleteProduct(testProd.id);
    const deleted = await getProductBySlug(testProd.slug);
    expect(deleted).toBeNull();
  });
});

describe('Phase 38 — Curated Setups & Collections (System B)', () => {
  it('loads curated setups with products assigned', async () => {
    const collections = await getCollections();
    expect(collections.length).toBeGreaterThan(0);

    const studySetup = await getCollectionBySlug('complete-study-table-setup');
    expect(studySetup).not.toBeNull();
    expect(studySetup?.title).toBe('Complete Study Table Setup');
    expect(studySetup?.productIds?.length).toBeGreaterThan(0);
    expect(studySetup?.buyingChecklist?.length).toBeGreaterThan(0);
    expect(studySetup?.editorialTips?.length).toBeGreaterThan(0);
  });

  it('can create and persist a new curated setup', async () => {
    const testCol: Collection = {
      id: `col-test-${Date.now()}`,
      title: 'Coffee Station Setup',
      slug: 'coffee-station-setup',
      tagline: 'Modern coffee accessories and organizers',
      description: 'Complete setup for brewing enthusiasts',
      coverImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd',
      categorySlug: 'home-and-kitchen',
      tags: ['coffee', 'kitchen'],
      productIds: ['prod-kitchen-organizer-10'],
      buyingChecklist: ['Measure counter width'],
      isFeatured: true,
      status: 'active',
      priority: 80,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveCollection(testCol);
    const retrieved = await getCollectionBySlug('coffee-station-setup');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Coffee Station Setup');
  });
});

describe('Phase 38 — Categories & Deals', () => {
  it('loads hierarchical categories', async () => {
    const cats = await getCategories();
    expect(cats.length).toBeGreaterThan(0);
    const office = cats.find(c => c.slug === 'office-and-study');
    expect(office).toBeDefined();
    expect(office?.subcategories?.length).toBeGreaterThan(0);
  });

  it('loads active verified deals excluding expired', async () => {
    const deals = await getDeals();
    expect(deals.length).toBeGreaterThan(0);
    const now = new Date().toISOString();
    expect(deals.every(d => d.status === 'active' && (!d.endDate || d.endDate >= now))).toBe(true);
  });
});

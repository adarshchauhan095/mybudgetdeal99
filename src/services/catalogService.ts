import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Product,
  Collection,
  Category,
  Deal,
  HomepageSection,
  SiteSettings,
  FilterState
} from '../types';
import {
  initialProducts,
  initialCollections,
  initialCategories,
  initialDeals,
  initialHomepageSections,
  initialSiteSettings
} from '../data/seedData';

// Local storage keys for resilient offline/fallback state
const LS_PRODUCTS = 'mbd_products_v2';
const LS_COLLECTIONS = 'mbd_collections_v2';
const LS_CATEGORIES = 'mbd_categories_v2';
const LS_DEALS = 'mbd_deals_v2';
const LS_SECTIONS = 'mbd_sections_v2';
const LS_SETTINGS = 'mbd_settings_v2';

// Clear legacy v1 dummy cache if in browser environment
try {
  if (typeof localStorage !== 'undefined') {
    ['mbd_products_v1', 'mbd_collections_v1', 'mbd_deals_v1', 'mbd_categories_v1', 'mbd_sections_v1'].forEach(k => {
      localStorage.removeItem(k);
    });
  }
} catch (e) {}

// Cache memory map for low Firestore reads (Free Tier Optimization Phase 25)
const memoryCache: { [key: string]: { data: any; expiry: number } } = {};
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

function getCached<T>(key: string): T | null {
  const item = memoryCache[key];
  if (item && item.expiry > Date.now()) {
    return item.data as T;
  }
  return null;
}

function setCached<T>(key: string, data: T) {
  memoryCache[key] = { data, expiry: Date.now() + CACHE_TTL_MS };
}

export function clearCatalogCache() {
  for (const key in memoryCache) {
    delete memoryCache[key];
  }
}

// Safe storage helper working in both browser (localStorage) and Node/SSR/Vitest environments
const inMemoryStorage: Record<string, string> = {};
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    } catch (e) {}
    return inMemoryStorage[key] || null;
  },
  setItem: (key: string, val: string): void => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, val);
    } catch (e) {}
    inMemoryStorage[key] = val;
  }
};

// Helper to initialize local storage with seed data if empty
function getLocalFallback<T>(key: string, initial: T[]): T[] {
  try {
    const raw = safeStorage.getItem(key);
    if (!raw) {
      safeStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initial;
  }
}

function setLocalFallback<T>(key: string, data: T[]) {
  try {
    safeStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to storage fallback:', e);
  }
}

// Timeout wrapper preventing long connection delays when Firestore API is pending initialization
async function queryWithTimeout<T>(promise: Promise<T>, timeoutMs = 1200): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Firestore timeout')), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * -------------------------------------------------------------
 * PRODUCTS SERVICE
 * -------------------------------------------------------------
 */
export async function getProducts(filters?: FilterState): Promise<Product[]> {
  const cacheKey = `products_${JSON.stringify(filters || {})}`;
  const cached = getCached<Product[]>(cacheKey);
  if (cached) return cached;

  let products: Product[] = [];

  try {
    const colRef = collection(db, 'products');
    const snapshot = await queryWithTimeout(getDocs(colRef), 1200);
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        products.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
    } else {
      products = getLocalFallback(LS_PRODUCTS, initialProducts);
    }
  } catch (err) {
    // Graceful offline/permission fallback
    products = getLocalFallback(LS_PRODUCTS, initialProducts);
  }

  // Client-side filtering & sorting
  let filtered = [...products];

  if (filters) {
    // Only active products on public facing queries unless specified
    if (filters.categorySlug) {
      filtered = filtered.filter(p => p.categorySlug === filters.categorySlug);
    }
    if (filters.subcategorySlug) {
      filtered = filtered.filter(p => p.subcategorySlug === filters.subcategorySlug);
    }
    if (filters.collectionSlug) {
      filtered = filtered.filter(p => p.collectionSlugs && p.collectionSlugs.includes(filters.collectionSlug!));
    }
    if (filters.brand) {
      filtered = filtered.filter(p => p.brand.toLowerCase() === filters.brand!.toLowerCase());
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => (p.currentPrice || 0) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => (p.currentPrice || 0) <= filters.maxPrice!);
    }
    if (filters.minDiscount !== undefined) {
      filtered = filtered.filter(p => (p.discountPercentage || 0) >= filters.minDiscount!);
    }
    if (filters.isDeal) {
      filtered = filtered.filter(p => p.isDeal);
    }
    if (filters.isFeatured) {
      filtered = filtered.filter(p => p.isFeatured);
    }
    if (filters.isTrending) {
      filtered = filtered.filter(p => p.isTrending);
    }
    if (filters.isNew) {
      filtered = filtered.filter(p => p.isNew);
    }
    if (filters.availability && filters.availability !== 'unknown') {
      filtered = filtered.filter(p => p.availabilityStatus === filters.availability);
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.keywords.some(k => k.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        (p.asin && p.asin.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price_asc':
        filtered.sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0));
        break;
      case 'discount_desc':
        filtered.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        break;
    }
  }

  setCached(cacheKey, filtered);
  return filtered;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  const found = all.find(p => p.slug === slug || p.id === slug || p.asin.toLowerCase() === slug.toLowerCase());
  return found || null;
}

export async function checkProductDuplicate(asin: string, id?: string): Promise<Product | null> {
  const all = await getProducts();
  const cleanAsin = asin.toUpperCase().trim();
  const match = all.find(p => p.asin.toUpperCase() === cleanAsin && p.id !== id);
  return match || null;
}

export async function saveProduct(product: Product): Promise<Product> {
  clearCatalogCache();
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, {
      ...product,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    // Update local storage fallback
  }

  const locals = getLocalFallback(LS_PRODUCTS, initialProducts);
  const idx = locals.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    locals[idx] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    locals.unshift({ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  setLocalFallback(LS_PRODUCTS, locals);

  return product;
}

export async function deleteProduct(productId: string): Promise<void> {
  clearCatalogCache();
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (e) {}

  const locals = getLocalFallback(LS_PRODUCTS, initialProducts);
  const filtered = locals.filter(p => p.id !== productId);
  setLocalFallback(LS_PRODUCTS, filtered);
}

/**
 * -------------------------------------------------------------
 * COLLECTIONS SERVICE
 * -------------------------------------------------------------
 */
export async function getCollections(): Promise<Collection[]> {
  const cacheKey = 'collections_all';
  const cached = getCached<Collection[]>(cacheKey);
  if (cached) return cached;

  let collections: Collection[] = [];
  try {
    const colRef = collection(db, 'collections');
    const snapshot = await queryWithTimeout(getDocs(colRef), 1200);
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        collections.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
    } else {
      collections = getLocalFallback(LS_COLLECTIONS, initialCollections);
    }
  } catch (e) {
    collections = getLocalFallback(LS_COLLECTIONS, initialCollections);
  }

  collections.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  setCached(cacheKey, collections);
  return collections;
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const all = await getCollections();
  return all.find(c => c.slug === slug || c.id === slug) || null;
}

export async function saveCollection(colData: Collection): Promise<Collection> {
  clearCatalogCache();
  try {
    const docRef = doc(db, 'collections', colData.id);
    await setDoc(docRef, { ...colData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {}

  const locals = getLocalFallback(LS_COLLECTIONS, initialCollections);
  const idx = locals.findIndex(c => c.id === colData.id);
  if (idx >= 0) {
    locals[idx] = { ...colData, updatedAt: new Date().toISOString() };
  } else {
    locals.unshift({ ...colData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  setLocalFallback(LS_COLLECTIONS, locals);

  return colData;
}

export async function deleteCollection(id: string): Promise<void> {
  clearCatalogCache();
  try {
    await deleteDoc(doc(db, 'collections', id));
  } catch (e) {}
  const locals = getLocalFallback(LS_COLLECTIONS, initialCollections);
  setLocalFallback(LS_COLLECTIONS, locals.filter(c => c.id !== id));
}

/**
 * -------------------------------------------------------------
 * CATEGORIES SERVICE
 * -------------------------------------------------------------
 */
export async function getCategories(): Promise<Category[]> {
  const cacheKey = 'categories_all';
  const cached = getCached<Category[]>(cacheKey);
  if (cached) return cached;

  let categories: Category[] = [];
  try {
    const colRef = collection(db, 'categories');
    const snapshot = await queryWithTimeout(getDocs(colRef), 1200);
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        categories.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
    } else {
      categories = getLocalFallback(LS_CATEGORIES, initialCategories);
    }
  } catch (e) {
    categories = getLocalFallback(LS_CATEGORIES, initialCategories);
  }

  categories.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  setCached(cacheKey, categories);
  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getCategories();
  return all.find(c => c.slug === slug || c.id === slug) || null;
}

export async function saveCategory(category: Category): Promise<Category> {
  clearCatalogCache();
  try {
    const docRef = doc(db, 'categories', category.id);
    await setDoc(docRef, category, { merge: true });
  } catch (e) {}

  const locals = getLocalFallback(LS_CATEGORIES, initialCategories);
  const idx = locals.findIndex(c => c.id === category.id);
  if (idx >= 0) {
    locals[idx] = category;
  } else {
    locals.push(category);
  }
  setLocalFallback(LS_CATEGORIES, locals);
  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  clearCatalogCache();
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (e) {}
  const locals = getLocalFallback(LS_CATEGORIES, initialCategories);
  setLocalFallback(LS_CATEGORIES, locals.filter(c => c.id !== id));
}

/**
 * -------------------------------------------------------------
 * DEALS SERVICE
 * -------------------------------------------------------------
 */
export async function getDeals(): Promise<Deal[]> {
  const cacheKey = 'deals_all';
  const cached = getCached<Deal[]>(cacheKey);
  if (cached) return cached;

  let deals: Deal[] = [];
  try {
    const colRef = collection(db, 'deals');
    const snapshot = await queryWithTimeout(getDocs(colRef), 1200);
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        deals.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
    } else {
      deals = getLocalFallback(LS_DEALS, initialDeals);
    }
  } catch (e) {
    deals = getLocalFallback(LS_DEALS, initialDeals);
  }

  // Filter out expired deals dynamically per Phase 9
  const now = new Date().toISOString();
  deals = deals.filter(d => d.status === 'active' && (!d.endDate || d.endDate >= now));
  deals.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  setCached(cacheKey, deals);
  return deals;
}

export async function saveDeal(deal: Deal): Promise<Deal> {
  clearCatalogCache();
  try {
    const docRef = doc(db, 'deals', deal.id);
    await setDoc(docRef, deal, { merge: true });
  } catch (e) {}
  const locals = getLocalFallback(LS_DEALS, initialDeals);
  const idx = locals.findIndex(d => d.id === deal.id);
  if (idx >= 0) {
    locals[idx] = deal;
  } else {
    locals.unshift(deal);
  }
  setLocalFallback(LS_DEALS, locals);
  return deal;
}

export async function deleteDeal(id: string): Promise<void> {
  clearCatalogCache();
  try {
    await deleteDoc(doc(db, 'deals', id));
  } catch (e) {}
  const locals = getLocalFallback(LS_DEALS, initialDeals);
  setLocalFallback(LS_DEALS, locals.filter(d => d.id !== id));
}


/**
 * -------------------------------------------------------------
 * HOMEPAGE BUILDER SERVICE
 * -------------------------------------------------------------
 */
export async function getHomepageSections(): Promise<HomepageSection[]> {
  const cacheKey = 'sections_all';
  const cached = getCached<HomepageSection[]>(cacheKey);
  if (cached) return cached;

  let sections: HomepageSection[] = [];
  try {
    const colRef = collection(db, 'homepageSections');
    const snapshot = await queryWithTimeout(getDocs(colRef), 1200);
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        sections.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
    } else {
      sections = getLocalFallback(LS_SECTIONS, initialHomepageSections);
    }
  } catch (e) {
    sections = getLocalFallback(LS_SECTIONS, initialHomepageSections);
  }

  sections.sort((a, b) => a.order - b.order);
  setCached(cacheKey, sections);
  return sections;
}

export async function saveHomepageSections(sections: HomepageSection[]): Promise<void> {
  clearCatalogCache();
  try {
    for (const sec of sections) {
      const docRef = doc(db, 'homepageSections', sec.id);
      await setDoc(docRef, sec, { merge: true });
    }
  } catch (e) {}
  setLocalFallback(LS_SECTIONS, sections);
}

/**
 * -------------------------------------------------------------
 * SETTINGS SERVICE
 * -------------------------------------------------------------
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const cacheKey = 'site_settings';
  const cached = getCached<SiteSettings>(cacheKey);
  if (cached) return cached;

  let settings: SiteSettings = initialSiteSettings;
  try {
    const docRef = doc(db, 'settings', 'general');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      settings = { ...initialSiteSettings, ...(docSnap.data() as SiteSettings) };
    } else {
      const raw = localStorage.getItem(LS_SETTINGS);
      if (raw) settings = { ...initialSiteSettings, ...JSON.parse(raw) };
    }
  } catch (e) {
    const raw = localStorage.getItem(LS_SETTINGS);
    if (raw) settings = { ...initialSiteSettings, ...JSON.parse(raw) };
  }

  setCached(cacheKey, settings);
  return settings;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  clearCatalogCache();
  try {
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, settings, { merge: true });
  } catch (e) {}
  localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
}

/**
 * -------------------------------------------------------------
 * SYNC ALL SEED/LOCAL DATA TO FIRESTORE
 * -------------------------------------------------------------
 */
export async function syncAllToFirestore(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const products = getLocalFallback(LS_PRODUCTS, initialProducts);
    const collections = getLocalFallback(LS_COLLECTIONS, initialCollections);
    const categories = getLocalFallback(LS_CATEGORIES, initialCategories);
    const deals = getLocalFallback(LS_DEALS, initialDeals);
    const sections = getLocalFallback(LS_SECTIONS, initialHomepageSections);
    const settings = await getSiteSettings();

    let count = 0;

    for (const p of products) {
      await setDoc(doc(db, 'products', p.id), p, { merge: true });
      count++;
    }
    for (const c of collections) {
      await setDoc(doc(db, 'collections', c.id), c, { merge: true });
      count++;
    }
    for (const cat of categories) {
      await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      count++;
    }
    for (const d of deals) {
      await setDoc(doc(db, 'deals', d.id), d, { merge: true });
      count++;
    }
    for (const s of sections) {
      await setDoc(doc(db, 'homepageSections', s.id), s, { merge: true });
      count++;
    }
    await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
    count++;

    clearCatalogCache();
    return { success: true, count };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Sync failed' };
  }
}

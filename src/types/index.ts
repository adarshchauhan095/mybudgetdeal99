export type ProductStatus = 'active' | 'inactive' | 'archived';
export type PriceDisplayStatus = 'show' | 'hide' | 'check_amazon';
export type AvailabilityStatus = 'in_stock' | 'out_of_stock' | 'unknown';
export type ProductSource = 'amazon_api' | 'amazon_link_tool' | 'admin_manual';

export interface Product {
  id: string;
  asin: string;
  title: string;
  shortTitle?: string;
  slug: string;
  hookLine?: string; // Emotional hook / why customer needs this / FOMO benefit
  description: string;
  editorialReview?: string;
  highlights: string[];
  brand: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  subcategoryName?: string;
  tags: string[];
  collectionSlugs: string[];
  keywords: string[];
  imageUrl: string;
  additionalImages?: string[];
  amazonUrl: string;
  affiliateUrl: string;
  currency: string;
  currentPrice?: number;
  previousPrice?: number;
  discountPercentage?: number;
  priceDisplayStatus: PriceDisplayStatus;
  priceTimestamp?: string;
  availabilityStatus: AvailabilityStatus;
  status: ProductStatus;
  isFeatured: boolean;
  isTrending: boolean;
  isNew: boolean;
  isDeal: boolean;
  isBestseller?: boolean;
  isEditorsPick?: boolean;
  isRecommended?: boolean;
  priority: number;
  sortOrder?: number;
  source: ProductSource;
  lastVerified: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  icon?: string;
  categorySlug: string;
  tags: string[];
  productIds: string[];
  buyingChecklist?: string[];
  editorialTips?: string[];
  faqs?: { question: string; answer: string }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  isFeatured: boolean;
  status: ProductStatus;
  priority: number;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  parentSlug?: string | null;
  subcategories?: SubCategory[];
  priority: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
}

export interface Deal {
  id: string;
  productId: string;
  productTitle: string;
  dealTitle: string;
  badgeText: string;
  currentPrice?: number;
  previousPrice?: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'expired';
  priority: number;
}

export type SectionType = 
  | 'featured_deals'
  | 'trending_products'
  | 'popular_categories'
  | 'curated_collections'
  | 'featured_groups'
  | 'best_value'
  | 'recent_products'
  | 'editorial';

export interface HomepageSection {
  id: string;
  sectionType: SectionType;
  title: string;
  subtitle?: string;
  contentSource?: 'featured' | 'trending' | 'deals' | 'newest' | 'custom';
  selectedIds?: string[];
  itemLimit: number;
  order: number;
  isVisible: boolean;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl?: string;
  amazonTrackingId: string;
  defaultMarketplace: string;
  affiliateDisclosure: string;
  priceDisclaimer: string;
  defaultCurrency: string;
  supportEmail: string;
  contactEmail?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    telegram?: string;
  };
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  entityType: 'product' | 'collection' | 'category' | 'deal' | 'settings';
  entityId: string;
  entityName: string;
  timestamp: string;
  details?: string;
}

export interface AnalyticsEvent {
  id?: string;
  eventType: 
    | 'page_view'
    | 'product_view'
    | 'collection_view'
    | 'category_view'
    | 'search'
    | 'filter_used'
    | 'product_share'
    | 'amazon_cta_click'
    | 'collection_product_click';
  targetId?: string;
  targetSlug?: string;
  title?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userAgent?: string;
}

export interface FilterState {
  categorySlug?: string;
  subcategorySlug?: string;
  collectionSlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  isDeal?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  availability?: AvailabilityStatus;
  searchQuery?: string;
  sortBy?: 'relevance' | 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'discount_desc' | 'featured';
}

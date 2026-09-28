/**
 * Amazon Associates URL and Compliance Service
 * Handles ASIN extraction, Special Link generation, marketplace resolution,
 * URL validation, and compliance disclosure rules.
 */

export interface ParsedAmazonUrl {
  isValid: boolean;
  asin?: string;
  marketplace: string;
  canonicalUrl?: string;
  suggestedTitle?: string;
  error?: string;
}

const DEFAULT_MARKETPLACE = import.meta.env.VITE_DEFAULT_MARKETPLACE || 'amazon.in';
const DEFAULT_TRACKING_ID = import.meta.env.VITE_AMAZON_TRACKING_ID || 'mybudgetdeal99-21';

/**
 * Extracts 10-character alphanumeric ASIN from standard Amazon URLs
 */
export function extractAsin(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();

  // Common Amazon URL patterns:
  // /dp/B08N5WRWNW
  // /gp/product/B08N5WRWNW
  // /gp/aw/d/B08N5WRWNW
  // /ASIN/B08N5WRWNW
  // /d/B08N5WRWNW
  const asinRegex = /(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/ASIN\/|\/d\/)([A-Z0-9]{10})/i;
  const match = trimmed.match(asinRegex);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  // Fallback: check query parameter e.g. ?asin=B08N5WRWNW or ?pd_rd_i=B08N5WRWNW
  try {
    const urlObj = new URL(trimmed);
    const paramAsin = urlObj.searchParams.get('asin') || urlObj.searchParams.get('pd_rd_i');
    if (paramAsin && /^[A-Z0-9]{10}$/i.test(paramAsin)) {
      return paramAsin.toUpperCase();
    }
  } catch (e) {
    // If not a valid absolute URL, check if the string itself is a 10-character ASIN
    if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }
  }

  return null;
}

/**
 * Detects marketplace host from URL (e.g. amazon.in, amazon.com)
 */
export function detectMarketplace(rawUrl: string): string {
  try {
    const urlObj = new URL(rawUrl);
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname.includes('amazon.')) {
      return hostname.replace(/^www\./, '');
    }
  } catch (e) {
    // Fall back to default marketplace
  }
  return DEFAULT_MARKETPLACE;
}

/**
 * Parses and validates an Amazon product URL
 */
export function parseAmazonUrl(rawUrl: string): ParsedAmazonUrl {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, marketplace: DEFAULT_MARKETPLACE, error: 'URL cannot be empty' };
  }

  const trimmed = rawUrl.trim();

  // Basic URL structure check
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch (e) {
    return { isValid: false, marketplace: DEFAULT_MARKETPLACE, error: 'Invalid URL format' };
  }

  const host = parsedUrl.hostname.toLowerCase();
  const isAmazonDomain = host.includes('amazon.') || host.includes('amzn.to');

  if (!isAmazonDomain) {
    return {
      isValid: false,
      marketplace: DEFAULT_MARKETPLACE,
      error: 'URL domain must be an official Amazon marketplace (e.g., amazon.in, amazon.com) or amzn.to shortlink'
    };
  }

  const asin = extractAsin(trimmed);
  const marketplace = detectMarketplace(trimmed);

  if (!asin) {
    return {
      isValid: false,
      marketplace,
      error: 'Could not detect a valid 10-character Amazon ASIN from this URL'
    };
  }

  // Construct canonical Amazon URL
  const canonicalUrl = `https://www.${marketplace}/dp/${asin}`;

  // Attempt to extract title keywords from slug in URL if present (e.g., /Desk-Lamp-Foldable/dp/...)
  let suggestedTitle = '';
  const pathParts = parsedUrl.pathname.split('/');
  const dpIndex = pathParts.findIndex(p => p.toLowerCase() === 'dp');
  if (dpIndex > 1 && pathParts[dpIndex - 1]) {
    suggestedTitle = decodeURIComponent(pathParts[dpIndex - 1]).replace(/-/g, ' ');
  }

  return {
    isValid: true,
    asin,
    marketplace,
    canonicalUrl,
    suggestedTitle: suggestedTitle || undefined
  };
}

/**
 * Generates an Amazon Associates Special Link with the designated tracking ID
 */
export function buildAffiliateUrl(
  canonicalOrAsin: string,
  trackingId: string = DEFAULT_TRACKING_ID,
  marketplace: string = DEFAULT_MARKETPLACE
): string {
  const asin = extractAsin(canonicalOrAsin) || canonicalOrAsin;
  const tag = trackingId || DEFAULT_TRACKING_ID;
  const market = marketplace || DEFAULT_MARKETPLACE;

  // Compliant Amazon Associates Special Link format:
  // https://www.amazon.{marketplace}/dp/{ASIN}?tag={trackingId}&linkCode=as2
  return `https://www.${market}/dp/${asin}?tag=${encodeURIComponent(tag)}&linkCode=as2`;
}

/**
 * Validates whether an affiliate link contains valid domain and affiliate tag
 */
export function validateAffiliateLink(url: string, expectedTag?: string): {
  isValid: boolean;
  hasTag: boolean;
  tagFound?: string;
  message: string;
} {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const hasAmazonHost = host.includes('amazon.') || host.includes('amzn.to');

    if (!hasAmazonHost) {
      return { isValid: false, hasTag: false, message: 'URL is not on an Amazon domain' };
    }

    const tagParam = parsed.searchParams.get('tag');
    if (!tagParam) {
      return { isValid: false, hasTag: false, message: 'Amazon Associates tracking tag is missing' };
    }

    if (expectedTag && tagParam !== expectedTag) {
      return {
        isValid: true,
        hasTag: true,
        tagFound: tagParam,
        message: `Tag "${tagParam}" differs from configured tag "${expectedTag}"`
      };
    }

    return { isValid: true, hasTag: true, tagFound: tagParam, message: 'Valid Amazon Associates link' };
  } catch (e) {
    return { isValid: false, hasTag: false, message: 'Invalid URL string' };
  }
}

/**
 * Generates an SEO-safe unique slug from product/collection title
 */
export function generateSlug(title: string, asin?: string): string {
  if (!title) return asin ? asin.toLowerCase() : `item-${Date.now()}`;
  
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .substring(0, 75);

  return baseSlug || (asin ? asin.toLowerCase() : `item-${Date.now()}`);
}

/**
 * Amazon Operating Agreement compliance disclosure text
 */
export const COMPLIANCE_DISCLOSURE = 
  "As an Amazon Associate I earn from qualifying purchases.";

export const PRICE_DISCLAIMER =
  "Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product.";

import React, { useEffect } from 'react';
import { useSite } from '../../context/SiteContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  imageUrl?: string;
  ogType?: 'website' | 'product' | 'article';
  jsonLd?: Record<string, any>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  imageUrl,
  ogType = 'website',
  jsonLd
}) => {
  const { settings } = useSite();

  const siteTitle = settings.siteName || 'mybudgetdeal99';
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} — Curated Deals & Smart Product Setups`;
  const metaDesc = description || "Discover useful products, curated setups, and verified Amazon deals for study, office, car, and home.";
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://adarshchauhan095.github.io/mybudgetdeal99';
  const canonicalUrl = `${baseUrl.replace(/\/$/, '')}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  const ogImg = imageUrl || 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80';

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // 2. Helper to set meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      let el = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', metaDesc);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', metaDesc, true);
    setMeta('og:image', ogImg, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', ogType, true);
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', metaDesc);
    setMeta('twitter:image', ogImg);

    // 3. Update Canonical link
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement('link');
      canon.setAttribute('rel', 'canonical');
      document.head.appendChild(canon);
    }
    canon.setAttribute('href', canonicalUrl);

    // 4. Update JSON-LD structured data
    let scriptEl = document.getElementById('seo-json-ld');
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'seo-json-ld';
        scriptEl.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [fullTitle, metaDesc, canonicalUrl, ogImg, ogType, jsonLd]);

  return null;
};

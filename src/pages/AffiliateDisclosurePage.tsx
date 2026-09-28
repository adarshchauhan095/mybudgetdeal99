import React from 'react';
import { SEOHead } from '../components/layout/SEOHead';
import { Shield, Info, CheckCircle2, ExternalLink } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export const AffiliateDisclosurePage: React.FC = () => {
  const { settings } = useSite();

  return (
    <>
      <SEOHead
        title="Amazon Associates Affiliate Disclosure & Compliance"
        description="Comprehensive Amazon Associates program disclosure for mybudgetdeal99. We believe in full transparency regarding product links."
        canonicalPath="/affiliate-disclosure"
      />

      <div className="container" style={{ maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
          <Shield size={18} />
          <span>Transparency & Compliance</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2 }}>
          Amazon Associates Affiliate Disclosure
        </h1>

        <div style={{
          background: 'rgba(249, 115, 22, 0.08)',
          border: '1px solid rgba(249, 115, 22, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          fontSize: '1.05rem',
          color: '#ffffff',
          lineHeight: 1.6
        }}>
          <strong>Official Statement:</strong> "{settings.affiliateDisclosure || "As an Amazon Associate I earn from qualifying purchases."}"
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginTop: '1rem' }}>
            What is mybudgetdeal99?
          </h2>
          <p>
            <strong>{settings.siteName}</strong> is an independent product discovery, shopping guide, and setup curation bridge. We are <strong>not</strong> an e-commerce platform, retailer, or payment processor. We do not sell items directly, process payments, store credit card details, or fulfill physical shipments.
          </p>
          <p>
            When you find a product or setup you love on our site and click "View on Amazon", you are redirected to the official Amazon website through a compliant Amazon Associates Special Link. All order fulfillment, shipping, returns, and customer service are handled completely and exclusively by Amazon.
          </p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginTop: '1rem' }}>
            How Affiliate Commissions Work
          </h2>
          <p>
            As participants in the Amazon Services LLC Associates Program (an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon), we may earn a small referral commission when you make a qualifying purchase through our links.
          </p>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 600 }}>
              <CheckCircle2 size={16} color="var(--accent-green)" />
              <span>Zero extra cost to you: The price you pay on Amazon remains exactly the same whether you use our link or go directly.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 600 }}>
              <CheckCircle2 size={16} color="var(--accent-green)" />
              <span>No paid bias: Products are selected based on editorial merit, utility, and verified user satisfaction.</span>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginTop: '1rem' }}>
            Pricing & Availability Disclaimer
          </h2>
          <p>
            {settings.priceDisclaimer}
          </p>
          <p>
            Amazon updates its product listings, stock statuses, and prices dynamically. While we strive to show accurate metadata and timestamp our verification, any price, discount, or stock status shown on Amazon at the moment of your visit supersedes any information on this discovery portal.
          </p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginTop: '1rem' }}>
            Trademark Information
          </h2>
          <p>
            Amazon, the Amazon logo, and Amazon Prime are registered trademarks of Amazon.com, Inc. or its affiliates. {settings.siteName} is not affiliated with, endorsed by, or sponsored by Amazon beyond our standard agreement as an Amazon Associate.
          </p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginTop: '1rem' }}>
            Questions or Corrections?
          </h2>
          <p>
            If you notice any broken link, obsolete ASIN, or price discrepancy, please notify us at <a href={`mailto:${settings.supportEmail}`} style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>{settings.supportEmail}</a> so our editorial team can update the catalog immediately.
          </p>

        </div>

      </div>
    </>
  );
};

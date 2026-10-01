import React from 'react';
import { SEOHead } from '../components/layout/SEOHead';
import { useSite } from '../context/SiteContext';

export const PrivacyPage: React.FC = () => {
  const { settings } = useSite();

  return (
    <>
      <SEOHead
        title="Privacy Policy | mybudgetdeal99"
        description="Privacy policy and data transparency statement for mybudgetdeal99."
        canonicalPath="/privacy"
      />

      <div className="container" style={{ maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Last updated: September 2026
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>1. No Financial Data Collection</h2>
        <p>
          {settings.siteName} is strictly an affiliate discovery platform. We do not sell products directly, process credit cards, collect UPI payments, or maintain digital wallets. All transactions occur on Amazon.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>2. Information We Collect</h2>
        <p>
          We collect anonymous, aggregated website usage analytics (such as pages visited, search queries, and external clicks to Amazon) to improve our discovery algorithms and catalog curation. We do not sell personal visitor data to third parties.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>3. Amazon Associates & Third-Party Cookies</h2>
        <p>
          When you click an Amazon Special Link on our website, Amazon may place cookies on your browser in accordance with their privacy policy to track qualifying affiliate purchases. You may control cookie preferences through your browser settings.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>4. Contact</h2>
        <p>
          If you have questions regarding this privacy policy, please reach out to us at <a href={`mailto:${settings.supportEmail}`} style={{ color: 'var(--accent-primary)' }}>{settings.supportEmail}</a>.
        </p>
      </div>
    </>
  );
};

export const TermsPage: React.FC = () => {
  const { settings } = useSite();

  return (
    <>
      <SEOHead
        title="Terms of Service | mybudgetdeal99"
        description="Terms of service and user agreement for mybudgetdeal99."
        canonicalPath="/terms"
      />

      <div className="container" style={{ maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Last updated: September 2026
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>1. Platform Nature</h2>
        <p>
          {settings.siteName} provides curated product recommendations and setup blueprints. By accessing our platform, you acknowledge that we are not a retailer or merchant. All product purchases, deliveries, refunds, and warranties are governed strictly by Amazon's terms of service.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>2. Pricing and Availability Disclaimers</h2>
        <p>
          Prices, coupons, discounts, and product availability on Amazon are subject to rapid change without prior notice. While our editorial team strives to verify listings regularly, we do not warrant that product descriptions or prices are free from error.
        </p>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>3. Limitation of Liability</h2>
        <p>
          In no event shall {settings.siteName}, its creators, or operators be liable for any damages arising out of your purchase or use of third-party products discovered through this website.
        </p>
      </div>
    </>
  );
};

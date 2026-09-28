import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, ExternalLink, Heart, CheckCircle2 } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

export const Footer: React.FC = () => {
  const { settings } = useSite();

  return (
    <footer style={{
      background: '#070a12',
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: '3.5rem',
      paddingBottom: '2.5rem',
      marginTop: 'auto',
      color: 'var(--text-secondary)'
    }}>
      <div className="container">
        
        {/* Compliance Banner */}
        <div style={{
          background: 'rgba(249, 115, 22, 0.06)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
            <Shield size={18} />
            <span>Amazon Associates Program Compliance Statement</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            "{settings.affiliateDisclosure || "As an Amazon Associate I earn from qualifying purchases."}"
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {settings.priceDisclaimer}
          </p>
        </div>

        {/* Directory Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Column 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Compass size={18} color="#ffffff" />
              </div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#ffffff' }}>
                {settings.siteName}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Discover useful products, curated setups, and smart shopping recommendations. We help you find high-utility Amazon gear effortlessly.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--accent-green)' }}>
              <CheckCircle2 size={16} />
              <span>Independent Editorial Curation</span>
            </div>
          </div>

          {/* Column 2: Setups */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Curated Setups
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <li><Link to="/collection/complete-study-table-setup" style={{ color: 'var(--text-secondary)' }}>Study Table Setup</Link></li>
              <li><Link to="/collection/car-essentials" style={{ color: 'var(--text-secondary)' }}>Car Essentials Kit</Link></li>
              <li><Link to="/collection/work-from-home-setup" style={{ color: 'var(--text-secondary)' }}>Work From Home Setup</Link></li>
              <li><Link to="/collection/kitchen-essentials" style={{ color: 'var(--text-secondary)' }}>Smart Kitchen Essentials</Link></li>
              <li><Link to="/collections" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Browse All Setups →</Link></li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <li><Link to="/category/office-and-study" style={{ color: 'var(--text-secondary)' }}>Office & Study</Link></li>
              <li><Link to="/category/automotive" style={{ color: 'var(--text-secondary)' }}>Automotive & Car</Link></li>
              <li><Link to="/category/electronics" style={{ color: 'var(--text-secondary)' }}>Electronics & Tech</Link></li>
              <li><Link to="/category/home-and-kitchen" style={{ color: 'var(--text-secondary)' }}>Home & Kitchen</Link></li>
              <li><Link to="/deals" style={{ color: '#f87171', fontWeight: 600 }}>Featured Deals Hub</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal & Information */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transparency & Legal
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <li><Link to="/affiliate-disclosure" style={{ color: 'var(--text-secondary)' }}>Affiliate Disclosure</Link></li>
              <li><Link to="/privacy" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link></li>
              <li><Link to="/terms" style={{ color: 'var(--text-secondary)' }}>Terms of Service</Link></li>
              <li><Link to="/about" style={{ color: 'var(--text-secondary)' }}>About Our Curation</Link></li>
              <li><Link to="/contact" style={{ color: 'var(--text-secondary)' }}>Contact & Feedback</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Built for smart shoppers</span>
            <span>•</span>
            <Link to="/admin" style={{ color: 'var(--text-muted)' }}>Admin Portal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

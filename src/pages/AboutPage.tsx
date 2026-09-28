import React from 'react';
import { SEOHead } from '../components/layout/SEOHead';
import { Compass, CheckCircle2, Layers, ShieldCheck, Heart } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export const AboutPage: React.FC = () => {
  const { settings } = useSite();

  return (
    <>
      <SEOHead
        title={`About ${settings.siteName} — Curated Setups & Shopping Discovery`}
        description="Learn about our mission to eliminate clutter and recommend complete, functional Amazon product setups under budget."
        canonicalPath="/about"
      />

      <div className="container" style={{ maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
          <Compass size={18} />
          <span>Our Vision</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2 }}>
          Discover Useful Products, Curated Collections & Smart Shopping Setups
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.98rem' }}>
          <p>
            Online shopping has become overwhelmingly cluttered. A simple search for "laptop stand" or "car vacuum" returns thousands of indistinguishable sponsored items, many with questionable reviews or inflated list prices.
          </p>
          <p>
            <strong>{settings.siteName}</strong> was founded by passionate engineers and ergonomics enthusiasts to solve a simple problem: <em>How can everyday shoppers find gear that works well together without wasting hours researching?</em>
          </p>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
              The Two Pillars of Our Discovery System
            </h2>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.35rem' }}>
                System A: Individual Utility Products
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                We test and cherry-pick individual tools that solve specific everyday hassles: 65W fast-charging cords that don't fray, 9000PA car vacuums that actually fit inside gloveboxes, and adjustable eye-care lamps for late night work.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.35rem' }}>
                System B: Curated Setups & Groups
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Instead of buying items in isolation, we assemble complete matching kits: "Complete Study Table Setup", "Car Essentials", and "Work From Home Setup". Every item in a setup is coordinated by dimensions, aesthetic, and functional synergy.
              </p>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginTop: '1rem' }}>
            Our Strict Curation Standards
          </h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <CheckCircle2 size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <span><strong>No Fake Urgency:</strong> We do not employ ticking countdown clocks or fabricated scarcity popups.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <CheckCircle2 size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <span><strong>Direct Amazon Delivery:</strong> All purchases happen on Amazon, backed by official warranties, return policies, and Prime delivery.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <CheckCircle2 size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <span><strong>Clean Transparent Special Links:</strong> We openly disclose our participation in the Amazon Associates program.</span>
            </li>
          </ul>

        </div>

      </div>
    </>
  );
};

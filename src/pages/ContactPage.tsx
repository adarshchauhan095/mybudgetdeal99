import React, { useState } from 'react';
import { SEOHead } from '../components/layout/SEOHead';
import { Mail, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useSite();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill out all fields', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Your message has been received! Thank you.', 'success');
  };

  return (
    <>
      <SEOHead
        title="Contact Us & Suggest Products | mybudgetdeal99"
        description="Have a question or want to recommend a product or setup for our catalog? Get in touch with our curation team."
        canonicalPath="/contact"
      />

      <div className="container" style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <Mail size={18} />
            <span>Support & Suggestions</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Get in Touch
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Have a question about a product setup, spotted a broken link, or want to suggest a new category? We’d love to hear from you.
          </p>
        </div>

        {submitted ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-green)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={48} color="var(--accent-green)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Thank You for Reaching Out!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Our curation team reviews all suggestions and feedback regularly.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
                Message or Setup Suggestion
              </label>
              <textarea
                rows={5}
                placeholder="Tell us what you think or suggest an Amazon ASIN/product to include in our setups..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.8rem 1.75rem' }}>
              <span>Send Message</span>
              <Send size={16} />
            </button>
          </form>
        )}

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Direct inquiries: <a href={`mailto:${settings.contactEmail || settings.supportEmail}`} style={{ color: 'var(--accent-primary)' }}>{settings.contactEmail || settings.supportEmail}</a>
        </div>
      </div>
    </>
  );
};

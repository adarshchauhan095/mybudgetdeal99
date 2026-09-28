import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/layout/SEOHead';
import { ShieldCheck, Lock, Mail, Key, ArrowRight, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@mybudgetdeal99.com');
  const [password, setPassword] = useState('AdminDeal99!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signInAdmin, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signInAdmin(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err?.message || 'Invalid administrator credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    demoLogin();
    navigate('/admin');
  };

  return (
    <>
      <SEOHead title="Administrator Portal Login" canonicalPath="/admin" />

      <div className="container" style={{ maxWidth: '440px', padding: '3rem 1rem' }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)'
            }}>
              <ShieldCheck size={28} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
              Admin Portal
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Sign in to manage catalog, deals, setups, and affiliate settings.
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: '#f87171'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Admin Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In as Admin'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Bypass for Development */}
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.25rem',
            textAlign: 'center'
          }}>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="btn btn-outline btn-sm"
              style={{ width: '100%' }}
            >
              <Lock size={14} color="var(--accent-primary)" />
              <span>Instant Development Access</span>
            </button>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Pre-configured for local evaluation & testing
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

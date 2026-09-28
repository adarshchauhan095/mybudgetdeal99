import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider, useSite } from './context/SiteContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { QuickViewModal } from './components/common/QuickViewModal';

// Dynamically determine basename for GitHub Pages and local development
const getBasename = (): string => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/mybudgetdeal99')) {
    return '/mybudgetdeal99';
  }
  const base = import.meta.env.BASE_URL;
  if (base && base !== './' && base !== '/') {
    return base.replace(/\/$/, '');
  }
  return '';
};

// Public Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { DealsPage } from './pages/DealsPage';
import { SearchPage } from './pages/SearchPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage, TermsPage } from './pages/LegalPages';
import { AffiliateDisclosurePage } from './pages/AffiliateDisclosurePage';

// Admin Pages
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductEdit } from './pages/admin/AdminProductEdit';
import { AdminCollections } from './pages/admin/AdminCollections';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminDeals } from './pages/admin/AdminDeals';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminHomepageBuilder } from './pages/admin/AdminHomepageBuilder';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSystemHealth } from './pages/admin/AdminSystemHealth';

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Global Toast Renderer
const ToastDisplay: React.FC = () => {
  const { toasts, removeToast } = useSite();
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type === 'success' ? 'toast-success' : t.type === 'error' ? 'toast-error' : ''}`}
          onClick={() => removeToast(t.id)}
          style={{ cursor: 'pointer' }}
        >
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

// 404 Fallback
const NotFoundPage: React.FC = () => (
  <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
    <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '1rem' }}>404</h1>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>Page Not Found</h2>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
      The page you requested could not be found or has moved.
    </p>
    <Link to="/" className="btn btn-primary">Return to Homepage</Link>
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SiteProvider>
        <BrowserRouter basename={getBasename()}>
          <ScrollToTop />
          <Navbar />
          <div className="main-content">
            <Routes>
              {/* Public Discovery Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/p/:slug" element={<ProductDetailPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collection/:slug" element={<CollectionDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/category/:slug" element={<CategoryDetailPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/affiliate-disclosure" element={<AffiliateDisclosurePage />} />

              {/* Admin Portal Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductEdit />} />
                <Route path="products/edit/:id" element={<AdminProductEdit />} />
                <Route path="collections" element={<AdminCollections />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="deals" element={<AdminDeals />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="homepage" element={<AdminHomepageBuilder />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="health" element={<AdminSystemHealth />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
          <QuickViewModal />
          <ToastDisplay />
        </BrowserRouter>
      </SiteProvider>
    </AuthProvider>
  );
};

export default App;

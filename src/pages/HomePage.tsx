import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Zap,
  Layers,
  Sparkles,
  ShieldCheck,
  Truck,
  TrendingUp,
  FolderTree,
  CheckCircle2
} from 'lucide-react';
import {
  getProducts,
  getCollections,
  getCategories,
  getDeals,
  getBanners,
  getHomepageSections
} from '../services/catalogService';
import { Product, Collection, Category, Deal, Banner, HomepageSection } from '../types';
import { SEOHead } from '../components/layout/SEOHead';
import { BannerCarousel } from '../components/common/BannerCarousel';
import { ProductCard } from '../components/common/ProductCard';
import { CollectionCard } from '../components/common/CollectionCard';
import {
  BannerSkeleton,
  ProductCardSkeleton,
  CollectionCardSkeleton,
  CategoryGridSkeleton
} from '../components/common/Shimmer';
import { trackEvent } from '../services/analyticsService';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('page_view', { title: 'Home Page', targetSlug: '/' });

    async function loadData() {
      try {
        const [bList, pList, cList, catList, dList, sList] = await Promise.all([
          getBanners(),
          getProducts(),
          getCollections(),
          getCategories(),
          getDeals(),
          getHomepageSections()
        ]);
        setBanners(bList);
        setProducts(pList);
        setCollections(cList);
        setCategories(catList);
        setDeals(dList);
        setSections(sList);
      } catch (e) {
        console.error('Error loading homepage data', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const dealProducts = products.filter(p => p.isDeal).slice(0, 4);
  const trendingProducts = products.filter(p => p.isTrending).slice(0, 8);
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 6);

  return (
    <>
      <SEOHead
        title="Discover Smart Amazon Setups & Budget Deals"
        description="Curated Amazon setups for study tables, cars, home offices, and kitchen organization. Discover hand-picked gear with verified reviews."
        canonicalPath="/"
      />

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
        
        {/* Hero Section */}
        {loading ? (
          <section style={{ marginTop: '0.5rem' }}>
            <BannerSkeleton />
          </section>
        ) : banners.length > 0 ? (
          <section style={{ marginTop: '0.5rem' }}>
            <BannerCarousel banners={banners} />
          </section>
        ) : null}

        {/* Feature USPs Bar */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
              <Layers size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Curated Smart Setups</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Complete matching product bundles</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)', flexShrink: 0 }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Zero Fake Claims</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Real ASINs with authentic links</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', flexShrink: 0 }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Verified Price Drops</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Daily deals up to 50% discount</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', flexShrink: 0 }}>
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Amazon Direct Fulfillment</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Prime delivery & trusted warranty</div>
            </div>
          </div>
        </section>

        {/* Featured Deals Section */}
        {(loading || dealProducts.length > 0) && (
          <section>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Zap size={16} />
                  <span>Limited Time Offers</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Featured Amazon Deals</h2>
              </div>
              <Link to="/deals" className="btn btn-outline btn-sm">
                <span>View All Deals</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="product-grid">
              {loading
                ? [1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)
                : dealProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Curated Groups & Setups Showcase (System B) */}
        {(loading || collections.length > 0) && (
          <section style={{
            background: 'linear-gradient(180deg, rgba(31, 41, 61, 0.4) 0%, rgba(11, 15, 25, 0.6) 100%)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem 1.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <span className="badge badge-trending" style={{ marginBottom: '0.5rem' }}>
                  System B • Smart Collections
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                  Curated Setups for Every Space
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                  Stop guessing what works together. Browse completely coordinated product bundles for study tables, cars, and desks.
                </p>
              </div>
              <Link to="/collections" className="btn btn-primary btn-sm">
                <span>Explore All Setups</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {loading
                ? [1, 2, 3].map(i => <CollectionCardSkeleton key={i} />)
                : collections.slice(0, 3).map(col => <CollectionCard key={col.id} collection={col} />)}
            </div>
          </section>
        )}

        {/* Categories Grid */}
        {(loading || categories.length > 0) && (
          <section>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Department Catalog
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Shop By Category</h2>
              </div>
              <Link to="/categories" className="btn btn-outline btn-sm">
                <span>All Categories</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <CategoryGridSkeleton />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem'
              }}>
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    style={{
                      position: 'relative',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      aspectRatio: '16 / 10',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '1.25rem',
                      transition: 'all 0.3s ease'
                    }}
                    className="cat-card-hover"
                  >
                    {cat.imageUrl && (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}
                      />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0b0f19 0%, rgba(11, 15, 25, 0.4) 60%, transparent 100%)' }} />
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>
                        {cat.name}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        {cat.subcategories?.length || 0} subcategories • View Gear →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <style>{`
              .cat-card-hover:hover {
                transform: translateY(-4px);
                border-color: var(--accent-primary);
                box-shadow: 0 10px 25px rgba(249, 115, 22, 0.15);
              }
            `}</style>
          </section>
        )}

        {/* Trending Individual Products (System A) */}
        {(loading || trendingProducts.length > 0) && (
          <section>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <TrendingUp size={16} />
                  <span>Community Favorites</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Trending Products</h2>
              </div>
              <Link to="/products" className="btn btn-outline btn-sm">
                <span>View Full Catalog</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="product-grid">
              {loading
                ? [1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductCardSkeleton key={i} />)
                : trendingProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Why mybudgetdeal99 Editorial Section */}
        <section style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <div>
            <span className="badge badge-verified" style={{ marginBottom: '0.75rem' }}>
              Transparent Discovery
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.25 }}>
              The Smart Way to Shop Amazon
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Amazon has millions of products, but finding what genuinely works together without wasting money on low-quality clones is frustrating.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              At <strong>mybudgetdeal99</strong>, we test, research, and organize items into complete functional setups (like study table kits or car essentials) so you can make informed decisions in seconds.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#ffffff' }}>
                <CheckCircle2 size={16} color="var(--accent-green)" />
                <span>Zero fake reviews or automated price trickery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#ffffff' }}>
                <CheckCircle2 size={16} color="var(--accent-green)" />
                <span>Intentional, clear "View on Amazon" Special Links</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#ffffff' }}>
                <CheckCircle2 size={16} color="var(--accent-green)" />
                <span>Full Amazon Prime customer protection & return policy applies</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              Looking for a custom setup?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Check out our complete setups guide. Whether you're setting up a college dorm desk, equipping a new hatchback, or setting up a minimal dual-screen workstation, we've got you covered.
            </p>
            <Link to="/collection/complete-study-table-setup" className="btn btn-amazon" style={{ alignSelf: 'flex-start' }}>
              <span>View Study Table Setup</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </>
  );
};

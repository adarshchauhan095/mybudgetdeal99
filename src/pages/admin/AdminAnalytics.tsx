import React, { useEffect, useState } from 'react';
import { getAnalyticsSummary, AnalyticsSummary } from '../../services/analyticsService';
import { BarChart3, TrendingUp, MousePointerClick, Eye, Search, Layers } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        Loading platform analytics...
      </div>
    );
  }

  const maxDailyViews = Math.max(...data.dailyViews.map(d => d.views), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
          Platform Analytics & Discovery Traffic
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Monitor shopper interest, top setups, search demand, and Amazon outbound clickthroughs
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Total Views</span>
            <Eye size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem' }}>
            {data.totalViews}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Amazon Outbound Clicks</span>
            <MousePointerClick size={18} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem' }}>
            {data.amazonCtaClicks}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Catalog Searches</span>
            <Search size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem' }}>
            {data.totalSearches}
          </div>
        </div>
      </div>

      {/* Traffic Bar Chart (Daily trends) */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
            7-Day Activity & Amazon Outbound Clicks
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Updated real-time</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', gap: '1rem', paddingTop: '1rem' }}>
          {data.dailyViews.map((day) => {
            const heightPercent = Math.round((day.views / maxDailyViews) * 100);
            return (
              <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {day.clicks} clicks
                </div>
                <div style={{
                  width: '100%',
                  maxWidth: '48px',
                  height: `${heightPercent}%`,
                  minHeight: '12px',
                  background: 'linear-gradient(to top, #ea580c, #f97316)',
                  borderRadius: '6px 6px 2px 2px',
                  position: 'relative'
                }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {day.date}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Top Setups & Top Products */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Top Products */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Most Outbound-Clicked Products
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.topProducts.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem', color: '#ffffff' }}>
                  {p.title}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{p.views} views</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{p.clicks} clicks</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Curated Setups */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '1.1rem' }}>
            <Layers size={18} />
            <span>Top Curated Setups (System B)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.topCollections.map(c => (
              <div key={c.slug} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.88rem', color: '#ffffff' }}>
                  {c.title}
                </span>
                <span className="badge badge-trending">
                  {c.views} discoveries
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

#!/usr/bin/env node
/**
 * Generates src/components/ClientStoriesTab.js with all story data inlined.
 * Run: node build-client-stories-react.js
 */
const fs = require('fs');
const stories = JSON.parse(fs.readFileSync('IBM_Client_Stories_export (4).json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('extracted-files/upload-manifest.json', 'utf8'));

const clean = stories.map(s => {
  const b64 = (s.pdfData || '').split(',')[1] || '';
  const size = Math.floor(b64.length * 0.75);
  let best = null, bestDiff = Infinity;
  manifest.files.forEach(f => {
    const diff = Math.abs(size - f.size);
    if (diff < f.size * 0.05 && diff < bestDiff) { best = f; bestDiff = diff; }
  });
  return {
    id: s.id, num: s.num, badge: s.badge, updatedAt: s.updatedAt,
    title: s.title, client: s.client, industry: s.industry,
    products: s.products, region: s.region, usecase: s.usecase,
    summary: s.summary, metrics: s.metrics,
    pdfPath: best ? best.path : '', pdfFilename: s.pdfFilename,
  };
});

const data = JSON.stringify(clean);

const component = `import React, { useState, useMemo } from 'react';

const SUPABASE_BASE = 'https://zashpljcxjssogosxovf.supabase.co/storage/v1/object/public/story-files/';

const INDUSTRY_COLORS = {
  'Financial Services':    { bg: '#dde8ff', color: '#0043ce', icon: '🏦' },
  'Financial Technology':  { bg: '#dde8ff', color: '#0043ce', icon: '💳' },
  'Healthcare':            { bg: '#ffd6e8', color: '#9f1853', icon: '🏥' },
  'Technology':            { bg: '#e8daff', color: '#6929c4', icon: '💻' },
  'Telecommunications':    { bg: '#d9fbfb', color: '#005d5d', icon: '📡' },
  'Manufacturing':         { bg: '#ffd6ae', color: '#8a3800', icon: '⚙️' },
  'Retail':                { bg: '#ffe0c0', color: '#8a3800', icon: '🛍️' },
  'Insurance':             { bg: '#cce0ff', color: '#003a6d', icon: '🛡️' },
  'Government':            { bg: '#d0f4de', color: '#044317', icon: '🏛️' },
  'Local Government':      { bg: '#d0f4de', color: '#044317', icon: '🏙️' },
  'Automotive':            { bg: '#e5f6ff', color: '#004a6b', icon: '🚗' },
  'Sports & Entertainment':{ bg: '#fff0f3', color: '#a2191f', icon: '🏆' },
  'Travel & Hospitality':  { bg: '#ecfdf5', color: '#044317', icon: '✈️' },
  'Energy & Utilities':    { bg: '#fef3c7', color: '#744210', icon: '⚡' },
  'Defense & Aerospace':   { bg: '#e8eaed', color: '#2c3e50', icon: '🚀' },
};

const ALL_STORIES = ${data};

// ── helpers ──────────────────────────────────────────────────────────────────

function getStoredStarred() {
  try { return JSON.parse(localStorage.getItem('cs_starred') || '[]'); } catch { return []; }
}

function saveStarred(arr) {
  try { localStorage.setItem('cs_starred', JSON.stringify(arr)); } catch {}
}

function downloadFile(pdfPath, filename) {
  const a = document.createElement('a');
  a.href = SUPABASE_BASE + pdfPath;
  a.download = filename || 'IBM_Story.pptx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── sub-components ────────────────────────────────────────────────────────────

function StoryCard({ story, isStarred, onToggleStar }) {
  const c = INDUSTRY_COLORS[story.industry] || { bg: '#f4f4f4', color: '#525252', icon: '📄' };
  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardHeader, background: c.bg, color: c.color }}>
        <span style={styles.cardIndustry}>{c.icon} {story.industry}</span>
        <button
          onClick={() => onToggleStar(story.id)}
          style={{ ...styles.starBtn, color: isStarred ? '#f1c21b' : '#c6c6c6' }}
          title={isStarred ? 'Remove from shortlist' : 'Add to shortlist'}
        >
          {isStarred ? '★' : '☆'}
        </button>
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardTitle}>{story.title}</div>
        <div style={styles.cardClient}>{story.client}</div>
        <div style={styles.cardSummary}>{story.summary}</div>
        <div style={styles.cardMetrics}>
          {(story.metrics || []).map((m, i) => (
            <div key={i} style={styles.cardMetric}>• {m}</div>
          ))}
        </div>
      </div>
      <div style={styles.cardFooter}>
        <span style={styles.cardDate}>Updated {story.updatedAt || ''}</span>
        {story.pdfPath && (
          <button
            style={styles.btnOnePager}
            onClick={() => downloadFile(story.pdfPath, story.pdfFilename)}
          >
            ⬇ One-Pager
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSection({ title, type, items, active, onToggle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={styles.filterTitle}>{title}</div>
      {items.map(({ value, count }) => (
        <label key={value} style={styles.filterItem}>
          <input
            type="checkbox"
            checked={active.includes(value)}
            onChange={() => onToggle(type, value)}
            style={{ cursor: 'pointer', accentColor: '#0f62fe', flexShrink: 0 }}
          />
          <span style={styles.filterLabel}>{value}</span>
          <span style={styles.filterCount}>{count}</span>
        </label>
      ))}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const ClientStoriesTab = () => {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [filters, setFilters] = useState({ industry: [], product: [], usecase: [] });
  const [starred, setStarred] = useState(getStoredStarred);

  const toggleStar = (id) => {
    setStarred(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      saveStarred(next);
      return next;
    });
  };

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const arr = prev[type];
      return { ...prev, [type]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  // Build sidebar options with counts (always based on unfiltered full list)
  const sidebarOptions = useMemo(() => {
    const count = (pred) => ALL_STORIES.filter(pred).length;
    const industries = [...new Set(ALL_STORIES.map(s => s.industry).filter(Boolean))].sort()
      .map(v => ({ value: v, count: count(s => s.industry === v) }));
    const products = [...new Set(ALL_STORIES.flatMap(s => s.products))].sort()
      .map(v => ({ value: v, count: count(s => s.products.includes(v)) }));
    const usecases = [...new Set(ALL_STORIES.map(s => s.usecase).filter(Boolean))].sort()
      .map(v => ({ value: v, count: count(s => s.usecase === v) }));
    return { industries, products, usecases };
  }, []);

  // Stats (always from full list)
  const totalIndustries = useMemo(() => new Set(ALL_STORIES.map(s => s.industry)).size, []);
  const totalUseCases   = useMemo(() => new Set(ALL_STORIES.map(s => s.usecase)).size, []);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = ALL_STORIES.filter(s => {
      if (filters.industry.length && !filters.industry.includes(s.industry)) return false;
      if (filters.usecase.length && !filters.usecase.includes(s.usecase)) return false;
      if (filters.product.length && !s.products.some(p => filters.product.includes(p))) return false;
      if (q) {
        const hay = [s.title, s.client, s.summary, s.industry, ...s.products].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === 'az')       result = [...result].sort((a, b) => a.client.localeCompare(b.client));
    if (sort === 'za')       result = [...result].sort((a, b) => b.client.localeCompare(a.client));
    if (sort === 'newest')   result = [...result].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    if (sort === 'industry') result = [...result].sort((a, b) => a.industry.localeCompare(b.industry));
    return result;
  }, [search, sort, filters]);

  const shortlisted = useMemo(() => ALL_STORIES.filter(s => starred.includes(s.id)), [starred]);

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.ibmLogo}>IBM</span>
          <span style={styles.headerDivider} />
          <span style={styles.headerTitle}>Client Stories</span>
        </div>
        <div style={styles.heroStats}>
          <div style={styles.heroStat}>
            <div style={styles.heroStatNum}>{ALL_STORIES.length}</div>
            <div style={styles.heroStatLbl}>Stories</div>
          </div>
          <div style={{ ...styles.heroStat, borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={styles.heroStatNum}>{totalIndustries}</div>
            <div style={styles.heroStatLbl}>Industries</div>
          </div>
          <div style={{ ...styles.heroStat, borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={styles.heroStatNum}>{totalUseCases}</div>
            <div style={styles.heroStatLbl}>Use Cases</div>
          </div>
        </div>
      </div>

      {/* Hero bar */}
      <div style={styles.heroBar}>
        A curated library of <strong style={{ color: '#fff', fontWeight: 600 }}>IBM Data &amp; AI</strong> client stories — filter by industry, product, or use case to find the right reference for any conversation.
      </div>

      {/* Body */}
      <div style={styles.body}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <FilterSection title="Industry" type="industry" items={sidebarOptions.industries} active={filters.industry} onToggle={toggleFilter} />
          <FilterSection title="Product"  type="product"  items={sidebarOptions.products}  active={filters.product}  onToggle={toggleFilter} />
          <FilterSection title="Use Case" type="usecase"  items={sidebarOptions.usecases}  active={filters.usecase}  onToggle={toggleFilter} />
        </aside>

        {/* Main */}
        <main style={styles.main}>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button style={{ ...styles.tabBtn, ...(tab === 'all' ? styles.tabBtnActive : {}) }} onClick={() => setTab('all')}>All Stories</button>
            <button style={{ ...styles.tabBtn, ...(tab === 'shortlist' ? styles.tabBtnActive : {}) }} onClick={() => setTab('shortlist')}>My Shortlist</button>
          </div>

          {tab === 'all' && (
            <>
              {/* Toolbar */}
              <div style={styles.toolbar}>
                <div style={styles.searchWrap}>
                  <svg style={styles.searchIcon} width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M15.5 14.5l-4.26-4.26A6 6 0 1 0 10.24 11.24L14.5 15.5l1-1zM6 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
                  </svg>
                  <input
                    type="search"
                    placeholder="Search stories, clients, keywords…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
                <select value={sort} onChange={e => setSort(e.target.value)} style={styles.sortSelect}>
                  <option value="default">Sort: Default</option>
                  <option value="az">Client A–Z</option>
                  <option value="za">Client Z–A</option>
                  <option value="newest">Newest First</option>
                  <option value="industry">By Industry</option>
                </select>
                <span style={styles.resultsCount}>{filtered.length} of {ALL_STORIES.length} stories</span>
              </div>

              {/* Grid */}
              {filtered.length === 0 ? (
                <div style={styles.empty}>
                  <strong style={{ display: 'block', fontSize: 16, marginBottom: 8, color: '#161616' }}>No stories found</strong>
                  Try adjusting your filters or search term.
                </div>
              ) : (
                <div style={styles.grid}>
                  {filtered.map(s => (
                    <StoryCard key={s.id} story={s} isStarred={starred.includes(s.id)} onToggleStar={toggleStar} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'shortlist' && (
            shortlisted.length === 0 ? (
              <div style={styles.empty}>
                <strong style={{ display: 'block', fontSize: 16, marginBottom: 8, color: '#161616' }}>No shortlisted stories yet</strong>
                Click ☆ on any card to add it here.
              </div>
            ) : (
              <div style={styles.grid}>
                {shortlisted.map(s => (
                  <StoryCard key={s.id} story={s} isStarred={true} onToggleStar={toggleStar} />
                ))}
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

// ── styles ────────────────────────────────────────────────────────────────────

const styles = {
  root: { display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 14, background: '#f4f4f4', color: '#161616', overflow: 'hidden' },
  header: { background: '#13161f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 52, borderBottom: '3px solid #0f62fe', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  ibmLogo: { fontSize: 20, fontWeight: 700, letterSpacing: 4 },
  headerDivider: { display: 'inline-block', width: 1, height: 22, background: 'rgba(255,255,255,0.25)' },
  headerTitle: { fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.8)' },
  heroStats: { display: 'flex' },
  heroStat: { textAlign: 'center', padding: '0 24px' },
  heroStatNum: { fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 },
  heroStatLbl: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginTop: 3 },
  heroBar: { background: '#13161f', color: 'rgba(255,255,255,0.65)', padding: '12px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 13, flexShrink: 0 },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: 210, minWidth: 210, background: '#fff', borderRight: '1px solid #e0e0e0', overflowY: 'auto', padding: '16px 12px 24px' },
  filterTitle: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6f6f6f', marginBottom: 8, paddingLeft: 4 },
  filterItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', cursor: 'pointer', userSelect: 'none', borderRadius: 3 },
  filterLabel: { fontSize: 13, color: '#161616', flex: 1, lineHeight: 1.3 },
  filterCount: { fontSize: 11, color: '#a8a8a8', fontWeight: 500 },
  main: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  tabs: { display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: 16 },
  tabBtn: { background: 'none', border: 'none', borderBottom: '3px solid transparent', padding: '10px 0', marginRight: 28, fontSize: 14, fontWeight: 500, color: '#525252', cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1 },
  tabBtnActive: { color: '#0f62fe', borderBottomColor: '#0f62fe', fontWeight: 600 },
  toolbar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  searchWrap: { position: 'relative', flex: 1, maxWidth: 480 },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6f6f6f', pointerEvents: 'none' },
  searchInput: { width: '100%', padding: '8px 12px 8px 34px', border: '1px solid #c6c6c6', background: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none' },
  sortSelect: { padding: '8px 10px', border: '1px solid #c6c6c6', background: '#fff', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', minWidth: 140 },
  resultsCount: { marginLeft: 'auto', fontSize: 12, color: '#6f6f6f', whiteSpace: 'nowrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#6f6f6f' },
  card: { background: '#fff', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', borderRadius: 2 },
  cardHeader: { padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardIndustry: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 },
  starBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, padding: 0, lineHeight: 1 },
  cardBody: { padding: '14px 16px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: '#161616', lineHeight: 1.4 },
  cardClient: { fontSize: 13, fontWeight: 600, color: '#0f62fe' },
  cardSummary: { fontSize: 12, color: '#525252', lineHeight: 1.55, flex: 1 },
  cardMetrics: { display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 },
  cardMetric: { fontSize: 12, color: '#198038', fontWeight: 500 },
  cardFooter: { padding: '10px 16px 12px', borderTop: '1px solid #f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardDate: { fontSize: 11, color: '#a8a8a8' },
  btnOnePager: { background: '#0f62fe', color: '#fff', border: 'none', padding: '7px 16px', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 5 },
};

export default ClientStoriesTab;
`;

fs.writeFileSync('src/components/ClientStoriesTab.js', component);
console.log('Written', Buffer.byteLength(component, 'utf8'), 'bytes to src/components/ClientStoriesTab.js');

#!/usr/bin/env node
const fs = require('fs');
const stories = JSON.parse(fs.readFileSync('IBM_Client_Stories_export (4).json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('extracted-files/upload-manifest.json', 'utf8'));

// Map base64 size → Supabase path
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
    urlCase: s.urlCase, urlVideo: s.urlVideo,
    pdfPath: best ? best.path : '',
    pdfFilename: s.pdfFilename,
  };
});

const SUPABASE_BASE = 'https://zashpljcxjssogosxovf.supabase.co/storage/v1/object/public/story-files/';

const INDUSTRY_COLORS = {
  'Financial Services':    { bg:'#dde8ff', color:'#0043ce', icon:'🏦' },
  'Financial Technology':  { bg:'#dde8ff', color:'#0043ce', icon:'💳' },
  'Healthcare':            { bg:'#ffd6e8', color:'#9f1853', icon:'🏥' },
  'Technology':            { bg:'#e8daff', color:'#6929c4', icon:'💻' },
  'Telecommunications':    { bg:'#d9fbfb', color:'#005d5d', icon:'📡' },
  'Manufacturing':         { bg:'#ffd6ae', color:'#8a3800', icon:'⚙️' },
  'Retail':                { bg:'#ffe0c0', color:'#8a3800', icon:'🛍️' },
  'Insurance':             { bg:'#cce0ff', color:'#003a6d', icon:'🛡️' },
  'Government':            { bg:'#d0f4de', color:'#044317', icon:'🏛️' },
  'Local Government':      { bg:'#d0f4de', color:'#044317', icon:'🏙️' },
  'Automotive':            { bg:'#e5f6ff', color:'#004a6b', icon:'🚗' },
  'Sports & Entertainment':{ bg:'#fff0f3', color:'#a2191f', icon:'🏆' },
  'Travel & Hospitality':  { bg:'#ecfdf5', color:'#044317', icon:'✈️' },
  'Energy & Utilities':    { bg:'#fef3c7', color:'#744210', icon:'⚡' },
  'Defense & Aerospace':   { bg:'#e8eaed', color:'#2c3e50', icon:'🚀' },
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IBM Client Stories</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Sans', system-ui, sans-serif; font-size: 14px; background: #f4f4f4; color: #161616; }

    .header { background: #13161f; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: 52px; border-bottom: 3px solid #0f62fe; flex-shrink: 0; }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .ibm-logo { font-size: 20px; font-weight: 700; letter-spacing: 4px; }
    .header-divider { width: 1px; height: 22px; background: rgba(255,255,255,0.25); }
    .header-title { font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.8); }
    .btn-admin { background: transparent; border: 1px solid rgba(255,255,255,0.4); color: rgba(255,255,255,0.85); padding: 4px 14px; font-size: 12px; font-family: inherit; cursor: pointer; border-radius: 3px; }
    .btn-admin:hover { background: rgba(255,255,255,0.1); }

    .hero-bar { background: #13161f; color: rgba(255,255,255,0.65); padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .hero-text { font-size: 13px; }
    .hero-text strong { color: #fff; font-weight: 600; }
    .hero-stats { display: flex; }
    .hero-stat { text-align: center; padding: 0 24px; border-left: 1px solid rgba(255,255,255,0.15); }
    .hero-stat:first-child { border-left: none; }
    .hero-stat-num { font-size: 28px; font-weight: 700; color: #fff; line-height: 1; }
    .hero-stat-lbl { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.45); margin-top: 3px; }

    .app-body { display: flex; height: calc(100vh - 110px); overflow: hidden; }
    .sidebar { width: 210px; min-width: 210px; background: #fff; border-right: 1px solid #e0e0e0; overflow-y: auto; padding: 16px 12px 24px; }
    .main { flex: 1; overflow-y: auto; padding: 20px 24px; }

    .filter-section { margin-bottom: 20px; }
    .filter-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6f6f6f; margin-bottom: 8px; padding-left: 4px; }
    .filter-item { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 3px; cursor: pointer; user-select: none; }
    .filter-item:hover { background: #f4f4f4; }
    .filter-item input[type=checkbox] { width: 14px; height: 14px; cursor: pointer; accent-color: #0f62fe; flex-shrink: 0; }
    .filter-item-label { font-size: 13px; color: #161616; flex: 1; line-height: 1.3; }
    .filter-item-count { font-size: 11px; color: #a8a8a8; font-weight: 500; }

    .tabs { display: flex; border-bottom: 1px solid #e0e0e0; margin-bottom: 16px; }
    .tab-btn { background: none; border: none; border-bottom: 3px solid transparent; padding: 10px 0; margin-right: 28px; font-size: 14px; font-weight: 500; color: #525252; cursor: pointer; font-family: inherit; margin-bottom: -1px; }
    .tab-btn:hover { color: #161616; }
    .tab-btn.active { color: #0f62fe; border-bottom-color: #0f62fe; font-weight: 600; }

    .toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .search-wrap { position: relative; flex: 1; max-width: 480px; }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #6f6f6f; pointer-events: none; }
    .search-input { width: 100%; padding: 8px 12px 8px 34px; border: 1px solid #c6c6c6; background: #fff; font-size: 13px; font-family: inherit; outline: none; }
    .search-input:focus { border-color: #0f62fe; }
    .sort-select { padding: 8px 10px; border: 1px solid #c6c6c6; background: #fff; font-size: 13px; font-family: inherit; cursor: pointer; outline: none; min-width: 140px; }
    .results-count { margin-left: auto; font-size: 12px; color: #6f6f6f; white-space: nowrap; }

    .stories-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    @media (max-width: 1200px) { .stories-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 800px) { .stories-grid { grid-template-columns: 1fr; } }

    .story-card { background: #fff; border: 1px solid #e0e0e0; display: flex; flex-direction: column; }
    .story-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
    .card-header { padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; }
    .card-industry { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: 6px; }
    .card-star { background: none; border: none; cursor: pointer; font-size: 16px; color: #c6c6c6; padding: 0; line-height: 1; }
    .card-star.starred, .card-star:hover { color: #f1c21b; }
    .card-body { padding: 14px 16px 10px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .card-title { font-size: 14px; font-weight: 600; color: #161616; line-height: 1.4; }
    .card-client { font-size: 13px; font-weight: 600; color: #0f62fe; }
    .card-summary { font-size: 12px; color: #525252; line-height: 1.55; flex: 1; }
    .card-metrics { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
    .card-metric { font-size: 12px; color: #198038; font-weight: 500; display: flex; align-items: flex-start; gap: 5px; }
    .card-metric::before { content: "•"; flex-shrink: 0; }
    .card-footer { padding: 10px 16px 12px; border-top: 1px solid #f4f4f4; display: flex; align-items: center; justify-content: space-between; }
    .card-date { font-size: 11px; color: #a8a8a8; }
    .btn-onepager { background: #0f62fe; color: #fff; border: none; padding: 7px 16px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 5px; }
    .btn-onepager:hover { background: #0353e9; }

    .empty { grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6f6f6f; }
    .empty strong { display: block; font-size: 16px; margin-bottom: 8px; color: #161616; }
    .shortlist-empty { text-align: center; padding: 60px 20px; color: #6f6f6f; }
    .shortlist-empty strong { display: block; font-size: 16px; margin-bottom: 8px; color: #161616; }
  </style>
</head>
<body>

<header class="header">
  <div class="header-left">
    <span class="ibm-logo">IBM</span>
    <span class="header-divider"></span>
    <span class="header-title">Client Stories</span>
  </div>
  <button class="btn-admin" id="btnAdmin">Admin</button>
</header>

<div class="hero-bar">
  <div class="hero-text">A curated library of <strong>IBM Data &amp; AI</strong> client stories &mdash; filter by industry, product, or use case to find the right reference for any conversation.</div>
  <div class="hero-stats">
    <div class="hero-stat"><div class="hero-stat-num" id="statStories">0</div><div class="hero-stat-lbl">Stories</div></div>
    <div class="hero-stat"><div class="hero-stat-num" id="statIndustries">0</div><div class="hero-stat-lbl">Industries</div></div>
    <div class="hero-stat"><div class="hero-stat-num" id="statUseCases">0</div><div class="hero-stat-lbl">Use Cases</div></div>
  </div>
</div>

<div class="app-body">
  <aside class="sidebar">
    <div class="filter-section"><div class="filter-section-title">Industry</div><div id="filterIndustry"></div></div>
    <div class="filter-section"><div class="filter-section-title">Product</div><div id="filterProduct"></div></div>
    <div class="filter-section"><div class="filter-section-title">Use Case</div><div id="filterUseCase"></div></div>
  </aside>
  <main class="main">
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('all', this)">All Stories</button>
      <button class="tab-btn" onclick="switchTab('shortlist', this)">My Shortlist</button>
    </div>
    <div id="viewAll">
      <div class="toolbar">
        <div class="search-wrap">
          <span class="search-icon"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M15.5 14.5l-4.26-4.26A6 6 0 1 0 10.24 11.24L14.5 15.5l1-1zM6 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg></span>
          <input class="search-input" id="searchInput" type="search" placeholder="Search stories, clients, keywords…" oninput="render()">
        </div>
        <select class="sort-select" id="sortSelect" onchange="render()">
          <option value="default">Sort: Default</option>
          <option value="az">Client A–Z</option>
          <option value="za">Client Z–A</option>
          <option value="newest">Newest First</option>
          <option value="industry">By Industry</option>
        </select>
        <div class="results-count" id="resultsCount"></div>
      </div>
      <div class="stories-grid" id="storiesGrid"></div>
    </div>
    <div id="viewShortlist" style="display:none">
      <div class="stories-grid" id="shortlistGrid"></div>
    </div>
  </main>
</div>

<script>
var SUPABASE_BASE = '${SUPABASE_BASE}';
var INDUSTRY_COLORS = ${JSON.stringify(INDUSTRY_COLORS)};
var ALL_STORIES = ${JSON.stringify(clean)};

var starred = JSON.parse(localStorage.getItem('cs_starred') || '[]');
var activeTab = 'all';
var filters = { industry: [], product: [], usecase: [] };

function saveStarred() { try { localStorage.setItem('cs_starred', JSON.stringify(starred)); } catch(e){} }

function toggleStar(id) {
  var i = starred.indexOf(id);
  if (i === -1) starred.push(id); else starred.splice(i, 1);
  saveStarred(); render();
}

function download(path, filename) {
  var a = document.createElement('a');
  a.href = SUPABASE_BASE + path;
  a.download = filename || 'IBM_Story.pptx';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function switchTab(tab, el) {
  activeTab = tab;
  var btns = document.querySelectorAll('.tab-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  el.classList.add('active');
  document.getElementById('viewAll').style.display = tab === 'all' ? '' : 'none';
  document.getElementById('viewShortlist').style.display = tab === 'shortlist' ? '' : 'none';
  render();
}

function hasFilter(type, value) {
  return filters[type].indexOf(value) !== -1;
}

function toggleFilter(type, value, cb) {
  var arr = filters[type];
  var i = arr.indexOf(value);
  if (cb.checked && i === -1) arr.push(value);
  else if (!cb.checked && i !== -1) arr.splice(i, 1);
  render();
}

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function buildFilters(all) {
  function makeItems(elId, type, values) {
    var el = document.getElementById(elId);
    var html = '';
    for (var vi = 0; vi < values.length; vi++) {
      var v = values[vi];
      var count = 0;
      for (var si = 0; si < all.length; si++) {
        var s = all[si];
        if (type === 'industry' && s.industry === v) count++;
        if (type === 'product') { for (var pi = 0; pi < s.products.length; pi++) { if (s.products[pi] === v) { count++; break; } } }
        if (type === 'usecase' && s.usecase === v) count++;
      }
      var checked = hasFilter(type, v) ? ' checked' : '';
      var safeV = esc(v);
      var jsV = v.replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'");
      html += '<label class="filter-item"><input type="checkbox"' + checked +
        ' onchange="toggleFilter(\\'' + type + '\\',\\'' + jsV + '\\',this)">' +
        '<span class="filter-item-label">' + safeV + '</span>' +
        '<span class="filter-item-count">' + count + '</span></label>';
    }
    el.innerHTML = html;
  }
  var inds = [], prods = [], ucs = [], indSeen = {}, prodSeen = {}, ucSeen = {};
  for (var i = 0; i < all.length; i++) {
    var s = all[i];
    if (s.industry && !indSeen[s.industry]) { inds.push(s.industry); indSeen[s.industry] = 1; }
    for (var pi = 0; pi < s.products.length; pi++) { if (!prodSeen[s.products[pi]]) { prods.push(s.products[pi]); prodSeen[s.products[pi]] = 1; } }
    if (s.usecase && !ucSeen[s.usecase]) { ucs.push(s.usecase); ucSeen[s.usecase] = 1; }
  }
  inds.sort(); prods.sort(); ucs.sort();
  makeItems('filterIndustry', 'industry', inds);
  makeItems('filterProduct',  'product',  prods);
  makeItems('filterUseCase',  'usecase',  ucs);
}

function getFiltered() {
  var q = document.getElementById('searchInput').value.toLowerCase();
  var sort = document.getElementById('sortSelect').value;
  var result = [];
  for (var i = 0; i < ALL_STORIES.length; i++) {
    var s = ALL_STORIES[i];
    if (filters.industry.length && filters.industry.indexOf(s.industry) === -1) continue;
    if (filters.usecase.length && filters.usecase.indexOf(s.usecase) === -1) continue;
    if (filters.product.length) {
      var found = false;
      for (var pi = 0; pi < s.products.length; pi++) { if (filters.product.indexOf(s.products[pi]) !== -1) { found = true; break; } }
      if (!found) continue;
    }
    if (q) {
      var hay = ((s.title||'') + ' ' + (s.client||'') + ' ' + (s.summary||'') + ' ' + (s.industry||'') + ' ' + (s.products||[]).join(' ')).toLowerCase();
      if (hay.indexOf(q) === -1) continue;
    }
    result.push(s);
  }
  if (sort === 'az')       result.sort(function(a,b){ return a.client.localeCompare(b.client); });
  if (sort === 'za')       result.sort(function(a,b){ return b.client.localeCompare(a.client); });
  if (sort === 'newest')   result.sort(function(a,b){ return (b.updatedAt||'').localeCompare(a.updatedAt||''); });
  if (sort === 'industry') result.sort(function(a,b){ return a.industry.localeCompare(b.industry); });
  return result;
}

function cardHTML(s) {
  var c = INDUSTRY_COLORS[s.industry] || { bg:'#f4f4f4', color:'#525252', icon:'📄' };
  var isStarred = starred.indexOf(s.id) !== -1;
  var metrics = (s.metrics || []).map(function(m){ return '<div class="card-metric">' + esc(m) + '</div>'; }).join('');
  var footer = '';
  if (s.pdfPath) {
    var safeFilename = (s.pdfFilename || '').replace(/'/g, '');
    footer = '<button class="btn-onepager" onclick="download(\\'' + s.pdfPath + '\\',\\'' + safeFilename + '\\')">&#11015; One-Pager</button>';
  }
  return '<div class="story-card">' +
    '<div class="card-header" style="background:' + c.bg + ';color:' + c.color + '">' +
      '<div class="card-industry">' + c.icon + ' ' + esc(s.industry) + '</div>' +
      '<button class="card-star ' + (isStarred ? 'starred' : '') + '" onclick="toggleStar(\\'' + s.id + '\\')">' + (isStarred ? '&#9733;' : '&#9734;') + '</button>' +
    '</div>' +
    '<div class="card-body">' +
      '<div class="card-title">' + esc(s.title) + '</div>' +
      '<div class="card-client">' + esc(s.client) + '</div>' +
      '<div class="card-summary">' + esc(s.summary) + '</div>' +
      '<div class="card-metrics">' + metrics + '</div>' +
    '</div>' +
    '<div class="card-footer">' +
      '<div class="card-date">Updated ' + esc(s.updatedAt || '') + '</div>' +
      footer +
    '</div>' +
  '</div>';
}

function render() {
  var filtered = getFiltered();
  buildFilters(ALL_STORIES);

  document.getElementById('statStories').textContent = ALL_STORIES.length;
  var inds = {}, ucs = {};
  for (var i = 0; i < ALL_STORIES.length; i++) { inds[ALL_STORIES[i].industry] = 1; ucs[ALL_STORIES[i].usecase] = 1; }
  document.getElementById('statIndustries').textContent = Object.keys(inds).length;
  document.getElementById('statUseCases').textContent = Object.keys(ucs).length;
  document.getElementById('resultsCount').textContent = filtered.length + ' of ' + ALL_STORIES.length + ' stories';

  var grid = document.getElementById('storiesGrid');
  grid.innerHTML = filtered.length === 0
    ? '<div class="empty"><strong>No stories found</strong>Try adjusting your filters or search term.</div>'
    : filtered.map(cardHTML).join('');

  var sl = ALL_STORIES.filter(function(s){ return starred.indexOf(s.id) !== -1; });
  var sg = document.getElementById('shortlistGrid');
  sg.innerHTML = sl.length === 0
    ? '<div class="shortlist-empty"><strong>No shortlisted stories yet</strong><p>Click &#9734; on any card to add it here.</p></div>'
    : sl.map(cardHTML).join('');
}

render();
</script>
</body>
</html>`;

fs.writeFileSync('public/client-stories.html', html);
console.log('Written', Buffer.byteLength(html, 'utf8'), 'bytes to public/client-stories.html');

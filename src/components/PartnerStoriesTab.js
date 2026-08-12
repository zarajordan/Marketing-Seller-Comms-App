import React, { useState, useMemo, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_STORIES = [
  {
    id: 'ps01',
    title: 'NHS Digital Transformation with AI',
    client: 'NHS England',
    partner: 'Accenture',
    offering: 'Generative AI Platform',
    visibility: 'External',
    contentType: 'Video',
    industry: 'Healthcare',
    partnerMotion: 'Build',
    year: '2025',
    market: 'UK',
    overview: 'NHS England partnered with Accenture to implement an AI-powered digital transformation initiative across multiple hospitals.',
    challenge: 'Outdated paper-based processes and siloed data were slowing clinical decisions and patient throughput across NHS trusts.',
    outcomes: '40% reduction in admin time, 25% faster patient processing, £5M projected annual savings across participating trusts.',
    notes: '',
  },
  {
    id: 'ps02',
    title: 'Retail Innovation with Cloud Solutions',
    client: 'Marks & Spencer',
    partner: 'IBM Consulting',
    offering: 'Hybrid Cloud Platform',
    visibility: 'External',
    contentType: 'Video',
    industry: 'Retail',
    partnerMotion: 'Sell',
    year: '2025',
    market: 'UK',
    overview: "M&S transformed their retail operations with IBM's hybrid cloud solutions, enabling seamless omnichannel experiences.",
    challenge: "Legacy systems couldn't support modern omnichannel retail demands. Inventory visibility was poor, leading to stockouts and...",
    outcomes: '35% increase in online sales, 50% reduction in stockouts, 20% improvement in inventory turnover, and 45% increase in customer...',
    notes: '',
  },
  {
    id: 'ps03',
    title: 'Banking Security Enhancement',
    client: 'Barclays',
    partner: 'Deloitte',
    offering: 'Secure & Resilient Infrastructure',
    visibility: 'Internal',
    contentType: 'Case Study',
    industry: 'Financial Services',
    partnerMotion: 'Service',
    year: '2024',
    market: 'UK',
    overview: "Barclays enhanced their cybersecurity posture with Deloitte's expertise, implementing advanced threat detection capabilities.",
    challenge: 'Rising cyber threats and regulatory pressure demanded a modernised security operations centre with real-time threat intelligence.',
    outcomes: '60% faster threat detection, zero critical incidents post-deployment, full regulatory compliance achieved within 6 months.',
    notes: '',
  },
];

const INDUSTRIES = ['Financial Services', 'Healthcare', 'Retail', 'Technology', 'Telecommunications', 'Manufacturing', 'Insurance', 'Government', 'Energy & Utilities', 'Other'];
const CONTENT_TYPES = ['Video', 'Case Study', 'Blog', 'Infographic', 'Podcast', 'Webinar'];
const PARTNER_MOTIONS = ['Build', 'Sell', 'Service', 'Co-create'];
const MARKETS = ['UK', 'Ireland', 'EMEA', 'Global'];

const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const STATUS_STYLES = {
  Pending:   { bg: '#fef3c7', color: '#92400e' },
  Confirmed: { bg: '#d1fae5', color: '#065f46' },
  Completed: { bg: '#dde8ff', color: '#1e40af' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

// Date helpers (still used by FilmingCalendar)
const today = new Date();
const fmt = (d) => d.toISOString().slice(0, 10);

const VISIBILITY_COLORS = {
  External: { bg: '#dde8ff', color: '#0043ce' },
  Internal: { bg: '#fff3cd', color: '#b45309' },
};

const CONTENT_TYPE_COLORS = {
  Video:      { bg: '#e8daff', color: '#6929c4' },
  'Case Study':{ bg: '#d0f4de', color: '#044317' },
  Blog:       { bg: '#ffd6e8', color: '#9f1853' },
  Infographic:{ bg: '#d9fbfb', color: '#005d5d' },
  Podcast:    { bg: '#ffd6ae', color: '#8a3800' },
  Webinar:    { bg: '#cce0ff', color: '#003a6d' },
};

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function Badge({ label, style }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '4px',
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase', ...style,
    }}>{label}</span>
  );
}

function Tag({ label, colorMap }) {
  const c = (colorMap || {})[label] || { bg: '#f4f4f4', color: '#525252' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: 500, background: c.bg, color: c.color,
    }}>{label}</span>
  );
}

// ── Story Card ────────────────────────────────────────────────────────────────
function StoryCard({ story, onClick }) {
  const vc = VISIBILITY_COLORS[story.visibility] || { bg: '#f4f4f4', color: '#525252' };
  const truncate = (s, n) => s && s.length > n ? s.slice(0, n) + '…' : s;

  return (
    <div
      onClick={() => onClick(story)}
      style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        padding: '20px', cursor: 'pointer', transition: 'box-shadow 0.15s',
        display: 'flex', flexDirection: 'column', gap: '0',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827', lineHeight: 1.3, flex: 1 }}>{story.title}</h3>
        <Badge label={story.visibility} style={{ ...vc, flexShrink: 0 }} />
      </div>

      {/* Meta table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: '13px', marginBottom: '14px', borderBottom: '1px solid #f0f0f0', paddingBottom: '14px' }}>
        {[['Client:', story.client], ['Partner:', story.partner], ['Offering:', story.offering]].map(([k, v]) => (
          <React.Fragment key={k}>
            <span style={{ color: '#6b7280', fontWeight: 500 }}>{k}</span>
            <span style={{ color: '#111827' }}>{v}</span>
          </React.Fragment>
        ))}
      </div>

      {/* Sections */}
      {[['STORY OVERVIEW', story.overview], ['BUSINESS CHALLENGE', story.challenge], ['OUTCOMES', story.outcomes]].map(([heading, text]) => (
        text ? (
          <div key={heading} style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>{heading}</div>
            <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{truncate(text, 110)}</p>
          </div>
        ) : null
      ))}

      {/* Tags */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
        <Tag label={story.contentType} colorMap={CONTENT_TYPE_COLORS} />
        <Tag label={story.industry} colorMap={{}} />
        <Tag label={story.partnerMotion} colorMap={{}} />
        <Tag label={story.year} colorMap={{}} />
      </div>
    </div>
  );
}

// ── Story Detail Modal ────────────────────────────────────────────────────────
function StoryModal({ story, onClose, isAdmin, onEdit, onDelete }) {
  const vc = VISIBILITY_COLORS[story.visibility] || { bg: '#f4f4f4', color: '#525252' };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '90%', maxWidth: '620px', maxHeight: '85vh', overflowY: 'auto',
        background: '#fff', borderRadius: '16px', zIndex: 1001, padding: '28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{story.title}</h2>
              <Badge label={story.visibility} style={{ ...vc }} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280', flexShrink: 0, lineHeight: 1 }}>✕</button>
        </div>

        {/* Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontSize: '14px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          {[['Client:', story.client], ['Partner:', story.partner], ['Offering:', story.offering], ['Industry:', story.industry], ['Market:', story.market], ['Year:', story.year]].map(([k, v]) => (
            <React.Fragment key={k}>
              <span style={{ color: '#6b7280', fontWeight: 600 }}>{k}</span>
              <span style={{ color: '#111827' }}>{v}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Story sections */}
        {[['STORY OVERVIEW', story.overview], ['BUSINESS CHALLENGE', story.challenge], ['OUTCOMES', story.outcomes], ['ADDITIONAL NOTES', story.notes]].map(([heading, text]) => (
          text ? (
            <div key={heading} style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>{heading}</div>
              <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{text}</p>
            </div>
          ) : null
        ))}

        {/* Tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <Tag label={story.contentType} colorMap={CONTENT_TYPE_COLORS} />
          <Tag label={story.industry} colorMap={{}} />
          <Tag label={story.partnerMotion} colorMap={{}} />
          <Tag label={story.year} colorMap={{}} />
          {story.market && <Tag label={story.market} colorMap={{}} />}
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button onClick={() => onEdit(story)} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>✏️ Edit</button>
            <button onClick={() => onDelete(story.id)} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>🗑 Delete</button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Add / Edit Story Modal ────────────────────────────────────────────────────
function StoryFormModal({ initial, onSave, onClose }) {
  const empty = {
    title: '', client: '', partner: '', offering: '', visibility: 'External',
    contentType: 'Video', industry: 'Technology', partnerMotion: 'Build',
    year: String(new Date().getFullYear()), market: 'UK',
    overview: '', challenge: '', outcomes: '', notes: '',
  };
  const [form, setForm] = useState(initial || empty);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.client.trim() || !form.partner.trim()) return;
    onSave({ ...form, id: initial?.id || `ps-${Date.now()}` });
  };

  const years = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i));

  const Field = ({ label, children, required }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{label}{required && ' *'}</label>
      {children}
    </div>
  );

  const inputStyle = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' };
  const selectStyle = { ...inputStyle, background: '#fff' };
  const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '70px' };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '90%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto',
        background: '#fff', borderRadius: '16px', zIndex: 1001, padding: '28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{initial ? '✏️ Edit Story' : '➕ Add Story'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Story Title" required><input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. NHS AI Transformation" required /></Field>
            <Field label="Client Name" required><input style={inputStyle} value={form.client} onChange={e => set('client', e.target.value)} placeholder="e.g. NHS England" required /></Field>
            <Field label="Partner Name" required><input style={inputStyle} value={form.partner} onChange={e => set('partner', e.target.value)} placeholder="e.g. Accenture" required /></Field>
            <Field label="Offering / Product"><input style={inputStyle} value={form.offering} onChange={e => set('offering', e.target.value)} placeholder="e.g. Hybrid Cloud Platform" /></Field>
            <Field label="Visibility">
              <select style={selectStyle} value={form.visibility} onChange={e => set('visibility', e.target.value)}>
                <option>External</option><option>Internal</option>
              </select>
            </Field>
            <Field label="Content Type">
              <select style={selectStyle} value={form.contentType} onChange={e => set('contentType', e.target.value)}>
                {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Industry">
              <select style={selectStyle} value={form.industry} onChange={e => set('industry', e.target.value)}>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Partner Motion">
              <select style={selectStyle} value={form.partnerMotion} onChange={e => set('partnerMotion', e.target.value)}>
                {PARTNER_MOTIONS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Year">
              <select style={selectStyle} value={form.year} onChange={e => set('year', e.target.value)}>
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Market">
              <select style={selectStyle} value={form.market} onChange={e => set('market', e.target.value)}>
                {MARKETS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Story Overview"><textarea style={textareaStyle} value={form.overview} onChange={e => set('overview', e.target.value)} placeholder="High-level summary of the story…" /></Field>
          <Field label="Business Challenge"><textarea style={textareaStyle} value={form.challenge} onChange={e => set('challenge', e.target.value)} placeholder="What problem were they trying to solve?" /></Field>
          <Field label="Outcomes"><textarea style={textareaStyle} value={form.outcomes} onChange={e => set('outcomes', e.target.value)} placeholder="Measurable results and impact…" /></Field>
          <Field label="Additional Notes"><textarea style={textareaStyle} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional context…" /></Field>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Cancel</button>
            <button type="submit" style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              {initial ? 'Save Changes' : 'Add Story'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Stories sub-tab ───────────────────────────────────────────────────────────
function StoriesView({ stories, isAdmin, onAddStory, onEditStory, onDeleteStory }) {
  const [search, setSearch] = useState('');
  const [visFilter, setVisFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [motionFilter, setMotionFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [marketFilter, setMarketFilter] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);
  const [editingStory, setEditingStory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const years = useMemo(() => [...new Set(stories.map(s => s.year))].sort((a, b) => b - a), [stories]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stories.filter(s =>
      (!q || [s.title, s.client, s.partner, s.industry, s.overview].some(f => f?.toLowerCase().includes(q))) &&
      (!visFilter || s.visibility === visFilter) &&
      (!typeFilter || s.contentType === typeFilter) &&
      (!industryFilter || s.industry === industryFilter) &&
      (!motionFilter || s.partnerMotion === motionFilter) &&
      (!yearFilter || s.year === yearFilter) &&
      (!marketFilter || s.market === marketFilter)
    );
  }, [stories, search, visFilter, typeFilter, industryFilter, motionFilter, yearFilter, marketFilter]);

  const clearFilters = () => { setVisFilter(''); setTypeFilter(''); setIndustryFilter(''); setMotionFilter(''); setYearFilter(''); setMarketFilter(''); setSearch(''); };

  const selectStyle = {
    padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '8px',
    fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none',
  };

  const handleEdit = (story) => { setSelectedStory(null); setEditingStory(story); };

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search by title, client, partner, industry, keywords…"
          style={{ width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Filters */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', alignItems: 'end' }}>
          {[
            { label: 'Visibility', value: visFilter, setter: setVisFilter, options: ['All Stories', 'External', 'Internal'] },
            { label: 'Content Type', value: typeFilter, setter: setTypeFilter, options: ['All Types', ...CONTENT_TYPES] },
            { label: 'Industry', value: industryFilter, setter: setIndustryFilter, options: ['All Industries', ...INDUSTRIES] },
            { label: 'Partner Motion', value: motionFilter, setter: setMotionFilter, options: ['All Motions', ...PARTNER_MOTIONS] },
            { label: 'Year', value: yearFilter, setter: setYearFilter, options: ['All Years', ...years] },
            { label: 'Market', value: marketFilter, setter: setMarketFilter, options: ['All Markets', ...MARKETS] },
          ].map(({ label, value, setter, options }) => (
            <div key={label}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>{label}</div>
              <select style={selectStyle} value={value} onChange={e => setter(e.target.value === options[0] ? '' : e.target.value)}>
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={clearFilters} style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>Clear Filters</button>
          </div>
        </div>
      </div>

      {/* Count bar */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '14px', color: '#374151' }}>
        <span>Total Stories: <strong style={{ color: '#2563eb' }}>{stories.length}</strong></span>
        <span>Showing: <strong style={{ color: '#2563eb' }}>{filtered.length}</strong></span>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '14px' }}>No stories match your filters.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filtered.map(s => <StoryCard key={s.id} story={s} onClick={setSelectedStory} />)}
        </div>
      )}

      {/* Detail modal */}
      {selectedStory && (
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={(id) => { setSelectedStory(null); onDeleteStory(id); }}
        />
      )}

      {/* Edit modal */}
      {editingStory && (
        <StoryFormModal
          initial={editingStory}
          onSave={(updated) => { onEditStory(updated); setEditingStory(null); }}
          onClose={() => setEditingStory(null)}
        />
      )}

      {/* Add modal */}
      {showAddForm && (
        <StoryFormModal
          onSave={(story) => { onAddStory(story); setShowAddForm(false); }}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

// ── Repository sub-tab ────────────────────────────────────────────────────────
function RepositoryView({ stories }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stories.filter(s =>
      (!q || [s.title, s.client, s.partner].some(f => f?.toLowerCase().includes(q))) &&
      (!typeFilter || s.contentType === typeFilter)
    );
  }, [stories, search, typeFilter]);

  return (
    <div style={{ padding: '0 0 40px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search repository…"
          style={{ flex: 1, minWidth: '200px', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value === 'All Types' ? '' : e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none' }}>
          {['All Types', ...CONTENT_TYPES].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              {['Story Title', 'Client', 'Partner', 'Type', 'Industry', 'Year', 'Market', 'Visibility'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>No results found.</td></tr>
            ) : filtered.map((s, i) => {
              const vc = VISIBILITY_COLORS[s.visibility] || { bg: '#f4f4f4', color: '#525252' };
              const tc = CONTENT_TYPE_COLORS[s.contentType] || { bg: '#f4f4f4', color: '#525252' };
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500, color: '#111827', maxWidth: '220px' }}>{s.title}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{s.client}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{s.partner}</td>
                  <td style={{ padding: '10px 14px' }}><Badge label={s.contentType} style={{ ...tc, fontSize: '10px' }} /></td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{s.industry}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{s.year}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{s.market}</td>
                  <td style={{ padding: '10px 14px' }}><Badge label={s.visibility} style={{ ...vc, fontSize: '10px' }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Submit Story sub-tab ──────────────────────────────────────────────────────
function SubmitStoryView() {
  const [requestType, setRequestType] = useState('new');
  const [form, setForm] = useState({
    clientName: '', partnerName: '', yourName: '', yourEmail: '',
    phone: '', ibmTeam: '', contentTypes: [], industry: '',
    overview: '', challenge: '', outcomes: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleContentType = (type) => {
    setForm(f => ({
      ...f,
      contentTypes: f.contentTypes.includes(type)
        ? f.contentTypes.filter(t => t !== type)
        : [...f.contentTypes, type],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClear = () => { setForm({ clientName: '', partnerName: '', yourName: '', yourEmail: '', phone: '', ibmTeam: '', contentTypes: [], industry: '', overview: '', challenge: '', outcomes: '', notes: '' }); setRequestType('new'); setSubmitted(false); };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
  const sectionTitle = (t) => <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>{t}</h3>;
  const label = (t, req) => <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>{t}{req ? ' *' : ''}</label>;

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Request Submitted!</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Thank you — the IBM Partner Stories team will be in touch.</p>
        <button onClick={handleClear} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Submit Another</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', padding: '0 0 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700 }}>📝 Submit a Partner Story</h2>
        </div>
        <span style={{ fontSize: '13px', color: '#6b7280', textAlign: 'right', maxWidth: '360px' }}>Fill out the form below to request a new partner story or get guidance on creating one</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Request Type */}
        <div>
          {sectionTitle('Request Type')}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[{ id: 'new', icon: '📖', title: 'Request New Story', desc: 'Request IBM to create a new partner story' }, { id: 'guidance', icon: '💡', title: 'Request Guidance', desc: 'Get guidance on creating your own story' }].map(opt => (
              <div key={opt.id} onClick={() => setRequestType(opt.id)}
                style={{ flex: '0 0 180px', border: `2px solid ${requestType === opt.id ? '#2563eb' : '#e5e7eb'}`, borderRadius: '10px', padding: '16px 14px', cursor: 'pointer', background: requestType === opt.id ? '#eff6ff' : '#fff', textAlign: 'center', transition: 'border-color 0.15s' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{opt.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{opt.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Story Information */}
        <div>
          {sectionTitle('Story Information')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {[['clientName', 'Client Name', true, ''], ['partnerName', 'Partner Name', true, ''], ['yourName', 'Your Name', true, ''], ['yourEmail', 'Your Email', true, ''], ['phone', 'Contact Phone', false, '+44 …'], ['ibmTeam', 'IBM Team / Role', false, 'e.g., UKI Partner Marketing']].map(([k, lbl, req, ph]) => (
              <div key={k}>
                {label(lbl, req)}
                <input style={inputStyle} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} required={req} type={k === 'yourEmail' ? 'email' : 'text'} />
              </div>
            ))}
          </div>
        </div>

        {/* Desired Content Type */}
        <div>
          {sectionTitle('Desired Content Type')}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {CONTENT_TYPES.map(type => (
              <button key={type} type="button" onClick={() => toggleContentType(type)}
                style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${form.contentTypes.includes(type) ? '#2563eb' : '#d1d5db'}`, background: form.contentTypes.includes(type) ? '#eff6ff' : '#fff', color: form.contentTypes.includes(type) ? '#2563eb' : '#374151', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.15s' }}>
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Story Details */}
        <div>
          {sectionTitle('Story Details')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[['overview', 'Story Overview *', true, 'High-level summary of the partner story…'], ['challenge', 'Business Challenge', false, 'What problem was the client trying to solve?'], ['outcomes', 'Outcomes *', true, 'What were the measurable outcomes and results?']].map(([k, lbl, req, ph]) => (
              <div key={k}>
                {label(lbl, req)}
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} required={req} />
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div>
          {sectionTitle('Additional Information')}
          {label('Additional Notes')}
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional information, special requirements, or context…" />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <button type="button" onClick={handleClear} style={{ padding: '10px 22px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Clear Form</button>
          <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Submit Request</button>
        </div>
      </form>
    </div>
  );
}

// ── Filming Calendar (shared) ─────────────────────────────────────────────────
function FilmingCalendar({ bookings, selectedDate, onSelectDate, currentMonth, onChangeMonth }) {
  const todayDate = new Date();
  const { year, month } = currentMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const startOffset = (firstDay + 6) % 7;

  // Build a map: dateStr → array of bookings
  const byDate = useMemo(() => {
    const m = {};
    bookings.forEach(b => {
      if (!m[b.date]) m[b.date] = [];
      m[b.date].push(b);
    });
    return m;
  }, [bookings]);

  const calCells = [];
  for (let i = 0; i < startOffset; i++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);

  // Status dot colour priority: Confirmed > Pending > Completed
  const dotColor = (bks) => {
    if (bks.some(b => b.status === 'Confirmed')) return '#16a34a';
    if (bks.some(b => b.status === 'Pending'))   return '#d97706';
    if (bks.some(b => b.status === 'Completed')) return '#2563eb';
    return '#9ca3af';
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 20px' }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <button onClick={() => onChangeMonth(-1)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <span style={{ fontSize: '15px', fontWeight: 700, flex: 1, textAlign: 'center' }}>{monthLabel}</span>
        <button onClick={() => onChangeMonth(1)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '3px' }}>
        {dayLabels.map(d => <div key={d} style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textAlign: 'center', padding: '3px 0' }}>{d}</div>)}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {calCells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === fmt(todayDate);
          const isSelected = selectedDate === dateStr;
          const dayBookings = (byDate[dateStr] || []).filter(b => b.status !== 'Cancelled');
          const hasBooking = dayBookings.length > 0;

          return (
            <div key={day} onClick={() => onSelectDate(isSelected ? null : dateStr)}
              style={{
                textAlign: 'center', padding: '6px 2px 8px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                background: isSelected ? '#2563eb' : isToday ? '#eff6ff' : hasBooking ? '#f0fdf4' : 'transparent',
                color: isSelected ? '#fff' : isToday ? '#2563eb' : '#374151',
                fontWeight: isToday || isSelected ? 700 : 400,
                border: isSelected ? '2px solid #2563eb' : isToday ? '1px solid #bfdbfe' : hasBooking ? '1px solid #bbf7d0' : '1px solid transparent',
                position: 'relative', minHeight: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              }}>
              <span>{day}</span>
              {hasBooking && !isSelected && (
                <span style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {dayBookings.slice(0, 3).map((b, bi) => (
                    <span key={bi} style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor([b]), display: 'inline-block' }} />
                  ))}
                </span>
              )}
              {hasBooking && isSelected && (
                <span style={{ fontSize: '10px', fontWeight: 700 }}>{dayBookings.length}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
        {[['#16a34a', 'Confirmed'], ['#d97706', 'Pending'], ['#2563eb', 'Completed'], ['#eff6ff', 'Today']].map(([bg, label]) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6b7280' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: bg, display: 'inline-block', border: label === 'Today' ? '1px solid #bfdbfe' : 'none' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Booking Form Modal ────────────────────────────────────────────────────────
function BookingFormModal({ initial, onSave, onClose }) {
  const emptyForm = {
    date: '', timeStart: '', timeEnd: '', topic: '', partnerName: '', clientName: '',
    approvalsConfirmed: false, participants: '', yourName: '', yourEmail: '', ibmTeam: '', notes: '', status: 'Pending',
  };
  const parseSlot = (slot = '') => {
    const parts = slot.split(/[–\-]/);
    return { timeStart: parts[0]?.trim() || '', timeEnd: parts[1]?.trim() || '' };
  };
  const [form, setForm] = useState(initial ? { ...emptyForm, ...initial, ...parseSlot(initial.timeSlot) } : emptyForm);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!initial;

  const inputStyle = { width: '100%', padding: '9px 11px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const lbl = (t, req) => <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>{t}{req ? ' *' : ''}</label>;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '92%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '14px', zIndex: 1001, padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{isEdit ? '✏️ Edit Booking' : '🎬 Add Filming Slot'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSave({ ...form, timeSlot: form.timeStart && form.timeEnd ? `${form.timeStart}–${form.timeEnd}` : form.timeStart || '', id: initial?.id || `b-${Date.now()}` }); }} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
            <div>{lbl('Date', true)}<input type="date" style={inputStyle} value={form.date} onChange={e => set('date', e.target.value)} required /></div>
            <div style={{ gridColumn: 'span 2' }}>
              {lbl('Time Slot', true)}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="time" style={{ ...inputStyle, flex: 1 }} value={form.timeStart || ''} onChange={e => set('timeStart', e.target.value)} required />
                <span style={{ color: '#6b7280', fontSize: '13px', flexShrink: 0 }}>to</span>
                <input type="time" style={{ ...inputStyle, flex: 1 }} value={form.timeEnd || ''} onChange={e => set('timeEnd', e.target.value)} required />
              </div>
            </div>
            <div>{lbl('Topic / Story Title', true)}<input style={inputStyle} value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="What will be covered?" required /></div>
            <div>{lbl('Partner Name', true)}<input style={inputStyle} value={form.partnerName} onChange={e => set('partnerName', e.target.value)} required /></div>
            <div>{lbl('Client Name (if relevant)')}<input style={inputStyle} value={form.clientName} onChange={e => set('clientName', e.target.value)} /></div>
            <div>{lbl('Your Name', true)}<input style={inputStyle} value={form.yourName} onChange={e => set('yourName', e.target.value)} required /></div>
            <div>{lbl('Your Email', true)}<input type="email" style={inputStyle} value={form.yourEmail} onChange={e => set('yourEmail', e.target.value)} required /></div>
            <div>{lbl('IBM Team', true)}<input style={inputStyle} value={form.ibmTeam} onChange={e => set('ibmTeam', e.target.value)} placeholder="e.g. UKI Partner Marketing" required /></div>
            {isEdit && (
              <div>{lbl('Status')}<select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>{BOOKING_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            )}
          </div>
          <div>
            {lbl('Participants', true)}
            <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.participants} onChange={e => set('participants', e.target.value)} placeholder="List all people who will appear on camera…" required />
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
            <input type="checkbox" checked={form.approvalsConfirmed} onChange={e => set('approvalsConfirmed', e.target.checked)} style={{ width: '16px', height: '16px', marginTop: '1px', accentColor: '#2563eb', flexShrink: 0 }} />
            <span>All necessary client / partner approvals have been secured</span>
          </label>
          <div>
            {lbl('Notes')}
            <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Special requirements, location preferences, kit needed…" />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', borderRadius: '7px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Cancel</button>
            <button type="submit" style={{ padding: '9px 22px', borderRadius: '7px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{isEdit ? 'Save Changes' : 'Add Booking'}</button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Booking Detail Modal ──────────────────────────────────────────────────────
function BookingDetailModal({ booking, onClose, isAdmin, onEdit, onUpdateStatus, onDelete }) {
  const ss = STATUS_STYLES[booking.status] || STATUS_STYLES.Pending;
  const nextStatus = { Pending: 'Confirmed', Confirmed: 'Completed', Completed: null, Cancelled: null };
  const next = nextStatus[booking.status];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '92%', maxWidth: '560px', maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: '14px', zIndex: 1001, padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700 }}>{booking.topic}</h2>
            <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, ...ss }}>{booking.status}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: '13px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          {[['Date', new Date(booking.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })], ['Time Slot', booking.timeSlot], ['Partner', booking.partnerName], ['Client', booking.clientName || '—'], ['IBM Team', booking.ibmTeam], ['Booked by', booking.yourName], ['Email', booking.yourEmail]].map(([k, v]) => (
            <div key={k}><span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '2px' }}>{k}</span><span>{v}</span></div>
          ))}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>PARTICIPANTS</div>
          <p style={{ margin: 0, fontSize: '13px' }}>{booking.participants}</p>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>APPROVALS</div>
          <p style={{ margin: 0, fontSize: '13px', color: booking.approvalsConfirmed ? '#065f46' : '#991b1b' }}>
            {booking.approvalsConfirmed ? '✓ Approvals confirmed' : '✗ Approvals not yet confirmed'}
          </p>
        </div>
        {booking.notes && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>NOTES</div>
            <p style={{ margin: 0, fontSize: '13px' }}>{booking.notes}</p>
          </div>
        )}

        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
            {next && (
              <button onClick={() => { onUpdateStatus(booking.id, next); onClose(); }}
                style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#16a34a', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                ✓ Mark as {next}
              </button>
            )}
            {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
              <button onClick={() => { onUpdateStatus(booking.id, 'Cancelled'); onClose(); }}
                style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                ✗ Cancel
              </button>
            )}
            <button onClick={() => onEdit(booking)}
              style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
              ✏️ Edit
            </button>
            <button onClick={() => { onDelete(booking.id); onClose(); }}
              style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 500, marginLeft: 'auto' }}>
              🗑 Delete
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Book Filming sub-tab (full management view) ───────────────────────────────
function BookFilmingView({ bookings, isAdmin, onAddBooking, onUpdateBooking, onUpdateStatus, onDeleteBooking }) {
  const nowDate = new Date();
  const [currentMonth, setCurrentMonth] = useState({ year: nowDate.getFullYear(), month: nowDate.getMonth() });
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('calendar'); // 'calendar' | 'list' | 'request'
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // booking request form state (for non-admin / user view)
  const [reqForm, setReqForm] = useState({ date: '', timeStart: '', timeEnd: '', topic: '', partnerName: '', clientName: '', approvalsConfirmed: false, participants: '', yourName: '', yourEmail: '', ibmTeam: '', notes: '' });
  const [reqSubmitted, setReqSubmitted] = useState(false);
  const setReq = (k, v) => setReqForm(f => ({ ...f, [k]: v }));

  const changeMonth = (dir) => setCurrentMonth(cm => { const d = new Date(cm.year, cm.month + dir); return { year: d.getFullYear(), month: d.getMonth() }; });

  const dayBookings = useMemo(() => selectedDate ? bookings.filter(b => b.date === selectedDate) : [], [bookings, selectedDate]);

  const filteredList = useMemo(() => {
    return bookings
      .filter(b => (!statusFilter || b.status === statusFilter))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [bookings, statusFilter]);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    thisMonth: bookings.filter(b => {
      const d = new Date(b.date + 'T12:00:00');
      return d.getMonth() === nowDate.getMonth() && d.getFullYear() === nowDate.getFullYear();
    }).length,
  }), [bookings]);

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const sectionTitle = (t) => <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>{t}</h3>;
  const lbl = (t, req) => <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>{t}{req ? ' *' : ''}</label>;

  const handleReqSubmit = (e) => {
    e.preventDefault();
    onAddBooking({ ...reqForm, timeSlot: reqForm.timeStart && reqForm.timeEnd ? `${reqForm.timeStart}–${reqForm.timeEnd}` : reqForm.timeStart || '', id: `b-${Date.now()}`, status: 'Pending' });
    setReqSubmitted(true);
  };
  const clearReq = () => { setReqForm({ date: '', timeStart: '', timeEnd: '', topic: '', partnerName: '', clientName: '', approvalsConfirmed: false, participants: '', yourName: '', yourEmail: '', ibmTeam: '', notes: '' }); setReqSubmitted(false); };

  const viewBtnStyle = (id) => ({
    padding: '7px 16px', borderRadius: '7px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit',
    background: view === id ? '#111827' : '#fff', color: view === id ? '#fff' : '#374151',
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: '0 0 3px', fontSize: '22px', fontWeight: 700 }}>🎬 Filming Management</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Production calendar, booking requests and session tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button style={viewBtnStyle('calendar')} onClick={() => setView('calendar')}>📅 Calendar</button>
          <button style={viewBtnStyle('list')} onClick={() => setView('list')}>📋 All Bookings</button>
          <button style={viewBtnStyle('request')} onClick={() => setView('request')}>✏️ Book a Session</button>
          {isAdmin && <button onClick={() => setShowAddForm(true)} style={{ padding: '7px 16px', borderRadius: '7px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>+ Add Slot</button>}
        </div>
      </div>

      {/* ── KPI stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[['Total Bookings', stats.total, '#374151'], ['Pending Review', stats.pending, '#d97706'], ['Confirmed', stats.confirmed, '#16a34a'], ['This Month', stats.thisMonth, '#2563eb']].map(([label, val, color]) => (
          <div key={label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* ── CALENDAR VIEW ── */}
      {view === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
          <FilmingCalendar
            bookings={bookings}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            currentMonth={currentMonth}
            onChangeMonth={changeMonth}
          />

          {/* Day panel */}
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', minHeight: '300px' }}>
            {!selectedDate ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9ca3af' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
                <p style={{ fontSize: '13px' }}>Select a day to see bookings</p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: '#111827' }}>
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', marginLeft: '8px' }}>({dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''})</span>
                </div>
                {dayBookings.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', paddingTop: '24px' }}>No bookings on this day.</p>
                ) : (
                  dayBookings.map(b => {
                    const ss = STATUS_STYLES[b.status] || STATUS_STYLES.Pending;
                    return (
                      <div key={b.id} onClick={() => setSelectedBooking(b)}
                        style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginBottom: '10px', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, fontSize: '13px' }}>{b.topic}</span>
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, ...ss }}>{b.status}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{b.timeSlot}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{b.partnerName}{b.clientName ? ` / ${b.clientName}` : ''}</div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'Status', value: statusFilter, setter: setStatusFilter, opts: ['All Statuses', ...BOOKING_STATUSES] },
            ].map(({ label, value, setter, opts }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>{label}:</span>
                <select value={value} onChange={e => setter(e.target.value === opts[0] ? '' : e.target.value)}
                  style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: 'auto' }}>{filteredList.length} booking{filteredList.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  {['Date', 'Time', 'Topic', 'Partner', 'Booked By', 'Approvals', 'Status', isAdmin ? 'Actions' : ''].filter(Boolean).map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>No bookings found.</td></tr>
                ) : filteredList.map((b, i) => {
                  const ss = STATUS_STYLES[b.status] || STATUS_STYLES.Pending;
                  const isPast = new Date(b.date + 'T23:59:59') < nowDate;
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa', opacity: isPast && b.status === 'Pending' ? 0.6 : 1 }}>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {new Date(b.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#6b7280' }}>{b.timeSlot}</td>
                      <td style={{ padding: '10px 12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.topic}</td>
                      <td style={{ padding: '10px 12px', color: '#374151' }}>{b.partnerName}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{b.yourName}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{b.approvalsConfirmed ? '✅' : '⚠️'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {isAdmin ? (
                          <select value={b.status} onChange={e => onUpdateStatus(b.id, e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer', ...ss }}>
                            {BOOKING_STATUSES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, ...ss }}>{b.status}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setEditingBooking(b); }} style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '11px' }}>✏️</button>
                            <button onClick={() => onDeleteBooking(b.id)} style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', fontSize: '11px', color: '#dc2626' }}>🗑</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BOOKING REQUEST FORM ── */}
      {view === 'request' && (
        reqSubmitted ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Booking Request Submitted!</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>The IBM intern production team will confirm your session shortly.</p>
            <button onClick={clearReq} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Submit Another</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
            {/* Form */}
            <form onSubmit={handleReqSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>📝 Book a Filming Session</h3>
                <span style={{ fontSize: '13px', color: '#6b7280', maxWidth: '260px', textAlign: 'right' }}>Check the calendar for availability, then fill out the form.</span>
              </div>

              <div>
                {sectionTitle('Session Details')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
                  <div>{lbl('Preferred Date', true)}<input type="date" style={inputStyle} value={reqForm.date} onChange={e => setReq('date', e.target.value)} required /></div>
                  <div style={{ gridColumn: 'span 2' }}>
                    {lbl('Preferred Time Slot', true)}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="time" style={{ ...inputStyle, flex: 1 }} value={reqForm.timeStart || ''} onChange={e => setReq('timeStart', e.target.value)} required />
                      <span style={{ color: '#6b7280', fontSize: '13px', flexShrink: 0 }}>to</span>
                      <input type="time" style={{ ...inputStyle, flex: 1 }} value={reqForm.timeEnd || ''} onChange={e => setReq('timeEnd', e.target.value)} required />
                    </div>
                  </div>
                  <div>{lbl('Topic / Story Title', true)}<input style={inputStyle} value={reqForm.topic} onChange={e => setReq('topic', e.target.value)} placeholder="What will be covered?" required /></div>
                  <div>{lbl('Partner Name', true)}<input style={inputStyle} value={reqForm.partnerName} onChange={e => setReq('partnerName', e.target.value)} required /></div>
                  <div>{lbl('Client Name (if relevant)')}<input style={inputStyle} value={reqForm.clientName} onChange={e => setReq('clientName', e.target.value)} /></div>
                </div>
              </div>

              <div>
                {sectionTitle('Participants & Approvals')}
                {lbl('Name(s) of Individuals to be Filmed', true)}
                <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', marginBottom: '12px' }} value={reqForm.participants} onChange={e => setReq('participants', e.target.value)} placeholder="List all people who will appear on camera…" required />
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" checked={reqForm.approvalsConfirmed} onChange={e => setReq('approvalsConfirmed', e.target.checked)} style={{ width: '16px', height: '16px', marginTop: '1px', accentColor: '#2563eb', flexShrink: 0 }} />
                  <div><div style={{ fontWeight: 500 }}>All necessary client / partner approvals have been secured</div><div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>Approval must be obtained before filming begins</div></div>
                </label>
              </div>

              <div>
                {sectionTitle('Your Contact Details')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
                  <div>{lbl('Your Name', true)}<input style={inputStyle} value={reqForm.yourName} onChange={e => setReq('yourName', e.target.value)} required /></div>
                  <div>{lbl('Your Email', true)}<input type="email" style={inputStyle} value={reqForm.yourEmail} onChange={e => setReq('yourEmail', e.target.value)} required /></div>
                  <div>{lbl('IBM Team', true)}<input style={inputStyle} value={reqForm.ibmTeam} onChange={e => setReq('ibmTeam', e.target.value)} placeholder="e.g., UKI Partner Marketing" required /></div>
                </div>
              </div>

              <div>
                {sectionTitle('Additional Notes')}
                {lbl('Notes')}
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={reqForm.notes} onChange={e => setReq('notes', e.target.value)} placeholder="Special requirements, location preferences, kit needed…" />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <button type="button" onClick={clearReq} style={{ padding: '10px 22px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Clear Form</button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Submit Booking Request</button>
              </div>
            </form>

            {/* Mini calendar sidebar */}
            <div style={{ position: 'sticky', top: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>📅 Availability</div>
              <FilmingCalendar
                bookings={bookings}
                selectedDate={reqForm.date}
                onSelectDate={(d) => setReq('date', d || '')}
                currentMonth={currentMonth}
                onChangeMonth={changeMonth}
              />
            </div>
          </div>
        )
      )}

      {/* Modals */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          isAdmin={isAdmin}
          onEdit={(b) => { setSelectedBooking(null); setEditingBooking(b); }}
          onUpdateStatus={(id, status) => { onUpdateStatus(id, status); setSelectedBooking(null); }}
          onDelete={(id) => { onDeleteBooking(id); setSelectedBooking(null); }}
        />
      )}
      {(editingBooking || showAddForm) && (
        <BookingFormModal
          initial={editingBooking || null}
          onSave={(b) => { editingBooking ? onUpdateBooking(b) : onAddBooking(b); setEditingBooking(null); setShowAddForm(false); }}
          onClose={() => { setEditingBooking(null); setShowAddForm(false); }}
        />
      )}
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function PartnerStoriesTab({ filmingBookings = [], onAddBooking, onUpdateBooking, onUpdateBookingStatus, onDeleteBooking }) {
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 'admin-manager' || currentUser?.role === 'marketer' || currentUser?.role === 'marketing';
  const [adminMode, setAdminMode] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('stories');
  const [stories, setStories] = useState(SEED_STORIES);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddStory = (story) => setStories(s => [...s, story]);
  const handleEditStory = (updated) => setStories(s => s.map(x => x.id === updated.id ? updated : x));
  const handleDeleteStory = (id) => setStories(s => s.filter(x => x.id !== id));

  const SUB_TABS = [
    { id: 'stories', label: '📖 Stories' },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif', fontSize: '14px', color: '#111827', background: '#f9fafb', minHeight: '100vh' }}>

      {/* Page header */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px 24px', margin: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>IBM</div>
          <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: '#111827' }}>UKI Partner Stories</h1>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Partner content hub &amp; production calendar</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAdmin && (
            <>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>{adminMode ? '' : 'Viewer Mode'}</span>
              <button
                onClick={() => setAdminMode(m => !m)}
                style={{
                  padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600,
                  background: adminMode ? '#16a34a' : '#374151',
                  color: '#fff',
                }}>
                {adminMode ? '✓ Admin Mode' : '🔒 Admin Login'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Admin bar */}
      {adminMode && (
        <div style={{ background: '#16a34a', color: '#fff', padding: '10px 24px', margin: '0 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '20px' }}>📌 Admin Mode</span>
          <span style={{ fontSize: '13px', opacity: 0.9 }}>{currentUser?.email}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowAddForm(true)} style={{ padding: '5px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.5)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>+ Add Story</button>
          </div>
        </div>
      )}

      {/* Sub-tab nav */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '6px 16px', margin: '12px 16px 0', display: 'flex', gap: '4px' }}>
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 500, fontFamily: 'inherit',
              background: activeSubTab === tab.id ? '#2563eb' : 'transparent',
              color: activeSubTab === tab.id ? '#fff' : '#374151',
              transition: 'all 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ margin: '16px 16px 0', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px' }}>
        {activeSubTab === 'stories' && (
          <StoriesView
            stories={stories}
            isAdmin={adminMode && isAdmin}
            onAddStory={handleAddStory}
            onEditStory={handleEditStory}
            onDeleteStory={handleDeleteStory}
          />
        )}
      </div>

      {/* Add story modal (from admin bar) */}
      {showAddForm && (
        <StoryFormModal
          onSave={(story) => { handleAddStory(story); setShowAddForm(false); }}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

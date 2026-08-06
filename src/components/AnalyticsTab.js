import React, { useEffect, useState } from 'react';
import { Select, SelectItem, Tag, Tile } from '@carbon/react';
import { Loading } from '@carbon/react';
import { getAnalyticsSummary, getAnalyticsUserBreakdown, getAnalyticsMonthly, getAnalyticsTopEvents } from '../lib/supabaseData';

const PERIODS = [
  { value: 30,  label: 'Last 30 days' },
  { value: 90,  label: 'Last 90 days' },
  { value: 180, label: 'Last 6 months' },
  { value: 9999, label: 'All time' },
];

const ROLE_COLORS = {
  'admin-manager': '#da1e28',
  marketer: '#6929c4',
  marketing: '#005d5d',
  seller: '#0f62fe',
};

const DONUT_COLORS = ['#0f62fe', '#6929c4', '#005d5d', '#f1c21b', '#198038'];

const fmt = (n) => (n ?? 0).toLocaleString();

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const timeAgo = (iso) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-GB');
};

export default function AnalyticsTab() {
  const [days, setDays] = useState(90);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [topEvents, setTopEvents] = useState([]);

  useEffect(() => {
    load();
  }, [days]);

  const load = async () => {
    setLoading(true);
    try {
      const [s, u, m, t] = await Promise.all([
        getAnalyticsSummary(days),
        getAnalyticsUserBreakdown(days),
        getAnalyticsMonthly(days),
        getAnalyticsTopEvents(days),
      ]);
      setSummary(s);
      setUsers(u);
      setMonthly(m);
      setTopEvents(t);
    } catch (err) {
      console.error('Analytics load error', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Bar chart helper ───────────────────────────────────────────────────────
  const maxVisits = Math.max(...monthly.map((m) => m.visits), 1);
  const maxComms  = Math.max(...monthly.map((m) => m.comms), 1);
  const maxBar    = Math.max(maxVisits, maxComms);

  // ── Donut helpers ──────────────────────────────────────────────────────────
  const roleBreakdown = (() => {
    const counts = {};
    users.forEach((u) => { counts[u.role] = (counts[u.role] || 0) + u.comms; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([role, count], i) => ({
      role,
      count,
      pct: Math.round((count / total) * 100),
      color: DONUT_COLORS[i] || '#8d8d8d',
    }));
  })();

  const totalComms = roleBreakdown.reduce((a, b) => a + b.count, 0);

  // Build SVG donut
  const RADIUS = 15.915;
  const CIRC = 2 * Math.PI * RADIUS;
  let offset = 25; // start at top
  const donutSegments = roleBreakdown.map((seg) => {
    const dash = (seg.pct / 100) * CIRC;
    const gap  = CIRC - dash;
    const el = { ...seg, dash, gap, offset };
    offset -= dash; // SVG goes counter-clockwise from offset
    return el;
  });

  // Top events max
  const maxEventCount = Math.max(...topEvents.map((e) => e.count), 1);

  // Day-of-week breakdown
  const dowBreakdown = (() => {
    const days_labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const counts = Array(7).fill(0);
    users.forEach((u) => { /* placeholder — real data from activity_log */ });
    // use summary.dowCounts if available
    if (summary?.dowCounts) {
      summary.dowCounts.forEach((d) => { counts[d.dow] = d.count; });
    }
    const maxDow = Math.max(...counts, 1);
    return days_labels.map((label, i) => ({ label, count: counts[i], pct: Math.round((counts[i] / maxDow) * 100) }));
  })();

  const peakDow = dowBreakdown.reduce((a, b) => (b.count > a.count ? b : a), { label: '—', count: 0 });

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2>📊 Analytics</h2>
        <p style={{ color: '#525252', marginTop: '8px', fontSize: '14px' }}>
          Track site activity, comm generation and user engagement across the IBM UKI Marketing Hub.
        </p>
      </div>

      {/* Period selector */}
      <div style={{ marginBottom: '24px', maxWidth: '220px' }}>
        <Select id="analytics-period" labelText="Time period" value={days}
          onChange={(e) => setDays(Number(e.target.value))}>
          {PERIODS.map((p) => <SelectItem key={p.value} value={p.value} text={p.label} />)}
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px' }}>
          <Loading description="Loading analytics…" withOverlay={false} />
        </div>
      ) : (
        <>
          {/* ── KPI cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Site Visits',        value: fmt(summary?.visits),    sub: `Unique sessions in period`,       delta: summary?.visitsDelta  },
              { label: 'Unique Users',        value: fmt(summary?.users),     sub: `Unique users in period`,          delta: summary?.usersDelta   },
              { label: 'Comms Generated',     value: fmt(summary?.comms),     sub: `Total comms created in period`,   delta: summary?.commsDelta   },
              { label: 'Avg. Events / Comm',  value: summary?.avgEvents ?? '—', sub: `Events included per comm`,     delta: summary?.avgEventsDelta },
            ].map((kpi) => (
              <Tile key={kpi.label} style={{ padding: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#6f6f6f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>{kpi.label}</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#198038', lineHeight: 1.1 }}>{kpi.value}</p>
                {kpi.delta !== undefined && kpi.delta !== null && (
                  <p style={{ fontSize: '12px', fontWeight: 600, color: kpi.delta >= 0 ? '#198038' : '#da1e28', marginTop: '6px' }}>
                    {kpi.delta >= 0 ? '▲' : '▼'} {Math.abs(kpi.delta)}% vs previous period
                  </p>
                )}
                <p style={{ fontSize: '11px', color: '#6f6f6f', marginTop: '4px' }}>{kpi.sub}</p>
              </Tile>
            ))}
          </div>

          {/* ── Charts row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '28px' }}>

            {/* Monthly bar chart */}
            <Tile style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Comms Generated vs Site Visits — Monthly</p>
              {monthly.length === 0 ? (
                <p style={{ color: '#6f6f6f', fontSize: '13px' }}>No data yet for this period.</p>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px', paddingBottom: '24px', borderBottom: '1px solid #e0e0e0' }}>
                    {monthly.map((m) => (
                      <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: '2px' }}>
                        <div style={{ width: '100%', background: '#d0e2ff', borderRadius: '2px 2px 0 0', height: `${Math.round((m.visits / maxBar) * 100)}%`, minHeight: '2px' }} title={`${m.visits} visits`} />
                        <div style={{ width: '100%', background: '#0f62fe', borderRadius: '2px 2px 0 0', height: `${Math.round((m.comms / maxBar) * 100)}%`, minHeight: '2px' }} title={`${m.comms} comms`} />
                        <span style={{ fontSize: '10px', color: '#6f6f6f', marginTop: '4px' }}>{m.month}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6f6f6f' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#d0e2ff' }} /> Site Visits
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6f6f6f' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#0f62fe' }} /> Comms Generated
                    </div>
                  </div>
                </>
              )}
            </Tile>

            {/* Donut — comms by role */}
            <Tile style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Comms by Role</p>
              {totalComms === 0 ? (
                <p style={{ color: '#6f6f6f', fontSize: '13px' }}>No comms logged yet.</p>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                      <svg viewBox="0 0 42 42" width="120" height="120">
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e5e7eb" strokeWidth="5" />
                        {donutSegments.map((seg, i) => (
                          <circle key={i} cx="21" cy="21" r="15.915" fill="transparent"
                            stroke={seg.color} strokeWidth="5"
                            strokeDasharray={`${seg.dash} ${seg.gap}`}
                            strokeDashoffset={seg.offset} />
                        ))}
                      </svg>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>{totalComms}</div>
                        <div style={{ fontSize: '10px', color: '#6f6f6f' }}>total</div>
                      </div>
                    </div>
                  </div>
                  {roleBreakdown.map((seg) => (
                    <div key={seg.role} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#6f6f6f', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: seg.color }} />
                        <span style={{ textTransform: 'capitalize' }}>{seg.role}</span>
                      </div>
                      <span>{seg.pct}%</span>
                    </div>
                  ))}
                </>
              )}
            </Tile>
          </div>

          {/* ── Top events + day of week ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>

            <Tile style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Most Used Events in Comms</p>
              {topEvents.length === 0 ? (
                <p style={{ color: '#6f6f6f', fontSize: '13px' }}>No comm activity yet.</p>
              ) : (
                topEvents.slice(0, 8).map((ev) => (
                  <div key={ev.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>
                    <span style={{ flex: 1, color: '#1f2328', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{ev.title}</span>
                    <div style={{ flex: 1, margin: '0 10px' }}>
                      <div style={{ height: '6px', borderRadius: '3px', background: '#e0e0e0' }}>
                        <div style={{ height: '6px', borderRadius: '3px', background: '#0f62fe', width: `${Math.round((ev.count / maxEventCount) * 100)}%` }} />
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, color: '#0f62fe', minWidth: '24px', textAlign: 'right' }}>{ev.count}</span>
                  </div>
                ))
              )}
            </Tile>

            <Tile style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Activity by Day of Week</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '120px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
                {dowBreakdown.map((d) => (
                  <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: '4px' }}>
                    <div style={{ width: '100%', background: d.pct > 50 ? '#0f62fe' : '#d0e2ff', borderRadius: '2px 2px 0 0', height: `${Math.max(d.pct, 4)}%` }} title={`${d.count} events`} />
                    <span style={{ fontSize: '10px', color: '#6f6f6f' }}>{d.label}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: '#6f6f6f', marginTop: '10px' }}>
                Peak activity: <strong>{peakDow.label}</strong>
              </p>
            </Tile>
          </div>

          {/* ── User drill-down ── */}
          <Tile style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>User Activity Drill-down</p>
              <Tag type="gray" size="sm">{users.length} users</Tag>
            </div>
            {users.length === 0 ? (
              <p style={{ color: '#6f6f6f', fontSize: '13px' }}>No user activity logged yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      {['User', 'Role', 'Comms Generated', 'Site Visits', 'Avg. Events / Comm', 'Activity', 'Last Active'].map((h) => (
                        <th key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#6f6f6f', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '8px 12px', textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => {
                      const maxCommsUser = Math.max(...users.map((x) => x.comms), 1);
                      const barWidth = Math.round((u.comms / maxCommsUser) * 80);
                      const roleColor = ROLE_COLORS[u.role] || '#525252';
                      return (
                        <tr key={u.email} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '10px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: DONUT_COLORS[i % DONUT_COLORS.length], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                              {initials(u.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500 }}>{u.name || u.email}</div>
                              <div style={{ fontSize: '11px', color: '#6f6f6f' }}>{u.email}</div>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: roleColor + '22', color: roleColor }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600 }}>{u.comms}</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>{u.visits}</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>{u.avgEvents ?? '—'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ height: '6px', width: `${barWidth}px`, background: '#0f62fe', borderRadius: '3px', minWidth: '4px' }} />
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '11px', color: '#6f6f6f' }}>{timeAgo(u.lastActive)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Tile>
        </>
      )}
    </div>
  );
}

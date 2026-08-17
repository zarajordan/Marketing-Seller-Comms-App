import React, { useRef } from 'react';

const NAV_ITEMS = [
  { id: 'csr',        label: 'CSR' },
  { id: 'volunteer',  label: 'Volunteering' },
  { id: 'hours',      label: 'Track Hours' },
  { id: 'donate',     label: 'Donate' },
];

const VOLUNTEER_STEPS = [
  { text: <>Log in to the <strong>IBM Community Engagement Portal</strong>.</> },
  { text: <>Select <strong>Volunteer</strong> from the top toolbar.</> },
  { text: <>Choose <strong>Track Volunteer Time</strong>.</> },
  { text: <>If the activity isn't listed, select <strong>Something else</strong> and add a description. If it is listed, search for and select the event.</> },
  { text: <>Enter your hours (you can backdate to the start of the current year).</> },
  { text: null, warning: true }, // warning step — rendered separately
  { text: <>Confirm and submit.</> },
];

const DONATE_STEPS = [
  { text: <>Sign in to the <strong>IBM Community Engagement Portal</strong>.</> },
  { text: <>Under <strong>Make a Donation</strong>, select <strong>Explore Causes</strong>.</> },
  { text: <>Use the search bar to find your chosen charity.</> },
  { text: <>Select the charity from the results.</> },
  { text: <>Click <strong>Donate Now</strong>, complete the form, and submit.</> },
];

function StepTracker({ steps, accentColor = '#0f62fe' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: accentColor, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '13px', flexShrink: 0,
            }}>
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: '2px', flex: 1, minHeight: '20px', background: '#e0e0e0', margin: '4px 0' }} />
            )}
          </div>
          <div style={{ paddingBottom: i < steps.length - 1 ? '20px' : 0, paddingTop: '4px' }}>
            {step.warning ? (
              <>
                <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#161616', lineHeight: '1.6' }}>
                  Under <em>Choose your volunteer rewards</em>, keep <strong>Donation Currency</strong> selected.
                </p>
                <div style={{ background: '#fff1f1', border: '1px solid #ffa4a9', borderLeft: '4px solid #da1e28', borderRadius: '4px', padding: '10px 14px', fontSize: '13px', color: '#a2191f', fontWeight: 500 }}>
                  ⚠️ <strong>Do not</strong> change this to "No reward" — it cannot be edited later and you will lose your donation credit.
                </div>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: '14px', color: '#161616', lineHeight: '1.6' }}>{step.text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const CSRTab = () => {
  const refs = {
    csr:       useRef(null),
    volunteer: useRef(null),
    hours:     useRef(null),
    donate:    useRef(null),
  };

  const scrollTo = (id) => {
    refs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Week of Impact dates — show banner if today is on or before 30 April of the current year
  const now = new Date();
  const woi = new Date(now.getFullYear(), 3, 30); // April 30
  const woiStart = new Date(now.getFullYear(), 3, 22); // April 22
  const showWoiBanner = now <= woi;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', fontFamily: 'inherit' }}>

      {/* ── Page header ── */}
      <div style={{ padding: '0 0 20px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ color: '#0f1f60', fontWeight: 700, fontSize: '36px', letterSpacing: '-0.01em', marginBottom: '6px' }}>
          🤝 Corporate Social Responsibility &amp; Volunteering
        </h2>
        <p style={{ color: '#57606a', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          Across the UK and Ireland, IBMers are using their time, skills, and technology to create meaningful social impact.
        </p>
      </div>

      {/* ── Week of Impact banner ── */}
      {showWoiBanner && (
        <div style={{ background: 'linear-gradient(135deg, #8a3800, #f1620a)', borderRadius: '4px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '28px' }}>🔥</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '15px', color: '#fff' }}>Week of Impact — 22–30 April</p>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>
              Earn <strong>$20 per volunteering hour</strong> this week — double the usual rate. Log your hours in the IBM Community Engagement Portal.
            </p>
          </div>
          <button
            onClick={() => scrollTo('hours')}
            style={{ background: '#fff', color: '#8a3800', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            How to log hours ↓
          </button>
        </div>
      )}

      {/* ── In-page nav ── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {NAV_ITEMS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            style={{
              background: '#f4f4f4', border: '1px solid #e0e0e0', borderRadius: '20px',
              padding: '6px 16px', fontSize: '13px', fontWeight: 600, color: '#161616',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e0e0e0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f4f4f4'; }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── What Is CSR ── */}
      <section ref={refs.csr} style={{ marginBottom: '40px', scrollMarginTop: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#161616', marginBottom: '12px' }}>What Is CSR at IBM?</h3>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#161616', marginBottom: '16px' }}>
          CSR (Corporate Social Responsibility) refers to how a company aligns its social and environmental activities with its business purpose and values.
        </p>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#161616', marginBottom: '16px' }}>
          Purpose-driven companies consistently perform better. Research shows they benefit from stronger market valuations, higher employee retention, and increased revenue. At IBM, our CSR practices are tightly aligned to our business strategy and leverage:
        </p>
        <ul style={{ paddingLeft: '20px', margin: '0 0 16px', lineHeight: '2', color: '#161616', fontSize: '15px' }}>
          <li>IBM technology and tools</li>
          <li>The expertise and passion of IBMers</li>
          <li>Partnerships that create meaningful, measurable impact</li>
        </ul>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#161616', marginBottom: '20px' }}>
          IBM's CSR efforts focus primarily on <strong>education and skills</strong>, where our technology, techniques, and talent can make the greatest difference globally.
        </p>
        <a href="https://w3.ibm.com/w3publisher/csr-uk" target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-block', background: '#0f62fe', color: '#fff', fontWeight: 600, fontSize: '14px', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }}>
          👉 Find out more — UKI CSR page
        </a>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '40px' }} />

      {/* ── Volunteering ── */}
      <section ref={refs.volunteer} style={{ marginBottom: '40px', scrollMarginTop: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#161616', marginBottom: '12px' }}>Volunteering at IBM</h3>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#161616', marginBottom: '20px' }}>
          Volunteering is a key part of IBM's CSR commitment across the UK and Ireland. IBMers support local communities through in‑person and virtual opportunities, as well as volunteering outside of work. By logging volunteering hours in the IBM Community Engagement Portal, employees can also unlock donation credits to increase their impact.
        </p>
        <a href="https://w3.ibm.com/w3publisher/csr-uk/volunteering" target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-block', background: '#0f62fe', color: '#fff', fontWeight: 600, fontSize: '14px', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }}>
          👉 Explore volunteering opportunities
        </a>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '40px' }} />

      {/* ── Track Hours ── */}
      <section ref={refs.hours} style={{ marginBottom: '40px', scrollMarginTop: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#161616', marginBottom: '12px' }}>Track Your Hours and Earn Donation Credit</h3>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#161616', marginBottom: '20px' }}>
          If you volunteer — either through IBM or independently — log every hour in the IBM Community Engagement Portal to earn donation rewards.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', background: '#defbe6', border: '1px solid #a7f0ba', borderRadius: '4px', padding: '16px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: '#044317' }}>$10 / hour</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#044317' }}>Up to <strong>$1,000</strong> per year</p>
          </div>
          <div style={{ flex: 1, minWidth: '200px', background: '#ffd6ae', border: '1px solid #f1c21b', borderRadius: '4px', padding: '16px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: '#8a3800' }}>$20 / hour</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#8a3800' }}>During <strong>Week of Impact</strong> (22–30 April)</p>
          </div>
        </div>

        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#161616', marginBottom: '16px' }}>How to Track Your Volunteering Hours</h4>
        <StepTracker steps={VOLUNTEER_STEPS} />
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '40px' }} />

      {/* ── Donation Matching ── */}
      <section ref={refs.donate} style={{ marginBottom: '40px', scrollMarginTop: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#161616', marginBottom: '12px' }}>How to Donate and Use Fund Matching</h3>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#161616', marginBottom: '16px' }}>
          IBM offers a Donation Matching Programme for active UK &amp; Ireland employees:
        </p>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', background: '#edf5ff', border: '1px solid #c1d7f5', borderRadius: '4px', padding: '16px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#0043ce' }}>1:1 match</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#0043ce' }}>On all donations made through the portal</p>
          </div>
          <div style={{ flex: 1, minWidth: '200px', background: '#edf5ff', border: '1px solid #c1d7f5', borderRadius: '4px', padding: '16px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#0043ce' }}>Up to $10,000</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#0043ce' }}>Per employee, per calendar year</p>
          </div>
        </div>

        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#161616', marginBottom: '16px' }}>How to Donate</h4>
        <StepTracker steps={DONATE_STEPS} />

        <div style={{ background: '#defbe6', border: '1px solid #a7f0ba', borderRadius: '4px', padding: '14px 18px', fontSize: '14px', color: '#044317', fontWeight: 500, marginTop: '24px' }}>
          💚 Double your impact and help those who need it most.
        </div>
      </section>

    </div>
  );
};

export default CSRTab;

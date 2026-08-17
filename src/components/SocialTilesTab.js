import React from 'react';

const KIT_ICONS = {
  overview: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f62fe" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  copy: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f62fe" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  hashtag: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f62fe" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  ),
  link: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f62fe" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  image: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f62fe" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
};

const KIT_ITEMS = [
  { icon: KIT_ICONS.overview, label: 'Topic overview' },
  { icon: KIT_ICONS.copy,     label: 'Suggested copy' },
  { icon: KIT_ICONS.hashtag,  label: 'Hashtags' },
  { icon: KIT_ICONS.link,     label: 'Links & URLs' },
  { icon: KIT_ICONS.image,    label: 'Visual assets' },
];

const BEST_PRACTICES = [
  { label: 'Make it your own', body: "Don't copy and paste the sample text verbatim. Adapt it so it feels authentic to your voice and audience." },
  { label: 'Use visuals', body: 'Including a social graphic or imagery will significantly increase engagement.' },
  { label: 'Include one clear call to action', body: 'Keep it focused: one CTA is most effective.' },
  { label: 'Use hashtags thoughtfully', body: 'Use up to three hashtags to maximise reach without clutter.' },
  { label: 'Tag @IBM', body: 'Tagging @IBM increases the likelihood of visibility and engagement from our channels.' },
  { label: "Follow IBM's Social Computing Guidelines", body: 'Always ensure your post complies with IBM policy.' },
];

const SocialTilesTab = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', fontFamily: 'inherit' }}>

      {/* ── Page header ── */}
      <div style={{ padding: '0 0 20px', marginBottom: '32px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ color: '#0f1f60', fontWeight: 700, fontSize: '36px', letterSpacing: '-0.01em', marginBottom: '6px' }}>
          📱 IBM Approved Social Tiles and Guidance
        </h2>
        <p style={{ color: '#57606a', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          Shareable content kits and best practices for IBMers posting on social media.
        </p>
      </div>

      {/* ── Social Kits section ── */}
      <section style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#161616', marginBottom: '16px' }}>
          Are you an IBMer looking to post about a major IBM event, product launch, or strategic partnership?
        </p>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#161616', marginBottom: '24px' }}>
          Our Social Kits make it easy to share timely, relevant content aligned to IBM's most important moments.
        </p>

        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#161616', marginBottom: '16px' }}>Each kit includes:</h3>

        {/* ── Kit icon cards ── */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {KIT_ITEMS.map(({ icon, label }) => (
            <div key={label} style={{
              flex: '1 1 120px',
              background: '#f4f4f4',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '16px 12px',
              textAlign: 'center',
            }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#161616', lineHeight: '1.4' }}>{label}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#161616', marginBottom: '16px' }}>
          These elements are designed to help you quickly create a post that resonates with your audience while staying on-brand.
        </p>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#161616', marginBottom: '28px' }}>
          You're encouraged to personalise the sample copy to reflect your own voice — and don't forget to tag <strong>@IBM</strong>.
        </p>

        {/* ── CTA button ── */}
        <a
          href="https://w3.ibm.com/w3publisher/the-social-discipline/advocacy#Socialmediaenablement"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: '#0f62fe',
            color: '#fff',
            fontWeight: 600,
            fontSize: '15px',
            padding: '14px 28px',
            borderRadius: '4px',
            textDecoration: 'none',
          }}
        >
          👉 Open Social Kits on W3
        </a>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '40px' }} />

      {/* ── How to Use section ── */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#161616', marginBottom: '8px' }}>
          How to Use the Social Kits
        </h3>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#161616', marginBottom: '28px' }}>
          Post to your personal social channels using the provided assets, suggested copy, and URLs. Please keep the following best practices in mind:
        </p>

        {/* ── Step tracker ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {BEST_PRACTICES.map(({ label, body }, i) => (
            <div key={label} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
              {/* line connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#0f62fe', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '13px', flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                {i < BEST_PRACTICES.length - 1 && (
                  <div style={{ width: '2px', flex: 1, minHeight: '24px', background: '#e0e0e0', margin: '4px 0' }} />
                )}
              </div>
              {/* content */}
              <div style={{ paddingBottom: i < BEST_PRACTICES.length - 1 ? '20px' : 0, paddingTop: '4px' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '14px', color: '#161616' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#525252', lineHeight: '1.6' }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default SocialTilesTab;

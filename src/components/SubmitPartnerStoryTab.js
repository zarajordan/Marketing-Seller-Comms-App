import React, { useState } from 'react';

const CONTENT_TYPES = ['Video', 'Case Study', 'Blog', 'Infographic', 'Podcast', 'Webinar'];

export default function SubmitPartnerStoryTab({ onAddStoryRequest }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onAddStoryRequest) {
      try {
        await onAddStoryRequest({ ...form });
        setSubmitted(true);
      } catch (err) {
        alert('Failed to submit request: ' + (err?.message || err));
      }
    } else {
      setSubmitted(true);
    }
  };
  const handleClear = () => {
    setForm({ clientName: '', partnerName: '', yourName: '', yourEmail: '', phone: '', ibmTeam: '', contentTypes: [], industry: '', overview: '', challenge: '', outcomes: '', notes: '' });
    setSubmitted(false);
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
  const sectionTitle = (t) => <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>{t}</h3>;
  const label = (t, req) => <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>{t}{req ? ' *' : ''}</label>;

  if (submitted) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Request Submitted!</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Thank you — the IBM Partner Stories team will be in touch.</p>
        <button onClick={handleClear} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Submit Another</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700 }}>📝 Submit a Story</h2>
        </div>
        <span style={{ fontSize: '13px', color: '#6b7280', textAlign: 'right', maxWidth: '360px' }}>Fill out the form below to request a new story</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

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

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <button type="button" onClick={handleClear} style={{ padding: '10px 22px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Clear Form</button>
          <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Submit Request</button>
        </div>
      </form>
    </div>
  );
}

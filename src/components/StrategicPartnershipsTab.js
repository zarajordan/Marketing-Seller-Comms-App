import React, { useState, useEffect, useCallback } from 'react';
import {
  Accordion,
  AccordionItem,
  Button,
  Modal,
  TextInput,
  Tag,
  InlineLoading,
  Search,
} from '@carbon/react';
import { Add, Edit, Download, Launch, Email, Phone, TrashCan } from '@carbon/icons-react';
import { toast } from 'react-toastify';
import SpAchievementsCarousel from './sp/SpAchievementsCarousel';
import SpPartnerSection from './sp/SpPartnerSection';
import {
  listSpPartners,
  listSpBusinessResources,
  createSpBusinessResource,
  updateSpBusinessResource,
  deleteSpBusinessResource,
  uploadSpImage,
} from '../lib/supabaseData';

// Reserved resource_type keys
const IBM_BLE_DOC_TYPE = 'ibm-business-led-events-doc';
const PAGE_CONTACT_TYPE = 'sp-page-contact';

// ── Page Owner Callout ────────────────────────────────────────
function PageOwnerCallout({ resources, isAdmin, onReload }) {
  const record = resources.find((r) => r.resource_type === PAGE_CONTACT_TYPE) || null;

  // Storage mapping (all text-safe columns):
  //   title       → name
  //   description → "job title||phone||photoUrl"  (pipe-separated)
  //   file_url    → email
  const [storedRole = '', storedPhone = '', storedPhoto = ''] = (record?.description || '').split('||');
  const contact = {
    name:  record?.title    || 'Yasmin Hardaker',
    role:  storedRole       || 'UKI Strategic Partnerships Lead, IBM',
    email: record?.file_url || 'yasmin.hardaker@ibm.com',
    phone: storedPhone      || '+44 7700 000000',
    photo: storedPhoto      || '',
  };

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', photo: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const photoInputRef = React.useRef(null);

  const openEdit = () => {
    setForm({ name: contact.name, role: contact.role, email: contact.email, phone: contact.phone, photo: contact.photo });
    setPhotoFile(null);
    setPhotoPreview(contact.photo || '');
    setShowModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let photoUrl = form.photo;
      if (photoFile) photoUrl = await uploadSpImage(photoFile, 'sp-page-contact');
      const fields = {
        title: form.name,
        description: `${form.role}||${form.phone}||${photoUrl}`,
        file_url: form.email,
        resource_type: PAGE_CONTACT_TYPE,
      };
      if (record) {
        await updateSpBusinessResource(record.id, fields);
      } else {
        await createSpBusinessResource(fields);
      }
      toast.success('Page contact updated');
      setShowModal(false);
      onReload();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ background: '#13161f', color: '#fff', borderRadius: 8, padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', borderBottom: '3px solid #0f62fe' }}>
        {/* Avatar */}
        {contact.photo ? (
          <img src={contact.photo} alt={contact.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>👤</div>
        )}
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 0.1rem', fontWeight: 700, fontSize: '1rem' }}>{contact.name}</p>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>{contact.role}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href={`mailto:${contact.email}`} style={{ color: '#78a9ff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
              <Email size={14} /> {contact.email}
            </a>
            {contact.phone && (
              <a href={`tel:${contact.phone}`} style={{ color: '#78a9ff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                <Phone size={14} /> {contact.phone}
              </a>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Tag type="blue" size="md">Page Contact</Tag>
          <button
            onClick={openEdit}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, color: '#78a9ff', cursor: 'pointer', fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}
          >
            ✏️ Edit
          </button>
        </div>
      </div>

      <Modal
        open={showModal}
        modalHeading="Edit Page Contact"
        primaryButtonText={saving ? 'Saving…' : 'Save'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSave}
        onRequestClose={() => setShowModal(false)}
        onSecondarySubmit={() => setShowModal(false)}
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
          {/* Photo upload */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>Profile Photo</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
              )}
              <div>
                <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                <button type="button" onClick={() => photoInputRef.current && photoInputRef.current.click()} style={{ background: '#e0e0e0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                  {photoPreview ? 'Change photo' : 'Upload photo'}
                </button>
                {photoPreview && (
                  <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(''); setForm((f) => ({ ...f, photo: '' })); }} style={{ background: 'none', border: 'none', color: '#da1e28', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <TextInput id="pc-name"  labelText="Name"      value={form.name}  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <TextInput id="pc-role"  labelText="Job Title" value={form.role}  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
          <TextInput id="pc-email" labelText="Email"     value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <TextInput id="pc-phone" labelText="Phone"     value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
      </Modal>
    </>
  );
}

// ── Business Resources Section ────────────────────────────────
// ── IBM Business Led Events document widget ───────────────────
function IbmBusinessLedEventsWidget({ resources, isAdmin, onReload }) {
  const docRecord = resources.find((r) => r.resource_type === IBM_BLE_DOC_TYPE) || null;

  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleDelete = async () => {
    try {
      await deleteSpBusinessResource(docRecord.id);
      toast.success('Document removed');
      setConfirmDelete(false);
      onReload();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileUrl = await uploadSpImage(file, 'sp-ble-doc');
      const fields = {
        title: 'IBM Business Led Events',
        resource_type: IBM_BLE_DOC_TYPE,
        description: 'Guide to non-marketing led events',
        file_url: fileUrl,
        resource_date: new Date().toISOString().split('T')[0],
      };
      if (docRecord) {
        await updateSpBusinessResource(docRecord.id, fields);
      } else {
        await createSpBusinessResource(fields);
      }
      toast.success('Document updated successfully');
      onReload();
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      // reset so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isPdf = docRecord?.file_url && docRecord.file_url.toLowerCase().includes('.pdf');

  return (
    <div style={{ marginBottom: '2rem', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
      {/* Single hidden file input — always mounted when admin so the ref is stable */}
      {isAdmin && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}

      {/* Widget header */}
      <div style={{ background: '#13161f', color: '#fff', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', borderBottom: '3px solid #0f62fe' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>IBM Business Led Events</p>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)' }}>
              Guide to non-marketing led events
              {docRecord?.resource_date && ` · Last updated ${new Date(docRecord.resource_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {docRecord?.file_url && (
            <Button kind="tertiary" size="sm" renderIcon={Download} href={docRecord.file_url} target="_blank" rel="noreferrer">
              Open / Download
            </Button>
          )}
          {isAdmin && (
            <Button
              kind="ghost"
              size="sm"
              renderIcon={uploading ? undefined : Add}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={uploading}
              style={{ color: '#78a9ff' }}
            >
              {uploading ? 'Uploading…' : docRecord ? 'Replace Document' : 'Upload Document'}
            </Button>
          )}
          {isAdmin && docRecord && !confirmDelete && (
            <Button
              kind="danger--ghost"
              size="sm"
              renderIcon={TrashCan}
              onClick={() => setConfirmDelete(true)}
              style={{ color: '#ffb3b8' }}
            >
              Remove
            </Button>
          )}
          {isAdmin && confirmDelete && (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#ffb3b8' }}>Remove document?</span>
              <Button kind="danger" size="sm" onClick={handleDelete}>Yes, remove</Button>
              <Button kind="ghost" size="sm" onClick={() => setConfirmDelete(false)} style={{ color: '#fff' }}>Cancel</Button>
            </div>
          )}
        </div>
      </div>

      {/* Document preview / empty state */}
      {docRecord?.file_url ? (
        isPdf ? (
          <iframe
            src={docRecord.file_url}
            title="IBM Business Led Events"
            style={{ width: '100%', height: 640, border: 'none', display: 'block', background: '#f4f4f4' }}
          />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', background: '#f4f4f4' }}>
            <p style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '1rem' }}>
              Preview is only available for PDF files. Click <strong>Open / Download</strong> to view this document.
            </p>
            <Button kind="primary" size="sm" renderIcon={Download} href={docRecord.file_url} target="_blank" rel="noreferrer">
              Open Document
            </Button>
          </div>
        )
      ) : (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#f4f4f4' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No document uploaded yet</p>
          <p style={{ fontSize: '0.875rem', color: '#525252', marginBottom: isAdmin ? '1.25rem' : 0 }}>
            The IBM Business Led Events guide will appear here once uploaded.
          </p>
          {isAdmin && (
            <Button
              kind="primary"
              size="sm"
              renderIcon={Add}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Upload Document'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Partner Cards Constants & Components ──────────────────────
const PARTNER_BLURBS = {
  aws: "With AWS and IBM, you can unleash the transformative value of generative AI in your business with speed, scale and trust.",
  adobe: "IBM and Adobe work together to unite strategy, data, technology and design, helping clients deliver trusted, personalized customer experiences at scale.",
  google: "The IBM-Google Cloud partnership is a strategic collaboration focused on helping clients accelerate enterprise hybrid cloud adoption, AI-driven transformation and modernization of critical workloads.",
  microsoft: "IBM and Microsoft are providing clients joint solutions that can improve costs, productivity and resilience by accelerating their hybrid cloud and AI journeys.",
  oracle: "Building on our 40 years of partnership together focused on IBM Consulting, IBM and Oracle deliver Agentic and generative AI and flexible hybrid cloud options to help clients accelerate growth, innovation, and productivity.",
  salesforce: "Make smarter decisions faster with IBM and Salesforce. IBM Consulting® and Salesforce work with our shared clients to help accelerate business transformations with generative AI.",
  sap: "IBM is a full lifecycle partner that delivers SAP and IBM® solutions end-to-end, using deep expertise in consulting and technology including AI, cloud, automation and security.",
  samsung: "IBM and Samsung collaborate on ground-breaking research and co-creates open, innovative and secure AI-powered solutions—unifying the cloud, network and humans in ways previously unimaginable.",
  'palo-alto': "IBM Security and Palo Alto Networks combine platform leadership with security managed services to deliver comprehensive cybersecurity and threat detection."
};

const PARTNER_LINKS = {
  aws: [
    { label: "Explore IBM Consulting for AWS", url: "https://www.ibm.com/consulting/aws" }
  ],
  adobe: [
    { label: "Explore IBM Consulting for Adobe", url: "https://www.ibm.com/consulting/adobe" }
  ],
  google: [
    { label: "Explore IBM Consulting for Google Cloud", url: "https://www.ibm.com/consulting/google" }
  ],
  microsoft: [
    { label: "Explore IBM Consulting for Microsoft", url: "https://www.ibm.com/consulting/microsoft" }
  ],
  oracle: [
    { label: "Explore IBM Consulting for Oracle", url: "https://www.ibm.com/consulting/oracle" }
  ],
  salesforce: [
    { label: "Explore IBM Consulting for Salesforce", url: "https://www.ibm.com/consulting/salesforce" }
  ],
  sap: [
    { label: "Explore IBM Consulting for SAP", url: "https://www.ibm.com/consulting/sap" }
  ],
  'palo-alto': [
    { label: "Explore IBM Consulting for Palo Alto Networks", url: "https://www.ibm.com/consulting/palo-alto" }
  ]
};

function PartnerCard({ partner, isSelected, onClick, isAdmin }) {
  const [hovered, setHovered] = useState(false);
  const blurb = PARTNER_BLURBS[partner.slug] || (partner.overview_html ? partner.overview_html.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : 'IBM strategic partnerships details and resources.');
  const links = PARTNER_LINKS[partner.slug] || [
    { label: `Explore IBM Consulting for ${partner.display_name}`, url: `https://www.ibm.com/consulting/${partner.slug}` }
  ];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        border: isSelected ? '2px solid #0f62fe' : hovered ? '2px solid #0f62fe' : '1px solid #e0e0e0',
        borderRadius: 8,
        padding: '2rem 1.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isSelected ? '0 4px 16px rgba(15, 98, 254, 0.12)' : hovered ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '380px'
      }}
    >
      {/* Partner Logo */}
      <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', padding: '0.25rem' }}>
        {partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={partner.display_name}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#161616' }}>{partner.display_name}</span>
        )}
      </div>

      {/* Approval Tag */}
      {partner.logo_lockup_status === 'approved' && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <Tag type="green" size="sm">Approved</Tag>
        </div>
      )}

      {/* Description / Blurb */}
      <p style={{
        fontSize: '0.875rem',
        color: '#525252',
        lineHeight: '1.5',
        margin: '0 0 1.5rem 0',
        textAlign: 'left',
        flexGrow: 1
      }}>
        {blurb}
      </p>

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {links.map((lnk, idx) => (
          <a
            key={idx}
            href={lnk.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Prevent card click trigger
            style={{
              color: '#0f62fe',
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 500
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            {lnk.label} <span style={{ fontSize: '0.9rem' }}>→</span>
          </a>
        ))}
      </div>

      {/* Ribbon / Bottom Expand Bar */}
      <div
        style={{
          margin: 'auto -1.5rem -1.5rem -1.5rem',
          background: isSelected ? '#0f62fe' : hovered ? '#e8f0fe' : '#f4f4f4',
          color: isSelected ? '#ffffff' : '#161616',
          padding: '0.75rem 1rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          fontWeight: 600,
          borderTop: '1px solid #e0e0e0',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem'
        }}
      >
        {isSelected ? 'Workspace Open ↗' : 'Open Partner Workspace ↗'}
      </div>
    </div>
  );
}

// ── Main Tab Component ────────────────────────────────────────
export default function StrategicPartnershipsTab({ currentUser }) {
  const [partners, setPartners] = useState([]);
  const [businessResources, setBusinessResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartnerSlug, setSelectedPartnerSlug] = useState(null);
  const [loadedPartners, setLoadedPartners] = useState({});

  const isAdmin = currentUser?.role === 'admin-manager';

  const loadRoot = useCallback(async () => {
    try {
      const [partnersData, resourcesData] = await Promise.all([
        listSpPartners(),
        listSpBusinessResources(),
      ]);
      setPartners(partnersData.filter((p) => p.is_active));
      setBusinessResources(resourcesData);
    } catch (err) {
      toast.error('Failed to load partnerships data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRoot(); }, [loadRoot]);

  // When searching, auto-expand first matching partner so results are visible
  useEffect(() => {
    if (searchTerm) {
      const match = partners.find(p =>
        p.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (PARTNER_BLURBS[p.slug] || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (match) {
        setSelectedPartnerSlug(match.slug);
        setLoadedPartners(lp => ({ ...lp, [match.slug]: true }));
      }
    }
  }, [searchTerm, partners]);

  const handlePartnerSelect = (slug) => {
    setSelectedPartnerSlug((prev) => {
      const isCollapsing = prev === slug;
      if (!isCollapsing) {
        // Mark partner as needing data load
        setLoadedPartners((lp) => ({ ...lp, [slug]: true }));
      }
      return isCollapsing ? null : slug;
    });
  };

  const handlePartnerUpdated = useCallback(() => {
    loadRoot();
  }, [loadRoot]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <InlineLoading description="Loading Strategic Partnerships…" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Tab header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem' }}>UKI Strategic Partnerships</h1>
        <p style={{ color: '#525252', fontSize: '0.9rem', margin: 0 }}>Partner intelligence, resources, activities, and assets for the IBM UKI Strategic Partnerships team.</p>
      </div>

      {/* Page owner callout */}
      <PageOwnerCallout resources={businessResources} isAdmin={isAdmin} onReload={loadRoot} />

      {/* Achievements carousel */}
      <SpAchievementsCarousel isAdmin={isAdmin} currentUser={currentUser} partners={partners} />

      {/* Search bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Search
          id="sp-search"
          labelText="Search partnerships content"
          placeholder="Search across activities, stories, assets, contacts…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          size="lg"
        />
        {searchTerm && (
          <p style={{ fontSize: '0.8rem', color: '#525252', marginTop: '0.5rem' }}>
            Searching for "<strong>{searchTerm}</strong>" — click any partner card below to view matching details
          </p>
        )}
      </div>

      {/* Partner grid */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#161616' }}>Partner Sections</h2>
          <span style={{ fontSize: '0.8rem', color: '#525252' }}>{partners.length} strategic partners</span>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {partners.map((partner) => (
            <PartnerCard
              key={partner.slug}
              partner={partner}
              isSelected={selectedPartnerSlug === partner.slug}
              onClick={() => handlePartnerSelect(partner.slug)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>

      {/* Expanded detail modal for selected partner */}
      <Modal
        open={!!selectedPartnerSlug}
        modalHeading={`${partners.find(p => p.slug === selectedPartnerSlug)?.display_name || ''} Partner Workspace`}
        onRequestClose={() => setSelectedPartnerSlug(null)}
        size="lg"
        passiveModal
      >
        <div style={{ padding: '0.5rem 0 2rem 0' }}>
          {selectedPartnerSlug && partners.filter(p => p.slug === selectedPartnerSlug).map(partner => (
            <SpPartnerSection
              key={partner.slug}
              partner={partner}
              isAdmin={isAdmin}
              searchTerm={searchTerm}
              onPartnerUpdated={handlePartnerUpdated}
            />
          ))}
        </div>
      </Modal>

      {/* IBM Business Led Events document widget */}
      <IbmBusinessLedEventsWidget
        resources={businessResources}
        isAdmin={isAdmin}
        onReload={loadRoot}
      />
    </div>
  );
}

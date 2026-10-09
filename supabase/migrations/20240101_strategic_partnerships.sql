-- ============================================================
-- UKI Strategic Partnerships — Supabase Migration
-- Creates all tables and seeds placeholder content
-- ============================================================

-- ── sp_achievements ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sp_achievements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  partner_slug     text NOT NULL,
  hero_image_url   text,
  achievement_date date,
  short_overview   text,
  full_summary     text,
  links            jsonb DEFAULT '[]',
  extra_images     jsonb DEFAULT '[]',
  is_featured      boolean DEFAULT false,
  status           text NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','archived')),
  submitted_by_email text,
  display_order    integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── sp_partners ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sp_partners (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  text UNIQUE NOT NULL,
  display_name          text NOT NULL,
  logo_url              text,
  overview_html         text,
  logo_lockup_status    text DEFAULT 'not-approved' CHECK (logo_lockup_status IN ('approved','not-approved')),
  logo_lockup_guidance  text,
  display_order         integer DEFAULT 0,
  is_active             boolean DEFAULT true,
  updated_at            timestamptz DEFAULT now()
);

-- ── sp_contacts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sp_contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug  text NOT NULL,
  name          text NOT NULL,
  job_title     text,
  photo_url     text,
  email         text,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- ── sp_team_members ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sp_team_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug  text NOT NULL,
  name          text NOT NULL,
  role          text,
  contact_link  text,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- ── sp_activities ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sp_activities (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug     text NOT NULL,
  title            text NOT NULL,
  activity_type    text DEFAULT 'Event' CHECK (activity_type IN ('Event','Webinar','Workshop','Other')),
  description      text,
  activity_date    date,
  registration_url text,
  recording_url    text,
  display_order    integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── sp_stories ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sp_stories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug  text NOT NULL,
  title         text NOT NULL,
  content_type  text DEFAULT 'Blog' CHECK (content_type IN ('Case Study','Blog','Video','Podcast','Infographic','Webinar')),
  thumbnail_url text,
  description   text,
  story_date    date,
  external_url  text,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ── sp_assets ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sp_assets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug  text NOT NULL,
  title         text NOT NULL,
  asset_type    text DEFAULT 'PDF' CHECK (asset_type IN ('PDF','Deck','Link','IBV','Case Study','Template','Other')),
  file_url      text,
  description   text,
  asset_date    date,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ── sp_business_resources ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS sp_business_resources (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  resource_type text DEFAULT 'Other' CHECK (resource_type IN ('Event Planning','Comms','Branding','Measurement','Approval','Other')),
  file_url      text,
  description   text,
  resource_date date,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ── sp_social_kits ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sp_social_kits (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug        text NOT NULL,
  title               text NOT NULL,
  post_copy           text,
  graphic_url         text,
  downloadable_assets jsonb DEFAULT '[]',
  display_order       integer DEFAULT 0,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- ── Partners ──────────────────────────────────────────────────
INSERT INTO sp_partners (slug, display_name, overview_html, logo_lockup_status, logo_lockup_guidance, display_order, is_active) VALUES
(
  'aws',
  'Amazon Web Services (AWS)',
  '<p><strong>Strategic Focus:</strong> Cloud infrastructure, AI/ML services, and hybrid cloud migration. AWS is a Tier 1 IBM strategic partner for the UKI region.</p><p><strong>UKI Priorities:</strong> Financial services modernisation, public sector cloud adoption, and AI-led transformation across enterprise accounts.</p><p><strong>Value Proposition:</strong> Combined IBM consulting expertise with AWS platform scale — delivering faster time-to-value for clients migrating workloads and building AI-powered applications.</p><p><strong>Key Solutions:</strong> IBM Cloud Pak on AWS, Watson on AWS, IBM Consulting AWS practice, SAP on AWS.</p>',
  'approved',
  '<p>IBM and AWS logo lock-up usage is approved for joint go-to-market materials. Please use the co-branded assets provided in the Social Kits section. Ensure the IBM logo appears at equal size or larger than the AWS logo.</p>',
  1,
  true
),
(
  'microsoft',
  'Microsoft',
  '<p><strong>Strategic Focus:</strong> Hybrid cloud and AI with Azure, enterprise productivity with Microsoft 365, and business applications with Dynamics 365.</p><p><strong>UKI Priorities:</strong> Azure migration for regulated industries, Microsoft 365 + IBM Consulting managed services, and Copilot-led AI transformation.</p><p><strong>Value Proposition:</strong> IBM brings deep industry expertise and change management capability to accelerate Microsoft platform adoption at scale.</p><p><strong>Key Solutions:</strong> IBM Consulting Microsoft practice, Azure hybrid cloud with IBM Z, Microsoft 365 managed services, Dynamics 365 implementation.</p>',
  'approved',
  '<p>Microsoft partnership logo lock-up is approved. Use the Microsoft partner badge alongside IBM logo in all joint materials. Refer to the Microsoft Partner Network branding guidelines for correct usage.</p>',
  2,
  true
),
(
  'sap',
  'SAP',
  '<p><strong>Strategic Focus:</strong> ERP modernisation, SAP S/4HANA migration, and intelligent enterprise transformation.</p><p><strong>UKI Priorities:</strong> RISE with SAP programmes, S/4HANA migration for manufacturing and retail, and SAP on IBM Power and IBM Cloud.</p><p><strong>Value Proposition:</strong> IBM is the leading global systems integrator for SAP, with unmatched delivery capability and IBM Power infrastructure for performance-critical SAP workloads.</p><p><strong>Key Solutions:</strong> RISE with SAP on IBM Cloud, SAP on IBM Power, IBM Consulting SAP practice, SAP BTP integration services.</p>',
  'approved',
  '<p>SAP and IBM co-branding is approved for joint customer-facing materials. Use the SAP partner badge alongside the IBM logo. Both logos must appear on a white or light background.</p>',
  3,
  true
),
(
  'salesforce',
  'Salesforce',
  '<p><strong>Strategic Focus:</strong> CRM transformation, customer experience, and AI-powered sales and service with Salesforce Einstein and Data Cloud.</p><p><strong>UKI Priorities:</strong> Financial services and telecoms CRM modernisation, Salesforce Data Cloud implementations, and Einstein AI adoption.</p><p><strong>Value Proposition:</strong> IBM Consulting brings industry process expertise and data integration capability to Salesforce implementations, accelerating time-to-value.</p><p><strong>Key Solutions:</strong> IBM Consulting Salesforce practice, Salesforce Financial Services Cloud, Marketing Cloud with IBM data assets, Einstein Analytics.</p>',
  'not-approved',
  '<p>Salesforce co-branding for this programme is currently under review. Please do not use the Salesforce logo in IBM-branded materials without written approval. Contact the partnerships team for the latest guidance.</p>',
  4,
  true
),
(
  'google',
  'Google Cloud',
  '<p><strong>Strategic Focus:</strong> Data and AI on Google Cloud, cloud-native application development, and workspace productivity.</p><p><strong>UKI Priorities:</strong> BigQuery and Vertex AI implementations, Google Workspace managed services, and cloud-native modernisation for digital-first organisations.</p><p><strong>Value Proposition:</strong> IBM Consulting combines Google Cloud technical expertise with IBM''s deep industry knowledge and security-first approach to cloud transformation.</p><p><strong>Key Solutions:</strong> IBM Consulting Google Cloud practice, Vertex AI with Watson, BigQuery data platforms, Google Workspace + IBM Security.</p>',
  'approved',
  '<p>Google Cloud partnership logo lock-up is approved for joint go-to-market materials. Use the Google Cloud partner badge. Ensure both logos are equally prominent and on a white background.</p>',
  5,
  true
),
(
  'adobe',
  'Adobe',
  '<p><strong>Strategic Focus:</strong> Digital experience, content supply chain, and customer data platforms with Adobe Experience Cloud.</p><p><strong>UKI Priorities:</strong> Adobe Experience Manager implementations, Real-Time CDP deployments, and content operations transformation for large enterprises.</p><p><strong>Value Proposition:</strong> IBM Consulting''s iX (experience) practice delivers end-to-end Adobe implementations with industry-specific content strategy and technical integration expertise.</p><p><strong>Key Solutions:</strong> IBM iX Adobe practice, Adobe Experience Manager, Adobe Real-Time CDP, Adobe Analytics implementation.</p>',
  'approved',
  '<p>Adobe partnership logo lock-up is approved. Use the Adobe Solution Partner badge alongside the IBM logo. Refer to Adobe''s brand guidelines for logo sizing and placement rules.</p>',
  6,
  true
),
(
  'palo-alto',
  'Palo Alto Networks',
  '<p><strong>Strategic Focus:</strong> Cybersecurity transformation, SASE (Secure Access Service Edge), and AI-powered threat detection with Cortex.</p><p><strong>UKI Priorities:</strong> Zero Trust architecture implementations, SOC modernisation, and Prisma Cloud security for hybrid environments.</p><p><strong>Value Proposition:</strong> IBM Security''s consulting and managed services capability combined with Palo Alto Networks'' platform leadership delivers comprehensive security transformation.</p><p><strong>Key Solutions:</strong> IBM Security + Palo Alto Networks joint SOC, Prisma Cloud with IBM Cloud, Cortex XSIAM managed detection and response, SASE architecture services.</p>',
  'approved',
  '<p>Palo Alto Networks co-branding is approved for joint security-focused materials. Use the MSSP/partner badge as specified in the partner portal branding kit.</p>',
  7,
  true
),
(
  'oracle',
  'Oracle',
  '<p><strong>Strategic Focus:</strong> Database modernisation, Oracle Cloud Infrastructure (OCI), and enterprise applications including Oracle Fusion and EBS.</p><p><strong>UKI Priorities:</strong> Oracle to OCI migration programmes, Oracle Fusion ERP implementations, and Autonomous Database adoption in financial services and public sector.</p><p><strong>Value Proposition:</strong> IBM brings decades of Oracle database and applications expertise, combined with IBM Power and mainframe integration capability for the most demanding Oracle workloads.</p><p><strong>Key Solutions:</strong> Oracle on IBM Power, Oracle Cloud migration with IBM Consulting, Oracle Fusion implementation, Autonomous Database advisory.</p>',
  'not-approved',
  '<p>Oracle co-branding guidance is currently being updated. Please contact the partnerships team before using Oracle logos in any IBM materials.</p>',
  8,
  true
);

-- ── Achievements ──────────────────────────────────────────────
INSERT INTO sp_achievements (title, partner_slug, achievement_date, short_overview, full_summary, is_featured, status, display_order) VALUES
(
  'IBM & AWS Win £42M Financial Services Cloud Migration',
  'aws',
  '2024-09-15',
  'IBM Consulting and AWS secured a landmark £42M engagement to migrate a top-5 UK bank''s core banking platform to AWS, delivering a 40% reduction in infrastructure costs.',
  '<p>IBM Consulting and Amazon Web Services have secured a landmark £42M engagement with one of the UK''s top-5 retail banks to migrate its core banking platform to AWS cloud infrastructure.</p><h3>Key Outcomes</h3><ul><li>40% reduction in infrastructure operating costs over 3 years</li><li>60% improvement in deployment frequency</li><li>Full regulatory compliance with FCA cloud guidance</li></ul><p>The programme, delivered by a joint IBM-AWS team of 120 consultants and engineers, will run over 18 months and represents the largest core banking cloud migration in UK financial services history.</p>',
  true,
  'active',
  1
),
(
  'Microsoft Copilot Pilot Drives 28% Productivity Gain at FTSE 100 Retailer',
  'microsoft',
  '2024-10-01',
  'A joint IBM-Microsoft pilot of Microsoft 365 Copilot across 5,000 employees at a FTSE 100 retailer achieved a 28% measured productivity improvement in knowledge worker tasks.',
  '<p>IBM Consulting partnered with Microsoft to deliver a structured Microsoft 365 Copilot pilot across 5,000 employees at a leading FTSE 100 UK retailer.</p><h3>Programme Highlights</h3><ul><li>28% measured improvement in knowledge worker task completion time</li><li>94% user adoption rate after 90-day rollout</li><li>ROI of 340% projected over 3 years</li></ul><p>The programme included IBM''s proprietary AI readiness assessment, change management framework, and custom Copilot prompt libraries tailored to retail operations.</p>',
  true,
  'active',
  2
),
(
  'IBM & SAP Deliver RISE with SAP Programme for UK Manufacturer',
  'sap',
  '2024-08-20',
  'IBM Consulting delivered a RISE with SAP S/4HANA transformation for a major UK manufacturer in under 12 months, 3 months ahead of schedule.',
  '<p>IBM Consulting completed a RISE with SAP S/4HANA transformation for a major UK manufacturing group, delivering the full programme 3 months ahead of schedule and 8% under budget.</p><h3>Delivery Highlights</h3><ul><li>Full migration of 6 legacy ERP systems to a single SAP S/4HANA instance</li><li>12-month end-to-end delivery (industry average: 18–24 months)</li><li>Zero production downtime during cutover weekend</li><li>35% reduction in month-end close cycle</li></ul>',
  false,
  'active',
  3
),
(
  'Palo Alto Networks & IBM Security Win Government SOC Contract',
  'palo-alto',
  '2024-11-05',
  'IBM Security and Palo Alto Networks jointly won a £18M government Security Operations Centre (SOC) modernisation contract, deploying Cortex XSIAM with IBM managed services.',
  '<p>IBM Security and Palo Alto Networks have jointly secured an £18M contract to modernise a UK central government department''s Security Operations Centre, deploying Cortex XSIAM as the core SIEM/SOAR platform with IBM providing 24/7 managed detection and response services.</p><h3>Contract Scope</h3><ul><li>Cortex XSIAM deployment replacing 4 legacy security tools</li><li>IBM 24/7 MDR service wrapping the Palo Alto platform</li><li>Full DSPF and Cyber Essentials Plus compliance</li><li>60-day initial deployment timeline</li></ul>',
  false,
  'active',
  4
);

-- ── Contacts ──────────────────────────────────────────────────
INSERT INTO sp_contacts (partner_slug, name, job_title, email, display_order) VALUES
('aws', 'Sarah Mitchell', 'AWS Alliance Director', 'sarah.mitchell@example.com', 1),
('aws', 'James Thornton', 'AWS Solutions Architect', 'james.thornton@example.com', 2),
('microsoft', 'Emily Roberts', 'Microsoft Partnership Lead', 'emily.roberts@example.com', 1),
('microsoft', 'David Chen', 'Azure Technical Specialist', 'david.chen@example.com', 2),
('sap', 'Priya Patel', 'SAP Alliance Manager', 'priya.patel@example.com', 1),
('salesforce', 'Mark Johnson', 'Salesforce Partnership Lead', 'mark.johnson@example.com', 1),
('google', 'Anna Williams', 'Google Cloud Alliance Director', 'anna.williams@example.com', 1),
('adobe', 'Tom Harris', 'Adobe iX Partnership Lead', 'tom.harris@example.com', 1),
('palo-alto', 'Rachel Kim', 'Palo Alto Security Alliance Manager', 'rachel.kim@example.com', 1),
('oracle', 'Michael Brown', 'Oracle Alliance Director', 'michael.brown@example.com', 1);

-- ── Team Members ──────────────────────────────────────────────
INSERT INTO sp_team_members (partner_slug, name, role, contact_link, display_order) VALUES
('aws', 'Yasmin Hardaker', 'UKI Partnerships Lead', 'mailto:yasmin.hardaker@ibm.com', 1),
('aws', 'Chris Sullivan', 'AWS Practice Lead', 'mailto:chris.sullivan@ibm.com', 2),
('microsoft', 'Yasmin Hardaker', 'UKI Partnerships Lead', 'mailto:yasmin.hardaker@ibm.com', 1),
('microsoft', 'Fiona Clarke', 'Microsoft Alliance Manager', 'mailto:fiona.clarke@ibm.com', 2),
('sap', 'Yasmin Hardaker', 'UKI Partnerships Lead', 'mailto:yasmin.hardaker@ibm.com', 1),
('sap', 'Ravi Sharma', 'SAP Practice Director', 'mailto:ravi.sharma@ibm.com', 2),
('salesforce', 'Yasmin Hardaker', 'UKI Partnerships Lead', 'mailto:yasmin.hardaker@ibm.com', 1),
('google', 'Yasmin Hardaker', 'UKI Partnerships Lead', 'mailto:yasmin.hardaker@ibm.com', 1),
('adobe', 'Yasmin Hardaker', 'UKI Partnerships Lead', 'mailto:yasmin.hardaker@ibm.com', 1),
('palo-alto', 'Yasmin Hardaker', 'UKI Partnerships Lead', 'mailto:yasmin.hardaker@ibm.com', 1),
('oracle', 'Yasmin Hardaker', 'UKI Partnerships Lead', 'mailto:yasmin.hardaker@ibm.com', 1);

-- ── Activities ────────────────────────────────────────────────
INSERT INTO sp_activities (partner_slug, title, activity_type, description, activity_date, registration_url, display_order) VALUES
('aws', 'AWS re:Invent UKI Briefing', 'Webinar', 'Join IBM and AWS for a UKI-focused debrief on the key announcements from AWS re:Invent, with a focus on what matters most for IBM clients.', '2024-12-18', 'https://example.com/register', 1),
('aws', 'Financial Services Cloud Migration Workshop', 'Workshop', 'Hands-on workshop for IBM sellers on positioning and scoping AWS cloud migration opportunities in financial services.', '2025-01-22', 'https://example.com/register', 2),
('microsoft', 'Microsoft AI Tour — IBM Showcase', 'Event', 'IBM will be featured at the Microsoft AI Tour London event, demonstrating joint AI solutions built on Azure and IBM watsonx.', '2025-02-05', 'https://example.com/register', 1),
('microsoft', 'Copilot for IBM Sellers — Enablement Webinar', 'Webinar', 'Learn how to position Microsoft 365 Copilot in IBM client conversations, with demo scripts and objection handling.', '2024-12-10', 'https://example.com/register', 2),
('sap', 'RISE with SAP Seller Enablement', 'Webinar', 'Deep-dive enablement session for IBM sellers on the RISE with SAP offering, pricing models, and competitive positioning.', '2025-01-15', 'https://example.com/register', 1),
('salesforce', 'Salesforce World Tour London — IBM Presence', 'Event', 'IBM will have a dedicated presence at Salesforce World Tour London. Register to attend and join the IBM client dinner.', '2025-03-12', 'https://example.com/register', 1),
('google', 'Google Cloud Next UKI Preview', 'Webinar', 'Preview session covering IBM and Google Cloud joint announcements ahead of Google Cloud Next 2025.', '2025-03-01', 'https://example.com/register', 1),
('palo-alto', 'Zero Trust Architecture Workshop', 'Workshop', 'IBM Security and Palo Alto Networks co-deliver a Zero Trust architecture workshop for IBM sellers and client executives.', '2025-01-28', 'https://example.com/register', 1);

-- ── Stories ───────────────────────────────────────────────────
INSERT INTO sp_stories (partner_slug, title, content_type, description, story_date, external_url, display_order) VALUES
('aws', 'How Lloyds Banking Group Cut Cloud Costs 40% with IBM and AWS', 'Case Study', 'Lloyds Banking Group partnered with IBM Consulting and AWS to migrate 200 applications to cloud, achieving significant cost savings and improved resilience.', '2024-09-01', 'https://ibm.com', 1),
('aws', 'The IBM-AWS Partnership: Building the Future of Hybrid Cloud', 'Blog', 'An overview of how IBM and AWS are working together to help enterprises navigate the complexities of hybrid cloud transformation.', '2024-10-15', 'https://ibm.com', 2),
('microsoft', 'Manufacturer Achieves 35% Efficiency Gain with Microsoft 365 Copilot and IBM', 'Case Study', 'A UK manufacturing group deployed Microsoft 365 Copilot across 8,000 employees with IBM as the implementation partner, driving measurable productivity gains.', '2024-10-01', 'https://ibm.com', 1),
('sap', 'RISE with SAP: IBM Delivers Fastest S/4HANA Migration in UK Manufacturing', 'Case Study', 'IBM Consulting delivered a 12-month RISE with SAP programme for a major UK manufacturer, setting a new speed benchmark for SAP S/4HANA migration.', '2024-08-15', 'https://ibm.com', 1),
('palo-alto', 'Securing Government Cloud: IBM and Palo Alto Networks Modernise UK SOC', 'Case Study', 'How IBM Security and Palo Alto Networks jointly transformed a UK government department''s security operations, reducing threat detection time by 70%.', '2024-11-01', 'https://ibm.com', 1),
('google', 'Building AI-Powered Analytics at Scale with IBM and Google Cloud', 'Blog', 'IBM Consulting and Google Cloud share insights on delivering enterprise AI analytics programmes using Vertex AI and IBM watsonx.', '2024-09-20', 'https://ibm.com', 1);

-- ── Assets ────────────────────────────────────────────────────
INSERT INTO sp_assets (partner_slug, title, asset_type, description, asset_date, display_order) VALUES
('aws', 'IBM-AWS Joint Solution Brief — Financial Services', 'PDF', 'Overview of IBM and AWS joint capabilities for financial services clients, including cloud migration, AI, and regulatory compliance.', '2024-10-01', 1),
('aws', 'AWS Seller Battlecard — Competitive Positioning vs Azure & GCP', 'Deck', 'IBM seller resource covering AWS competitive positioning, key differentiators, and objection handling for cloud platform conversations.', '2024-09-01', 2),
('microsoft', 'IBM-Microsoft Joint Capabilities Overview', 'PDF', 'Comprehensive overview of IBM and Microsoft joint solutions across cloud, AI, productivity, and security.', '2024-10-01', 1),
('microsoft', 'Microsoft Copilot ROI Calculator', 'Link', 'Use this tool to build a business case for Microsoft 365 Copilot with your clients. Requires Microsoft partner portal login.', '2024-11-01', 2),
('sap', 'RISE with SAP Programme Playbook', 'Deck', 'Full programme playbook for IBM Consulting RISE with SAP engagements — methodology, timelines, and governance framework.', '2024-07-01', 1),
('sap', 'SAP on IBM Power — Technical IBV', 'IBV', 'IBM Institute for Business Value research on the performance and cost advantages of running SAP HANA on IBM Power hardware.', '2024-06-01', 2),
('salesforce', 'IBM Consulting Salesforce Practice Overview', 'Deck', 'Introduction to IBM''s Salesforce practice, key capabilities, reference clients, and co-sell motion.', '2024-09-01', 1),
('google', 'Google Cloud + IBM Consulting Joint GTM Deck', 'Deck', 'Joint go-to-market presentation for IBM-Google Cloud opportunities, covering AI, data, and cloud-native transformation.', '2024-10-01', 1),
('palo-alto', 'IBM Security + Palo Alto Networks MSSP Overview', 'PDF', 'Overview of IBM''s managed security service offering built on Palo Alto Networks Cortex platform.', '2024-10-01', 1),
('oracle', 'Oracle on IBM Power — Reference Architecture', 'Deck', 'Technical reference architecture for Oracle Database and applications running on IBM Power Systems.', '2024-08-01', 1);

-- ── Business Resources ────────────────────────────────────────
INSERT INTO sp_business_resources (title, resource_type, description, resource_date, display_order) VALUES
('Partner Event Planning Guide', 'Event Planning', 'Step-by-step guide for planning and executing joint IBM-partner events in the UKI region, covering approvals, budgets, and logistics.', '2024-10-01', 1),
('Partner Communications Toolkit', 'Comms', 'Templates and guidance for internal and external communications about IBM strategic partnership activities.', '2024-10-01', 2),
('IBM Co-Branding Guidelines for Partners', 'Branding', 'Official IBM branding guidance for co-branded partner materials, including logo usage rules, colour palettes, and approval processes.', '2024-09-01', 3),
('Partnership Measurement Framework', 'Measurement', 'How to measure and report on partnership KPIs including pipeline contribution, joint wins, and engagement metrics.', '2024-10-01', 4),
('Partner Activity Approval Process', 'Approval', 'End-to-end guide to the approval process for joint partner activities, from initial request to sign-off.', '2024-10-01', 5);

-- ── Social Kits ───────────────────────────────────────────────
INSERT INTO sp_social_kits (partner_slug, title, post_copy, downloadable_assets, display_order) VALUES
(
  'aws',
  'IBM + AWS Cloud Transformation — Social Kit',
  'Excited to share how IBM and @AWSCloud are helping enterprises transform their cloud infrastructure. Together, we''re delivering faster migrations, smarter AI, and stronger security for UKI clients. 🚀 #IBMPartner #AWSCloud #CloudTransformation',
  '[{"label": "LinkedIn Banner (1200x627)", "url": "https://example.com/aws-linkedin-banner.jpg"}, {"label": "Twitter Card (1200x675)", "url": "https://example.com/aws-twitter-card.jpg"}]',
  1
),
(
  'microsoft',
  'IBM + Microsoft AI Transformation — Social Kit',
  'The future of work is AI-powered. See how IBM and @Microsoft are helping organisations unlock the potential of Microsoft 365 Copilot and Azure AI — with IBM''s proven implementation expertise. 💡 #IBMConsulting #MicrosoftPartner #ArtificialIntelligence',
  '[{"label": "LinkedIn Banner (1200x627)", "url": "https://example.com/msft-linkedin-banner.jpg"}, {"label": "Social Graphic Square (1080x1080)", "url": "https://example.com/msft-social-square.jpg"}]',
  1
),
(
  'sap',
  'IBM + SAP RISE Transformation — Social Kit',
  'RISE with SAP + IBM Consulting = enterprise transformation at speed. We''re proud to be the leading global systems integrator for SAP, helping clients modernise their ERP landscape and unlock intelligent enterprise capabilities. #RISEWITHSAP #IBMConsulting #SAPPartner',
  '[{"label": "LinkedIn Banner (1200x627)", "url": "https://example.com/sap-linkedin-banner.jpg"}]',
  1
),
(
  'salesforce',
  'IBM + Salesforce CRM Transformation — Social Kit',
  'Customer experience starts with the right platform and the right partner. IBM Consulting and @Salesforce are helping UKI enterprises transform their CRM capabilities and unlock the power of AI-driven customer insights. #Salesforce #IBMConsulting #CRMTransformation',
  '[{"label": "LinkedIn Banner (1200x627)", "url": "https://example.com/sfdc-linkedin-banner.jpg"}]',
  1
),
(
  'google',
  'IBM + Google Cloud AI — Social Kit',
  'Data + AI + the right expertise. IBM Consulting and @GoogleCloud are building next-generation analytics and AI platforms for enterprise clients. Explore what''s possible when world-class cloud infrastructure meets IBM''s industry knowledge. #GoogleCloud #IBMConsulting #AITransformation',
  '[{"label": "LinkedIn Banner (1200x627)", "url": "https://example.com/google-linkedin-banner.jpg"}]',
  1
),
(
  'adobe',
  'IBM iX + Adobe Digital Experience — Social Kit',
  'Great digital experiences don''t happen by accident. IBM iX and @Adobe are helping organisations transform their content operations and deliver personalised experiences at scale with Adobe Experience Cloud. #AdobePartner #IBMiX #DigitalExperience',
  '[{"label": "LinkedIn Banner (1200x627)", "url": "https://example.com/adobe-linkedin-banner.jpg"}]',
  1
),
(
  'palo-alto',
  'IBM Security + Palo Alto Networks — Social Kit',
  'In a threat landscape that never sleeps, IBM Security and @PaloAltoNtwks are delivering 24/7 managed protection powered by Cortex AI. Zero Trust. Always on. Always protecting. #CyberSecurity #IBMSecurity #PaloAltoNetworks #ZeroTrust',
  '[{"label": "LinkedIn Banner (1200x627)", "url": "https://example.com/panw-linkedin-banner.jpg"}]',
  1
),
(
  'oracle',
  'IBM + Oracle Cloud Infrastructure — Social Kit',
  'Mission-critical workloads deserve mission-critical expertise. IBM Consulting and @Oracle are helping enterprises migrate, modernise, and optimise their Oracle environments — from on-premises to OCI and IBM Power. #Oracle #OCI #IBMConsulting #CloudMigration',
  '[{"label": "LinkedIn Banner (1200x627)", "url": "https://example.com/oracle-linkedin-banner.jpg"}]',
  1
);

import React, { useState, useMemo, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { uploadClientStoryFile } from '../lib/supabaseData';

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

const ALL_STORIES = [{"id":"s01","num":"01","badge":"","updatedAt":"2026-07-23","title":"NatWest Group takes on digital transformation to make home buying easier","client":"NatWest Group","industry":"Financial Services","products":["watsonx Assistant"],"region":"EMEA","usecase":"Customer Experience","summary":"IBM and NatWest co-created 'Marge', an AI-powered mortgage support platform for call centre employees, reducing call duration and boosting customer loyalty.","metrics":["10% decrease in call duration","20% increase in customer loyalty"],"pdfPath":"ppts/presentation-1.pptx","pdfFilename":"NatWest Group - Customer Experience.pptx"},{"id":"s03","num":"03","badge":"","updatedAt":"2026-07-23","title":"A British Bank Ensures Growth Through First-to-Market Generative-AI Deployment","client":"Anonymous British Bank","industry":"Financial Services","products":["watsonx Assistant"],"region":"EMEA","usecase":"Customer Experience","summary":"The bank's chatbot became a first-to-market Virtual Assistant LLM Classifier answering >91% of queries correctly vs 60-75% industry average, saving £2M/year.","metrics":[">91% query accuracy","£2M projected annual savings","99.9% analyst productivity increase"],"pdfPath":"ppts/presentation-2.pptx","pdfFilename":"British Bank, Customer Experience.pptx"},{"id":"s04","num":"04","badge":"","updatedAt":"2026-07-23","title":"Enhancing Vodafone's digital assistant TOBi with generative AI","client":"Vodafone","industry":"Telecommunications","products":["watsonx Assistant","watsonx.ai"],"region":"EMEA","usecase":"Customer Experience","summary":"IBM Client Engineering led a five-week build using watsonx.ai to enhance TOBi, achieving 99% improvement in journey-testing turnaround and gap analysis in under 5 minutes.","metrics":["99% improvement in testing turnaround","Gap analysis in under 5 minutes"],"pdfPath":"ppts/presentation-3.pptx","pdfFilename":"Vodafone, Customer Experience - TOBI.pptx"},{"id":"s05","num":"05","badge":"","updatedAt":"2026-07-23","title":"East and North Hertfordshire NHS Trust Launches Virtual HR Assistant","client":"East & North Hertfordshire NHS Trust","industry":"Healthcare","products":["watsonx Assistant"],"region":"EMEA","usecase":"HR","summary":"'Enquire' provides 24/7 HR support for NHS staff, alleviating administrative workload and freeing HR teams for higher-value work.","metrics":["24/7 HR support coverage","Reduced HR admin workload"],"pdfPath":"ppts/presentation-4.pptx","pdfFilename":"East-North Hertfordshire NHS, watsonx Assistant.pptx"},{"id":"s06","num":"06","badge":"","updatedAt":"2026-07-23","title":"Using IBM watsonx Orchestrate to improve employee and customer happiness","client":"Avid Solutions","industry":"Technology","products":["watsonx Orchestrate"],"region":"Americas","usecase":"HR","summary":"Avid Solutions used watsonx Orchestrate to automate customer onboarding, project management, and expense reporting.","metrics":["10% reduction in manual project errors","25% reduction in onboarding time"],"pdfPath":"ppts/presentation-5.pptx","pdfFilename":"Avid Solutions, watsonx Orchestrate.pptx"},{"id":"s07","num":"07","badge":"","updatedAt":"2026-07-23","title":"IBM HR: Using AI to achieve a measurable increase in employee learning satisfaction","client":"IBM (Internal)","industry":"Technology","products":["watsonx Orchestrate"],"region":"Global","usecase":"HR","summary":"IBM HR built cHaRlie using watsonx Orchestrate to automate event promotion, enrollment tracking, and attendance management across thousands of monthly events.","metrics":["10% improvement in attendance updates","15 NPS point increase YoY"],"pdfPath":"ppts/presentation-6.pptx","pdfFilename":"IBM HR Client Zero, watsonx Orchestrate.pptx"},{"id":"s08","num":"08","badge":"","updatedAt":"2026-07-23","title":"Minimizing business risk and supplier evaluation with AI","client":"Dun & Bradstreet","industry":"Financial Services","products":["watsonx Orchestrate","IBM Cloud"],"region":"Americas","usecase":"Procurement","summary":"D&B Ask Procurement provides instantaneous insights on supplier risk, fraud potential, and revenue-based scores using watsonx Orchestrate.","metrics":["Real-time supplier risk evaluation","Reduced manual evaluation effort"],"pdfPath":"ppts/presentation-7.pptx","pdfFilename":"Dun & Bradstreet, Procurement.pptx"},{"id":"s09","num":"09","badge":"","updatedAt":"2026-07-23","title":"Boosting fan engagement with AI-powered insights","client":"UFC","industry":"Sports & Entertainment","products":["watsonx Orchestrate","watsonx.ai","IBM Granite"],"region":"Americas","usecase":"Marketing & Sports Analytics","summary":"UFC's 'Insights Engine', powered by watsonx, generates tailored fight insights in near-real time for fans across 170+ countries.","metrics":["3x increase in insights volume","40% reduction in query time"],"pdfPath":"ppts/presentation-8.pptx","pdfFilename":"UFC, Marketing & Content Operations .pptx"},{"id":"s10","num":"10","badge":"","updatedAt":"2026-07-23","title":"USTA and IBM: The US Open is a smarter business","client":"USTA","industry":"Sports & Entertainment","products":["watsonx Orchestrate","watsonx.ai","watsonx.data"],"region":"Americas","usecase":"Marketing & Sports Analytics","summary":"The USTA adopted the full IBM watsonx suite to centralise data, embed generative AI in editorial workflows, and deliver new fan features at the US Open.","metrics":["99% tournament digital uptime","80% reduction in infrastructure provisioning time"],"pdfPath":"ppts/presentation-9.pptx","pdfFilename":"US Open, Marketing & Content Operations .pptx"},{"id":"s11","num":"11","badge":"","updatedAt":"2026-07-23","title":"Using watsonx Orchestrate to transform communities with AI-driven smart infrastructure","client":"City of Stonecrest / Georgia Tech","industry":"Local Government","products":["watsonx Orchestrate","IBM Maximo"],"region":"Americas","usecase":"Asset Lifecycle Management","summary":"Georgia Tech and IBM deployed Maximo and watsonx Orchestrate as a unified AI-enabled infrastructure management platform for the City of Stonecrest.","metrics":["60% decrease in manual field response times","30% increase in deployment speed"],"pdfPath":"pdfs/document-1.pdf","pdfFilename":"Georgia Tech, Asset Lifecycle Management- Field Operations.pdf"},{"id":"s12","num":"12","badge":"","updatedAt":"2026-07-23","title":"Damen Services optimizes vessel management with LAMA Empowerz and IBM","client":"Damen Services","industry":"Manufacturing","products":["watsonx Orchestrate","IBM Maximo"],"region":"EMEA","usecase":"Asset Lifecycle Management","summary":"Damen built a centralised configuration-management platform with IBM Maximo and watsonx Orchestrate to track vessel status and standardise maintenance.","metrics":["Deeper insight into ship operating costs","Streamlined maintenance workflows"],"pdfPath":"pdfs/document-2.pdf","pdfFilename":"Damen, Asset Lifecycle Management.pdf"},{"id":"s13","num":"13","badge":"new","updatedAt":"2026-07-23","title":"Transforming sales performance with AI automation","client":"FBA","industry":"Technology","products":["watsonx Orchestrate"],"region":"Americas","usecase":"Sales Operations / Document Processing","summary":"FBA deployed watsonx Orchestrate with custom ML models to ingest Franchise Disclosure Documents end-to-end, extracting financial data and populating CRM listings.","metrics":["Zero calculation errors","75% reduction in listing-creation time"],"pdfPath":"pdfs/document-3.pdf","pdfFilename":"Franchise Brokers Association, Sales Operations - Document Processing.pdf"},{"id":"s14","num":"14","badge":"","updatedAt":"2026-07-23","title":"Software development company helps clients boost productivity and get the most out of AI","client":"Barre Technologies","industry":"Technology","products":["watsonx.ai","IBM FileNet"],"region":"Americas","usecase":"Document Intelligence","summary":"Barre used the IBM watsonx portfolio to build an AI assistant for NL queries, invoice ingestion, and regulatory knowledge management.","metrics":["1,380 hours saved/year (pilot)","~USD 90,000 in productivity gains"],"pdfPath":"pdfs/document-4.pdf","pdfFilename":"Barre, Document Intelligence - Knowledge Management.pdf"},{"id":"s15","num":"15","badge":"","updatedAt":"2026-07-23","title":"The AI-powered digital assistant that's changing the way IBM works","client":"IBM (Internal - CIO Org)","industry":"Technology","products":["watsonx.ai","IBM Granite"],"region":"Global","usecase":"Employee Productivity","summary":"IBM CIO built AskIBM in 60 days using watsonx.ai and Granite LLMs, integrating 30,000+ documents for email drafting, summarisation, and corporate search.","metrics":["$3.5B in productivity improvement over 2 years"],"pdfPath":"pdfs/document-5.pdf","pdfFilename":"Ask IBM Client Zero.pdf"},{"id":"s16","num":"16","badge":"","updatedAt":"2026-07-23","title":"AI to boost productivity in support agent","client":"IBM Software Support & SRE","industry":"Technology","products":["watsonx Orchestrate","watsonx.ai"],"region":"Global","usecase":"Customer Care / Support","summary":"IBM Software Support & SRE used watsonx to develop AI models for pattern analysis and automated cross-team workflows to speed up issue resolution.","metrics":["Faster issue resolution","Proactive site reliability"],"pdfPath":"pdfs/document-6.pdf","pdfFilename":"IBM, IBM Software Support & SRE.pdf"},{"id":"s17","num":"17","badge":"new","updatedAt":"2026-07-23","title":"Improved claims management. Fewer complaints.","client":"Claims Connection Group","industry":"Insurance","products":["watsonx Orchestrate","watsonx.ai"],"region":"Americas","usecase":"Customer Care","summary":"Claims Connection Group automated property-claims workflows from policy intake through vendor coordination using watsonx Orchestrate.","metrics":["30-50% reduction in manual processing time","25-35% cost reduction in operations"],"pdfPath":"pdfs/document-7.pdf","pdfFilename":"Claims Connection Group, Customer Care.pdf"},{"id":"sce01","num":"CE 01","badge":"new","updatedAt":"2026-07-23","title":"Intelligent Companion: Elevating Customer Experience to Drive Brand Engagement","client":"Mitsubishi Motors","industry":"Automotive","products":["watsonx.ai"],"region":"Americas","usecase":"Customer Experience","summary":"IBM Client Engineering built an AI Intelligent Companion for the 2025 Mitsubishi Outlander 'Build and Price' feature, driving qualified leads through meaningful AI conversations.","metrics":["32% increase in visitor-to-conversation rate","240% improvement in downstream conversion","4,000+ unique conversations"],"pdfPath":"pdfs/document-8.pdf","pdfFilename":"Mitsubishi Motors, Customer Experience.pdf"},{"id":"sce02","num":"CE 02","badge":"","updatedAt":"2026-07-23","title":"LivePerson Integration with watsonx","client":"Flutter Entertainment","industry":"Sports & Entertainment","products":["watsonx.ai"],"region":"EMEA","usecase":"Customer Experience","summary":"Flutter embedded watsonx.ai into its LivePerson customer engagement platform, enabling brand-aligned agent responses with measurable gains in satisfaction and efficiency.","metrics":["20 mins to under 1 min response generation","7/10 usability and accuracy rating"],"pdfPath":"pdfs/document-9.pdf","pdfFilename":"Flutter, Customer Experience.pdf"},{"id":"s02","num":"02","badge":"","updatedAt":"2026-07-23","title":"HSBC is using AI to identify potential high-growth stocks","client":"HSBC","industry":"Financial Services","products":["watsonx.ai"],"region":"EMEA","usecase":"Customer Experience","summary":"The HSBC AI Powered US Equity Index (AiPEX) uses the EquBot AI investment platform as a stock picker, selecting companies with a potential for growth using IBM AI technology to surface insights from unstructured data.","metrics":["123% AiPEX outperformed S&P 500 over 10 years","USD 2B+ in sales linked to AiPEX"],"pdfPath":"pdfs/document-10.pdf","pdfFilename":"HSBC, Customer Experience.pdf"},{"id":"s18","num":"18","badge":"","updatedAt":"2026-07-23","title":"Ancestry makes optimised planning part of their DNA","client":"Ancestry","industry":"Technology","products":["IBM Planning Analytics"],"region":"Americas","usecase":"FP&A","summary":"Ancestry adopted IBM Planning Analytics (powered by TM1) for enterprise FP&A, replacing fragmented processes with real-time planning, positive uptime, and site stability.","metrics":["Real-time access to financial information","Reduced infrastructure management overhead"],"pdfPath":"pdfs/document-11.pdf","pdfFilename":"Ancestry, FP&A.pdf"},{"id":"s19","num":"19","badge":"","updatedAt":"2026-07-23","title":"Ecco Ireland optimises sales performance with data-driven insights","client":"Ecco Ireland","industry":"Retail","products":["IBM Cognos Analytics"],"region":"EMEA","usecase":"Retail Analytics","summary":"Ecco Ireland teamed up with ProStrategy to enhance analytics with IBM Cognos Analytics, enabling store managers to make smart, data-driven decisions and eliminating manual sales reporting.","metrics":["Eliminated manual sales report creation","Faster response to changing market conditions"],"pdfPath":"pdfs/document-12.pdf","pdfFilename":"ECCO, Retail.pdf"},{"id":"s20","num":"20","badge":"","updatedAt":"2026-07-23","title":"Wimbledon looks at the action from new perspectives to draw fans in like never before","client":"Wimbledon (AELTC)","industry":"Sports & Entertainment","products":["IBM Db2"],"region":"EMEA","usecase":"Media & Fan Experience","summary":"IBM leveraged IBM Db2 and historical match data to deliver new statistical insights and perspectives for Wimbledon fans, enriching the fan experience with AI-driven commentary.","metrics":["Real-time insights from large historical Db2 database","New audience engagement through data storytelling"],"pdfPath":"pdfs/document-13.pdf","pdfFilename":"Wimbledon, Media & Entertainment.pdf"},{"id":"s21","num":"21","badge":"","updatedAt":"2026-07-23","title":"Achieving enterprise-wide transformation through AI-powered planning and reporting","client":"IBM (Internal - FP&A)","industry":"Technology","products":["IBM Planning Analytics","IBM Cognos Analytics"],"region":"Global","usecase":"FP&A","summary":"IBM adopted IBM Enterprise Performance Management (EPM) to unify FP&A data, replacing 140 tools with a single AI-driven platform for forecasting, reporting, and self-service dashboards.","metrics":["95% fewer FP&A tools since 2010","40% gain in FP&A productivity since 2021","140,000 data points predicted monthly"],"pdfPath":"pdfs/document-14.pdf","pdfFilename":"IBM, FP&A.pdf"},{"id":"s22","num":"22","badge":"","updatedAt":"2026-07-23","title":"ALH Gruppe delivering daily value and strategic insight","client":"ALH Gruppe (Alte Leipziger-Hallesche)","industry":"Insurance","products":["IBM Cognos Analytics"],"region":"EMEA","usecase":"Insurance Analytics","summary":"ALH Gruppe consolidated their analytics team and aligned on IBM Cognos Analytics to deliver consistent sales numbers, customer insights, and health insurance tariff calculations using Jupyter notebook integrations.","metrics":["Consistent daily sales and customer analytics","AI-assisted tariff calculation in health insurance"],"pdfPath":"pdfs/document-15.pdf","pdfFilename":"ALH Gruppe, Insurance.pdf"},{"id":"s23","num":"23","badge":"","updatedAt":"2026-07-23","title":"a.s.r finding information faster with Cognos Analytics","client":"a.s.r.","industry":"Insurance","products":["IBM Cognos Analytics"],"region":"EMEA","usecase":"Insurance Analytics","summary":"Dutch insurer a.s.r. leveraged IBM Cognos Analytics to deliver AI-infused daily reports and dashboards, enriching corporate data with external sources for faster, more reliable insight.","metrics":["Daily reports improving efficiency at all organisational levels","Enriched data with external sources for deeper insight"],"pdfPath":"pdfs/document-16.pdf","pdfFilename":"ASR.pdf"},{"id":"s24","num":"24","badge":"","updatedAt":"2026-07-23","title":"ElectroRoute enabling supercharged growth with automation and analytics","client":"ElectroRoute","industry":"Energy & Utilities","products":["IBM Cognos Analytics"],"region":"EMEA","usecase":"Energy Analytics","summary":"ElectroRoute worked with ProStrategy to build a data warehouse and deploy IBM Cognos Analytics, meeting critical needs for self-service dashboards, zero-touch reports, and empowering better business decisions.","metrics":["Self-service analytics across the business","Zero-touch dashboards and automated reports"],"pdfPath":"pdfs/document-17.pdf","pdfFilename":"ElectroRoute, Energy & Utilities.pdf"},{"id":"s25","num":"25","badge":"","updatedAt":"2026-07-23","title":"Elkjøp modernising business intelligence for growth with cloud-based analytics","client":"Elkjøp","industry":"Retail","products":["IBM Cognos Analytics"],"region":"EMEA","usecase":"Retail Analytics","summary":"Elkjøp migrated to IBM Cognos Analytics on the cloud, modernising their BI journey with dashboards and self-service reporting to support management decisions every day.","metrics":["Cloud-native BI modernisation","Daily management access to performance data"],"pdfPath":"pdfs/document-18.pdf","pdfFilename":"ELKJOP, Electronics.pdf"},{"id":"s26","num":"26","badge":"","updatedAt":"2026-07-23","title":"GasTerra enables the smooth flow of critical energy resources with high-speed analytics","client":"GasTerra","industry":"Energy & Utilities","products":["IBM Cognos Analytics"],"region":"EMEA","usecase":"Energy Analytics","summary":"GasTerra deployed IBM analytics tools to integrate, cleanse and analyse data from price indexes and forecasts, enabling rapid decision-making in the fast-moving energy market.","metrics":["25% faster data processing","Self-service analytics empowering business users","Freed IT from manual report preparation"],"pdfPath":"pdfs/document-19.pdf","pdfFilename":"GasTerra, Energy & Utilities.pdf"},{"id":"s27","num":"27","badge":"","updatedAt":"2026-07-23","title":"Kazanci Holding integrated planning for integrated business with IBM Planning Analytics","client":"Kazanci Holding","industry":"Energy & Utilities","products":["IBM Planning Analytics"],"region":"EMEA","usecase":"FP&A","summary":"Kazanci Holding partnered with Planist and IBM to deploy a centralised planning, budgeting, and consolidation platform, reducing financial consolidation from 2 weeks to under 5 days.","metrics":["Group financials consolidated in <5 days (10 days faster)","Standardised data formats and driver-based planning"],"pdfPath":"pdfs/document-20.pdf","pdfFilename":"Kazanci, Industrial.pdf"},{"id":"s28","num":"28","badge":"","updatedAt":"2026-07-23","title":"Financial clarity, faster, at a large Swedish firm","client":"Länsförsäkringar AB","industry":"Financial Services","products":["IBM Planning Analytics"],"region":"EMEA","usecase":"FP&A","summary":"With support from Attollo AB, Länsförsäkringar AB deployed IBM Planning Analytics for companywide planning and reporting, enabling managers to generate more granular and accurate budget forecasts faster.","metrics":["More granular and accurate budget forecasts","Faster forecast generation for managers"],"pdfPath":"pdfs/document-21.pdf","pdfFilename":"LF Stockholm.pdf"},{"id":"s29","num":"29","badge":"","updatedAt":"2026-07-23","title":"Laura Ashley streamlines corporate accounting with financial performance management solutions","client":"Laura Ashley","industry":"Retail","products":["IBM Planning Analytics","IBM Cognos Analytics"],"region":"EMEA","usecase":"FP&A","summary":"Laura Ashley upgraded its IBM Analytics landscape to accelerate financial consolidation and streamline delivery of management and statutory reporting across retail channels and manufacturing.","metrics":["85% reduction in time to consolidate a year's data (half-day to 30 mins)","Hours saved monthly by minimising manual data entry","Automatic currency conversions for international subsidiaries"],"pdfPath":"pdfs/document-22.pdf","pdfFilename":"Laura Ashley, Retail & Consumer Products.pdf"},{"id":"s30","num":"30","badge":"","updatedAt":"2026-07-23","title":"UK high street bank accelerates unstructured document processing","client":"Anonymous UK High Street Bank","industry":"Financial Services","products":["watsonx.data"],"region":"EMEA","usecase":"Intelligent Document Processing","summary":"Using watsonx.data integration, a UK bank automated ingestion and structuring of unstructured financial documents, shifting CRM teams from manual data entry to strategic engagement.","metrics":["Reduced document processing from 1.5+ weeks","Higher data quality and consistent reporting","Shift from manual work to strategic engagement"],"pdfPath":"pdfs/document-23.pdf","pdfFilename":"Banking, Intelligent Document Processing.pdf"},{"id":"s31","num":"31","badge":"","updatedAt":"2026-07-23","title":"UK high street bank modernises customer communications at scale","client":"Anonymous UK High Street Bank","industry":"Financial Services","products":["watsonx.data"],"region":"EMEA","usecase":"Real-Time Notifications","summary":"A UK bank used watsonx.data integration and Kafka to build a centralised, API-driven messaging hub, processing 16M+ events per day including card transactions, fraud alerts, and MFA notifications.","metrics":["16M+ events processed per day","Debit-card alerts delivered in under 5 seconds","SMS/digital messaging optimised by customer preferences"],"pdfPath":"pdfs/document-24.pdf","pdfFilename":"Banking, Real-Time notifications.pdf"},{"id":"s32","num":"32","badge":"","updatedAt":"","title":"Lockheed Martin: AI-driven integrated data platform for airport operations","client":"Lockheed Martin (Airport Client)","industry":"Defense & Aerospace","products":["watsonx.data"],"region":"EMEA","usecase":"Asset Lifecycle Management","summary":"Using watsonx.data integration, intelligence and data, Lockheed Martin delivered a centralised, integrated data and AI platform that replaced 46 disparate systems and improved AI response accuracy by 20%.","metrics":["46 data systems replaced with one unified platform","50% reduction in data and AI tools","20% improvement in AI response accuracy","216 data catalog definitions automated"],"pdfPath":"","pdfFilename":""},{"id":"s33","num":"33","badge":"","updatedAt":"2026-07-23","title":"Tech Mahindra: AI-powered data observability for APAC media client","client":"Tech Mahindra / APAC Media Client","industry":"Technology","products":["watsonx.data"],"region":"APAC","usecase":"Data Observability","summary":"Tech Mahindra and IBM implemented AI-powered data observability using IBM Databand (watsonx.data integration), introducing real-time anomaly detection and automated impact analysis to achieve near-100% SLA performance.","metrics":["30% decrease in time spent on manual monitoring","Near-100% business SLA performance","20% faster issue resolution"],"pdfPath":"pdfs/document-25.pdf","pdfFilename":"Tech Mahindra, Technology.pdf"},{"id":"s34","num":"34","badge":"","updatedAt":"2026-07-23","title":"UK government department builds data factory to improve access to complex, high-volume data streams","client":"Anonymous UK Government Department","industry":"Government","products":["watsonx.data"],"region":"EMEA","usecase":"Data Product Marketplace","summary":"IBM partnered with a UK government department to create a scalable data product marketplace using watsonx.data intelligence and integration, enabling controlled, automated access to curated datasets.","metrics":["Faster processing and delivery of data requests","Increased analyst productivity","More consistent and repeatable data pipelines"],"pdfPath":"pdfs/document-26.pdf","pdfFilename":"UK Government, Data Product Marketplace -UKI.pdf"},{"id":"s35","num":"35","badge":"","updatedAt":"2026-07-23","title":"Accelerating data migration for international bank","client":"Anonymous International Bank","industry":"Financial Services","products":["watsonx.data"],"region":"EMEA","usecase":"Data Governance and Migration","summary":"IBM worked with an international bank to understand data sources and targets, probe data quality, and create full data lineage, completing migration within an aggressive timeline.","metrics":["30-40% reduction in migration time","Decreased time finding and understanding data","Improved compliance relating to customer data"],"pdfPath":"ppts/presentation-10.pptx","pdfFilename":"International Bank, Data Governance and Migration  .pptx"},{"id":"s36","num":"36","badge":"","updatedAt":"2026-07-23","title":"Accelerating AI and analytics with high-performance data","client":"Intel","industry":"Technology","products":["watsonx.data"],"region":"Americas","usecase":"Semiconductor Analytics","summary":"IBM and Intel optimised watsonx.data open lakehouse architecture, enabling multiple query engines (Presto, Spark) with Intel Xeon optimisations for 2.7x faster query performance at lower infrastructure cost.","metrics":["2.7x faster query performance","Significantly improved price-performance","Reduced infrastructure costs"],"pdfPath":"pdfs/document-27.pdf","pdfFilename":"Intel, Semiconducter & Manufacturing.pdf"},{"id":"s37","num":"37","badge":"","updatedAt":"2026-07-23","title":"A new era of AI takes off for Lockheed Martin","client":"Lockheed Martin","industry":"Defense & Aerospace","products":["watsonx.data"],"region":"EMEA","usecase":"Data Fabric / AI Readiness","summary":"Lockheed Martin implemented a unified data fabric powered by watsonx.data intelligence and integration, consolidating disparate data sources into a single governed platform for AI and analytics.","metrics":["50% reduction in data and AI tools","20% boost in AI response accuracy","11% increase in accuracy with prompt engineering"],"pdfPath":"pdfs/document-28.pdf","pdfFilename":"Lockheed Martin, Defence & Areospace.pdf"},{"id":"s38","num":"38","badge":"","updatedAt":"2026-07-23","title":"Unlocking smarter banking with data-driven insights","client":"Capital Bank of Jordan","industry":"Financial Services","products":["watsonx.data"],"region":"EMEA","usecase":"Banking Analytics","summary":"Capital Bank of Jordan implemented IBM watsonx.data to unify structured and unstructured data, enabling AI-driven analytics to improve fraud detection, reduce customer churn, and support informed decision-making.","metrics":["Improved fraud detection and risk identification","Reduced customer churn through better insights","Enhanced data-driven decision-making"],"pdfPath":"ppts/presentation-11.pptx","pdfFilename":"Capital Bank of Jordan, Financial Services - EMEA.pptx"},{"id":"s39","num":"39","badge":"","updatedAt":"2026-07-23","title":"Large UK organisation data governance modernisation","client":"Barclays","industry":"Financial Services","products":["watsonx.data"],"region":"EMEA","usecase":"Data Governance and Migration","summary":"IBM helped an 81,000-employee UK organisation modernise its data governance and migration processes, achieving significant reductions in bank process cycle times and millions of pounds in annual operational savings.","metrics":["80% reduction in bank process cycle times","Millions of pounds in annual operational savings"],"pdfPath":"ppts/presentation-12.pptx","pdfFilename":"Barclays, Data Governance and Migration - UK.pptx"},{"id":"s40","num":"40","badge":"","updatedAt":"2026-07-23","title":"ABP Consultancy improves betting app navigation with voice technology","client":"ABP Consultancy","industry":"Sports & Entertainment","products":["watsonx.ai","IBM Speech to Text"],"region":"EMEA","usecase":"Customer Experience","summary":"ABP Consultancy introduced voice-enabled navigation for betting apps, allowing users to find markets, build slips, and place bets with conversational voice commands, reducing bet placement from 4+ minutes to 35 seconds.","metrics":["Bet placement reduced from 4+ minutes to 35 seconds","Improved user NPS and revenue for Flutter","More intuitive and accessible app experience"],"pdfPath":"ppts/presentation-13.pptx","pdfFilename":"ABP, Gaming.pptx"},{"id":"s41","num":"41","badge":"","updatedAt":"2026-07-23","title":"Revolutionising digital business with an intelligent AI assistant","client":"YappyBuy","industry":"Retail","products":["watsonx.ai"],"region":"EMEA","usecase":"E-Commerce","summary":"YappyBuy's Buddy AI assistant provides personalised product recommendations, conversational support, and data-driven insights for e-commerce managers, reducing checkout drop-off rates.","metrics":["Personalised and interactive customer engagement","Reduced checkout drop-off rates","AI-driven insights for product and pricing optimisation"],"pdfPath":"ppts/presentation-14.pptx","pdfFilename":"YappyBuy, E-Commerce.pptx"},{"id":"s42","num":"42","badge":"","updatedAt":"2026-07-23","title":"Fueling real-time race insights with Ferrari","client":"Ferrari","industry":"Sports & Entertainment","products":["watsonx.ai","watsonx.data"],"region":"EMEA","usecase":"Fan Engagement","summary":"Ferrari upgraded its Fan Engagement App with watsonx.data to support interactive features, AI-driven content recommendations, and real-time race insights on a secure, scalable multi-cloud solution.","metrics":["Doubled daily active users on global fan app","35% increase in data engagement"],"pdfPath":"ppts/presentation-15.pptx","pdfFilename":"Ferrari, E-Commerce.pptx"},{"id":"s43","num":"43","badge":"","updatedAt":"2026-07-23","title":"Platform SHARK.X for AI — Telefonica","client":"Telefonica","industry":"Telecommunications","products":["watsonx.ai","watsonx.data"],"region":"EMEA","usecase":"AI Platform / Governance","summary":"Telefonica modernised its AI and data architecture with watsonx.ai and a watsonx.data lakehouse, accelerating AI deployment, strengthening governance and compliance, and enabling real-time data insights across the enterprise.","metrics":["Faster development and operationalization of AI use cases","Improved model monitoring, compliance, and accountability","Real-time access to distributed data for AI insights"],"pdfPath":"ppts/presentation-16.pptx","pdfFilename":"Telefonica, E-Commerce.pptx"},{"id":"s44","num":"44","badge":"","updatedAt":"2026-07-23","title":"Revolutionizing unstructured data analysis and investigation with watsonx.data","client":"Cogniware","industry":"Technology","products":["watsonx.data"],"region":"EMEA","usecase":"Document Intelligence","summary":"Cogniware used IBM watsonx.data to securely collect and link structured, semi-structured, and unstructured data across multiple sources, accelerating investigative workflows and data processing speed.","metrics":["Up to 60% faster data processing","45% reduction in ARGOS implementation time","Improved ease of use in complex investigative workflows"],"pdfPath":"ppts/presentation-17.pptx","pdfFilename":"Cogniware, Computer Services.pptx"},{"id":"s45","num":"45","badge":"","updatedAt":"2026-07-23","title":"Sainsbury's supply chain transformation with real-time data streaming","client":"Sainsbury's","industry":"Retail","products":["Confluent"],"region":"EMEA","usecase":"Supply Chain","summary":"Sainsbury's chose Confluent to form the data streaming backbone of its supply chain transformation, enabling real-time data access and connections between multiple databases and logistics systems.","metrics":["Real-time data access across supply chain systems","Seamless, transparent transformation with no disruption"],"pdfPath":"ppts/presentation-18.pptx","pdfFilename":"Sainsburys, Real-Time Data Streaming.pptx"},{"id":"s46","num":"46","badge":"","updatedAt":"2026-07-23","title":"The balance of excellent CX and a healthy bottom line","client":"Toolstation","industry":"Retail","products":["Confluent"],"region":"EMEA","usecase":"Real-Time Data Streaming","summary":"Toolstation used Confluent to eliminate the limitations of legacy batch processing for click-and-collect, delivering real-time capabilities that improved customer experience and reduced operational costs.","metrics":["Implemented and in production within 6 weeks","Eliminated risks from batch processing","Improved CX with real-time order updates"],"pdfPath":"ppts/presentation-19.pptx","pdfFilename":"Toolstation, Real-Time Data Streaming.pptx"},{"id":"s47","num":"47","badge":"","updatedAt":"2026-07-23","title":"Wix scales hyper-personalisation with real-time web analytics","client":"Wix","industry":"Technology","products":["Confluent"],"region":"Americas","usecase":"Real-Time Data Streaming","summary":"Wix adopted Confluent Cloud to replace self-managed Kafka, enabling a highly scalable event-driven architecture that doubled engineering productivity and significantly reduced platform downtime.","metrics":["Reduced platform downtime across 2,500+ microservices","More than doubled engineering productivity","Saved 20 hours per sprint"],"pdfPath":"ppts/presentation-20.pptx","pdfFilename":"WIX, Real-Time Data Streaming.pptx"},{"id":"s48","num":"48","badge":"","updatedAt":"2026-07-23","title":"Nash develops first-of-its-kind non-custodial exchange for digital assets","client":"Nash","industry":"Financial Services","products":["Confluent"],"region":"Americas","usecase":"Real-Time Data Streaming","summary":"Nash used Confluent to build a first-of-its-kind financial trading platform combining traditional exchange speed with the security of non-custodial exchange, enabling rapid innovation and low-overhead operations.","metrics":["Reliable infrastructure for rapid new offerings","Accelerated issue resolution with Confluent support","Low-overhead, secure operations"],"pdfPath":"ppts/presentation-21.pptx","pdfFilename":"Nash, Real-Time Data Streaming.pptx"},{"id":"s49","num":"49","badge":"","updatedAt":"2026-07-23","title":"10x Banking makes banking 10x better with cloud-native streaming","client":"10x Banking","industry":"Financial Services","products":["Confluent"],"region":"Americas","usecase":"Real-Time Data Streaming","summary":"10x Banking used Confluent Cloud to build a cloud-native streaming platform, enabling large banks to deliver 10x better customer experiences with increased agility, resilience, and reduced total cost of ownership.","metrics":["10x better customer experiences","Faster time to market","Reduced total cost of ownership"],"pdfPath":"ppts/presentation-22.pptx","pdfFilename":"10x, Real-Time Data Streaming.pptx"},{"id":"s50","num":"50","badge":"","updatedAt":"2026-07-23","title":"Commercial International Bank securing data access with IBM Guardium & Verify","client":"Commercial International Bank (CIB)","industry":"Financial Services","products":["IBM Guardium","IBM Verify"],"region":"EMEA","usecase":"Data Management and Security","summary":"IBM Guardium Data Protection gave CIB centralised database monitoring, compliance controls and audit-ready reporting across 80+ applications, with IBM Verify governing 8,000 identities for least-privilege access.","metrics":["<1 day provisioning access (vs manual risk)","120+ apps requiring database monitoring and compliance","8,000 identities governed for least privilege"],"pdfPath":"ppts/presentation-23.pptx","pdfFilename":"CIB, Data Management and Security.pptx"},{"id":"s51","num":"51","badge":"","updatedAt":"2026-07-23","title":"Vodafone is using IBM to become quantum-safe and crypto-agile","client":"Vodafone","industry":"Telecommunications","products":["IBM Quantum Safe"],"region":"EMEA","usecase":"Quantum Safe Security","summary":"IBM Quantum Safe Explorer enables Vodafone to automatically discover cryptographic assets across its codebase with near-zero manual effort, providing a cradle-to-grave path to post-quantum readiness.","metrics":["Near-zero manual effort for cryptographic asset discovery","Full post-quantum readiness roadmap"],"pdfPath":"ppts/presentation-24.pptx","pdfFilename":"Vodafone, Quantum Safe.pptx"},{"id":"s52","num":"52","badge":"","updatedAt":"2026-07-23","title":"Infosys builds for the future with IBM watsonx.governance","client":"Infosys","industry":"Technology","products":["watsonx.governance"],"region":"Global","usecase":"AI Governance","summary":"Infosys implemented an AI Management System (AIMS) powered by Infosys Topaz and built with IBM watsonx.governance, enabling scalable AI compliance, real-time visibility, and enterprise-wide governance.","metrics":["150% improvement in AI governance processes","Real-time compliance visibility","Consistent AI assessments at scale"],"pdfPath":"ppts/presentation-25.pptx","pdfFilename":"Infosys, AI at Scale.pptx"},{"id":"s53","num":"53","badge":"","updatedAt":"2026-07-23","title":"Centralised AI governance with watsonx.governance","client":"IBM (Internal - OPRT)","industry":"Technology","products":["watsonx.governance"],"region":"Global","usecase":"AI Governance","summary":"IBM's OPRT team developed the Integrated Governance Program (IGP) using watsonx.governance to unify AI responsibility and compliance, delivering a holistic end-to-end view of IBM's data and AI lifecycle.","metrics":["58% reduction in data clearance request processing time","62% improvement in governance efficiency"],"pdfPath":"ppts/presentation-26.pptx","pdfFilename":"IBM, watsonx Governance.pptx"},{"id":"s54","num":"54","badge":"","updatedAt":"2026-07-23","title":"Trusted and Secure AI (TSAI) governance for Deloitte Ascend Platform","client":"Deloitte","industry":"Technology","products":["watsonx.governance"],"region":"Global","usecase":"AI Governance","summary":"Deloitte integrated its Ascend digital transformation platform with watsonx.governance, implementing role-based approval workflows, built-in risk assessments, EU AI Act alignment, and TSAI framework governance.","metrics":["58% improvement in governance process efficiency","EU AI Act-aligned governance workflows"],"pdfPath":"ppts/presentation-27.pptx","pdfFilename":"Deloitte, watsonx Governance.pptx"},{"id":"s55","num":"55","badge":"","updatedAt":"2026-07-23","title":"Governing third-party GenAI with IBM watsonx.governance","client":"WPP","industry":"Technology","products":["watsonx.governance"],"region":"EMEA","usecase":"AI Governance","summary":"WPP used IBM watsonx.governance to monitor and govern third-party LLMs (e.g., GPT-3.5 on Azure) without moving or retraining models, proving watsonx.governance as a central control layer for external AI.","metrics":["Governance of third-party LLMs without model changes","Centralised control layer for external AI monitoring"],"pdfPath":"ppts/presentation-28.pptx","pdfFilename":"WPP, watsonx Governance.pptx"},{"id":"s56","num":"56","badge":"","updatedAt":"2026-07-23","title":"Anglian Water modernises SAP with IBM Db2","client":"Anglian Water","industry":"Energy & Utilities","products":["IBM Db2","IBM Power Systems"],"region":"EMEA","usecase":"Database Modernisation","summary":"Anglian Water migrated SAP applications and databases to IBM Db2 on IBM Power Systems, creating a high-performance, scalable, and resilient platform that reduced downtime, improved disaster recovery, and lowered costs.","metrics":["66% improvement in system performance","Reduced storage, backup, and licensing costs","Improved disaster recovery capability"],"pdfPath":"ppts/presentation-29.pptx","pdfFilename":"Anglian Water, Database modernization .pptx"},{"id":"s58","num":"58","badge":"","updatedAt":"2026-07-23","title":"Scalable processing and highly available data help a sports brand go faster","client":"PUMA","industry":"Retail","products":["IBM Db2"],"region":"Americas","usecase":"Database Modernisation","summary":"IBM migrated PUMA to IBM Db2 pureScale, enabling concurrent database access across multiple instances with shared virtual storage, supporting 3-400% more users than before.","metrics":["3-400% more users supported vs before","High availability across concurrent Db2 instances"],"pdfPath":"ppts/presentation-30.pptx","pdfFilename":"Puma, Flexible scaling, micro-services, continuous availability.pptx"},{"id":"s59","num":"59","badge":"","updatedAt":"2026-07-23","title":"Scaling intelligent travel with Db2","client":"Marriott International","industry":"Travel & Hospitality","products":["IBM Db2"],"region":"Americas","usecase":"Database Modernisation","summary":"Marriott leveraged IBM Db2 Warehouse on Cloud to support its Bonvoy loyalty programme, departing from legacy monolithic mainframes to a cloud-based platform aligned to lines of business.","metrics":["Over 140M loyalty members served","Cloud-native data platform for loyalty programme"],"pdfPath":"ppts/presentation-31.pptx","pdfFilename":"Marriott, Db2 for Travel and Transportation.pptx"},{"id":"s60","num":"60","badge":"","updatedAt":"2026-07-23","title":"Accelerated analytics deliver banking insights for Garanti BBVA","client":"Garanti BBVA","industry":"Financial Services","products":["IBM Db2"],"region":"EMEA","usecase":"Database Modernisation","summary":"Garanti BBVA implemented the IBM Db2 Analytics Accelerator for z/OS to offload complex analytics from mainframes, accelerating delivery of business insights and reducing CPU usage without disrupting operations.","metrics":["300+ reporting processes accelerated","Reduced mainframe CPU usage","Faster delivery of compliance and business insights"],"pdfPath":"ppts/presentation-32.pptx","pdfFilename":"Garanti, Faster analytical workloads & boosted mainframe efficiency.pptx"},{"id":"s61","num":"61","badge":"","updatedAt":"2026-07-23","title":"DB2 in Modern Data & AI Architectures — IBM Global Chief Data Office","client":"IBM (Internal - Global Chief Data Office)","industry":"Technology","products":["IBM Db2"],"region":"Global","usecase":"Database Modernisation","summary":"IBM's Global Chief Data Office implemented IBM Db2 Big SQL within IBM Cloud Pak for Data to analyse large, centralised datasets, enabling faster analytics, governance, and insight generation across the enterprise.","metrics":["Faster data loading for hundreds-of-millions-row tables","Centralised governed analytics at scale"],"pdfPath":"ppts/presentation-33.pptx","pdfFilename":"IBM, DB2 in Modern Data & AI Architectures  .pptx"},{"id":"bob01","num":"Bob 01","badge":"new","updatedAt":"2025-07-01","title":"The New Pace of Modernization","client":"Blue Pearl","industry":"Technology","products":["IBM Bob"],"region":"Global","usecase":"Application Modernization","summary":"Blue Pearl, a South African IT consultancy and IBM partner, used IBM Bob to modernize a client-facing Java application, resolving 127 deprecated APIs, upgrading from Java 11 to Java 21, and generating 92% automated test coverage from zero in ~3 days vs. 30+ developer days.","metrics":["90% faster delivery (~3 days vs. 30+ developer days)","92% automated test coverage from zero","127 deprecated APIs resolved"],"pdfPath":"ppts/presentation-34.pptx","pdfFilename":"blue pearl, IBM Bob.pptx"},{"id":"bob02","num":"Bob 02","badge":"new","updatedAt":"2025-07-01","title":"Tackling Architectural Complexity and Legacy Constraints","client":"APIS IT","industry":"Technology","products":["IBM Bob"],"region":"EMEA","usecase":"Application Modernization","summary":"APIS IT used IBM Bob to modernize mission-critical systems across JCL/PL/I, Java, EGL/CICS, and .NET, transforming a SOAP service into a modern .NET 8 REST API in hours instead of weeks, with 100% operator-verified accuracy in Croatian language documentation.","metrics":["100% operator-verified accuracy in Croatian language documentation","10x faster documentation for a 20-year-old EGL/CICS system","SOAP service modernized to .NET 8 REST API in hours vs. weeks"],"pdfPath":"ppts/presentation-35.pptx","pdfFilename":"APIS IT, IBM Bob.pptx"},{"id":"bob03","num":"Bob 03","badge":"new","updatedAt":"2025-07-01","title":"Scaling FileNet Configuration Management with IBM Bob","client":"Novadoc","industry":"Technology","products":["IBM Bob","IBM FileNet"],"region":"Global","usecase":"Application Modernization","summary":"Novadoc used IBM Bob to transform a manual, error-prone FileNet configuration management process into a reusable, scalable solution — delivering a working application in a single weekend, with automated comparisons, approval workflows, and rollback mechanisms.","metrics":["Working application built in a single weekend","Reduced risk of configuration drift and production errors","Automated governed workflow from extraction to deployment"],"pdfPath":"ppts/presentation-36.pptx","pdfFilename":"Novadoc, IBM Bob.pptx"},{"id":"bob04","num":"Bob 04","badge":"new","updatedAt":"2025-07-01","title":"Simplifying Modernization Across Complex Legacy Environments","client":"Novacomp","industry":"Technology","products":["IBM Bob"],"region":"Americas","usecase":"Application Modernization","summary":"Novacomp used IBM Bob to modernize a business-critical Java REST API, completing the upgrade in 2 days vs. several months, with structured, transparent and validated changes that preserved existing business logic and API contracts.","metrics":["98% faster modernization (2 days vs. several months)","Lower migration risk through structured validated changes","Improved maintainability with modernized architecture"],"pdfPath":"ppts/presentation-37.pptx","pdfFilename":"Novacomp, IBM Bob.pptx"},{"id":"bob05","num":"Bob 05","badge":"new","updatedAt":"2025-07-01","title":"Accelerating Platform Evolution at Global Scale","client":"EY Tax Americas","industry":"Financial Services","products":["IBM Bob"],"region":"Americas","usecase":"Application Modernization","summary":"EY Tax Americas used IBM Bob to accelerate evolution of its global tax platforms, achieving 100% architecture compliance for generated components, a 60% reduction in logic implementation effort, and production adoption in just 4 weeks from pilot.","metrics":["100% architecture compliance for generated components","60% reduction in logic implementation effort","4 weeks from pilot to production adoption"],"pdfPath":"ppts/presentation-38.pptx","pdfFilename":"EY, IBM Bob.pptx"},{"id":"bob06","num":"Bob 06","badge":"new","updatedAt":"2025-07-01","title":"Rapid Ransomware Recovery and AI-Driven Modernization on IBM i","client":"M.R. Williams","industry":"Manufacturing","products":["IBM Bob","IBM i"],"region":"Americas","usecase":"Application Modernization","summary":"After recovering from a ransomware attack, M.R. Williams is modernizing its IBM i environment with IBM Bob — using AI to analyze RPG code, automate documentation, and streamline development, achieving 18x faster RPG analysis and documentation.","metrics":["18x faster RPG analysis and documentation","Accelerated modernization of mission-critical IBM i applications","Uninterrupted operations maintained during ransomware incident"],"pdfPath":"ppts/presentation-39.pptx","pdfFilename":"M.R. Williams, IBM Bob.pptx"},{"id":"bob07","num":"Bob 07","badge":"new","updatedAt":"2025-07-01","title":"Accelerate IBM i Modernization with AI Powered Development","client":"MEDHOST","industry":"Healthcare","products":["IBM Bob","IBM i","IBM Power"],"region":"Americas","usecase":"Application Modernization","summary":"MEDHOST, a healthcare software provider, used IBM Bob to analyze and explain complex RPG code on IBM i, improving dependency visibility, reducing manual coding effort by 50%, and accelerating modernization while speeding up developer onboarding.","metrics":["50% reduction in manual coding effort","Rapid analysis of complex RPG logic and dependencies","Faster ramp-up for new developers"],"pdfPath":"ppts/presentation-40.pptx","pdfFilename":"Medhost, IBM Bob.pptx"},{"id":"bob08","num":"Bob 08","badge":"new","updatedAt":"2025-07-01","title":"Modernization at the Speed of Governance","client":"BNP Paribas","industry":"Financial Services","products":["IBM Bob"],"region":"EMEA","usecase":"Application Modernization","summary":"BNP Paribas used IBM Bob to accelerate application delivery and modernization at scale. A 20-person pilot rapidly expanded as business units self-onboarded, using Bob to build and modernize applications, decompose monoliths into microservices, and redesign legacy and mainframe documentation — all within a governed, regulated environment.","metrics":["Rapid self-service adoption across business units","End-to-end application delivery acceleration","Governance by design across software engineering lifecycle"],"pdfPath":"ppts/presentation-41.pptx","pdfFilename":"BNP Paribas, IBM Bob.pptx"},{"id":"bob09","num":"Bob 09","badge":"new","updatedAt":"2025-07-01","title":"Transform Legacy Content into a Modern Digital Experience","client":"Wimbledon (AELTC)","industry":"Sports & Entertainment","products":["IBM Bob","IBM watsonx"],"region":"EMEA","usecase":"Application Modernization","summary":"IBM Bob helped Wimbledon migrate 15,000+ interconnected digital content assets to a modern platform in 47 minutes. One engineer completed work traditionally requiring a team of 4–5 specialists, with full migration planning and execution in 4 weeks instead of months.","metrics":["15,000 assets migrated in 47 minutes","1 engineer replaced a team of 4–5 specialists","Migration completed in 4 weeks instead of months"],"pdfPath":"ppts/presentation-42.pptx","pdfFilename":"Wimbledon, IBM Bob.pptx"},{"id":"bob10","num":"Bob 10","badge":"new","updatedAt":"2025-07-01","title":"Modernizing Enterprise Data Access with IBM Bob and watsonx.data","client":"CrushBank","industry":"Technology","products":["IBM Bob","IBM watsonx.data","watsonx Orchestrate"],"region":"Global","usecase":"Application Modernization","summary":"CrushBank used IBM Bob and watsonx.data to unlock enterprise knowledge trapped in legacy systems, reducing project delivery timelines by 50%, cutting deployment to approximately 2 weeks, and completing proof-of-concepts in hours instead of weeks.","metrics":["50% reduction in project delivery timelines","Deployment timelines reduced to ~2 weeks","Proof-of-concepts completed in hours instead of weeks"],"pdfPath":"ppts/presentation-43.pptx","pdfFilename":"CrushBank, IBM Bob.pptx"},{"id":"bob11","num":"Bob 11","badge":"new","updatedAt":"2025-07-01","title":"Modernizing Legacy Systems with IBM Bob and watsonx Orchestrate","client":"MONO-X","industry":"Technology","products":["IBM Bob","watsonx Orchestrate","IBM Power Virtual Server"],"region":"AP","usecase":"Application Modernization","summary":"MONO-X integrated IBM Bob and watsonx Orchestrate to enable AI-driven operations and connect legacy COBOL-based systems with modern AI services, reducing AI environment provisioning from ~3 months to ~2 hours, cutting data center costs by 20%, and achieving 99% system uptime.","metrics":["AI environment provisioning reduced from ~3 months to ~2 hours","20% reduction in data center costs","99% system uptime achieved"],"pdfPath":"ppts/presentation-44.pptx","pdfFilename":"MONO-X, IBM Bob.pptx"},{"id":"bob12","num":"Bob 12","badge":"new","updatedAt":"2025-07-01","title":"Accelerated Developer Productivity on IBM i","client":"Carreras Grupo Logistico","industry":"Technology","products":["IBM Bob","IBM i"],"region":"EMEA","usecase":"Application Modernization","summary":"Carreras Grupo Logistico piloted IBM Bob to embed AI into its IBM i development workflows, simplifying legacy RPG code analysis, automating documentation, and supporting refactoring — reducing time spent on legacy code, improving knowledge sharing, and accelerating development while maintaining system stability.","metrics":["Accelerated developer productivity and efficiency","Faster and lower-risk application modernization"],"pdfPath":"ppts/presentation-45.pptx","pdfFilename":"Carreras Grupo Logistico, IBM Bob.pptx"},{"id":"bob13","num":"Bob 13","badge":"new","updatedAt":"2025-07-01","title":"RPG Reverse Engineering: Accurate Design Documentation from 10-Year-Old Systems","client":"Jack Henry","industry":"Financial Services","products":["IBM Bob","IBM i"],"region":"Americas","usecase":"Application Modernization","summary":"Jack Henry participated in the IBM Bob preview program, identifying nearly 20 use cases spanning code generation, reverse engineering, documentation creation, and secure coding analysis. IBM Bob differentiated itself through deep RPG understanding and multi-stage lifecycle support, improving developer productivity by up to 25%.","metrics":["Up to 25% improvement in developer productivity","Improved code quality, security, and modernization efficiency","~20 use cases identified across the development lifecycle"],"pdfPath":"ppts/presentation-46.pptx","pdfFilename":"Jack Henry, IBM Bob.pptx"},{"id":"bob14","num":"Bob 14","badge":"new","updatedAt":"2025-07-01","title":"Real-Time Operations and AI-Assisted Development on IBM i","client":"Heartland Co-op","industry":"Manufacturing","products":["IBM Bob","IBM i","IBM Power"],"region":"Americas","usecase":"Application Modernization","summary":"Heartland Co-op's internal R&D lab built real-time IoT monitoring for grain, equipment, and field operations on IBM i. By piloting IBM Bob, the team is enhancing developer productivity, simplifying IBM i modernization, and accelerating innovation — including resolving a high-priority production bug in under an hour that would previously have taken multiple hours.","metrics":["High-priority production bug resolved in under 1 hour vs. multiple hours","Improved operational visibility and decision-making","Higher grain quality and asset reliability"],"pdfPath":"ppts/presentation-47.pptx","pdfFilename":"Heartland Co-op, IBM Bob.pptx"},{"id":"cf01","num":"CF 01","badge":"new","updatedAt":"2025-07-01","title":"10x Banking Delivers Cloud-Native, Hyper-Personalised Banking with Confluent","client":"10x Banking","industry":"Financial Technology","products":["Confluent"],"region":"EMEA","usecase":"Data Streaming & Integration","summary":"10x Banking modernised legacy bank infrastructure using Confluent Cloud's real-time data streaming platform, enabling traditional banks to innovate faster, deliver hyper-personalised customer experiences, and compete with digital-native challengers.","metrics":["10x more reliable and performant than self-managed Apache Kafka","Reduced TCO with simplified management","Faster time to market for traditional banks"],"pdfPath":"ppts/presentation-12.pptx","pdfFilename":"10x, Confluent.pptx"},{"id":"cf02","num":"CF 02","badge":"new","updatedAt":"2025-07-01","title":"Nationwide Building Society Builds Agility and Resilience with Confluent","client":"Nationwide Building Society","industry":"Financial Services","products":["Confluent"],"region":"EMEA","usecase":"Data Streaming & Integration","summary":"Nationwide adopted Confluent as the foundation for an event hub, enabling digital development team autonomy, removing ~7bn requests/year from legacy systems, and future-proofing against challenger bank competition.","metrics":["~7bn requests/year removed from legacy HPNS","Increased agility across multiple lines of business","Kafka streaming adopted across both top-down and bottom-up use cases"],"pdfPath":"ppts/presentation-38.pptx","pdfFilename":"Nationwide, Confluent.pptx"},{"id":"cf03","num":"CF 03","badge":"new","updatedAt":"2025-07-01","title":"SumUp Shifts to Decentralised Data Ownership with Confluent Cloud","client":"SumUp","industry":"Financial Technology","products":["Confluent"],"region":"EMEA","usecase":"Data Streaming & Integration","summary":"SumUp adopted Confluent Cloud to implement data mesh principles, removing bottlenecks and enabling 20+ teams to build reusable data products and power real-time analytics including fraud detection and merchant personalisation.","metrics":["20+ teams using streaming data for real-time analytics","Decentralised self-service data access enabled","Fraud detection and personalisation use cases unlocked"],"pdfPath":"","pdfFilename":""},{"id":"cf04","num":"CF 04","badge":"new","updatedAt":"2025-07-01","title":"Booking.com Offloads Kafka Complexity and Scales with Confluent Platform","client":"Booking.com","industry":"Travel & Hospitality","products":["Confluent"],"region":"EMEA","usecase":"Data Streaming & Integration","summary":"Booking.com migrated from self-managed Kafka to Confluent Platform, eliminating scaling and monitoring burdens and enabling event-driven architecture across marketing, payments, personalisation, and core booking workflows.","metrics":["Increased data platform reliability","Enhanced operational efficiency with out-of-the-box functionality","Better support for analytical workflows and event-driven architecture"],"pdfPath":"","pdfFilename":""},{"id":"cf05","num":"CF 05","badge":"new","updatedAt":"2025-07-01","title":"Wix Achieves Hyper-Scale Event-Driven Architecture with Confluent Cloud","client":"Wix","industry":"Technology","products":["Confluent"],"region":"EMEA","usecase":"Data Streaming & Integration","summary":"Wix replaced self-managed Kafka on AWS with Confluent Cloud to integrate 2,500+ microservices, accelerate developer velocity, and unlock real-time analytics and hyper-personalisation — significantly reducing platform downtime.","metrics":["2,500+ microservices integrated with reduced downtime","Increased developer velocity with pre-built integrations and Apache Flink","Scaled real-time analytics for product teams and end-users"],"pdfPath":"","pdfFilename":""},{"id":"cf06","num":"CF 06","badge":"new","updatedAt":"2025-07-01","title":"L'Oréal Bridges Public and Private Kafka Connectivity with Confluent","client":"L'Oréal","industry":"Manufacturing","products":["Confluent"],"region":"EMEA","usecase":"Data Streaming & Integration","summary":"L'Oréal used Confluent's Service Mesh Accelerator as a Kafka proxy to simultaneously support private and public connections to their event-driven platform, eliminating cumbersome procedures without additional infrastructure cost.","metrics":["No additional cost for dual connectivity","Eliminated cumbersome external team connection procedures","Simplified platform access for internal and external teams"],"pdfPath":"","pdfFilename":""},{"id":"cf07","num":"CF 07","badge":"new","updatedAt":"2025-07-01","title":"Sainsbury's Transforms Supply Chain with Confluent-Powered Data Streaming","client":"Sainsbury's","industry":"Retail","products":["Confluent"],"region":"EMEA","usecase":"Data Streaming & Integration","summary":"Sainsbury's chose Confluent as the data streaming backbone for its digital transformation, enabling real-time data streams, better forecasting, improved supply chain management, and seamless AWS integration — replacing costly self-managed Kafka clusters.","metrics":["Better forecasting and supply chain management","Real-time data streams across logistics systems","Fully managed platform replacing costly self-managed Kafka"],"pdfPath":"","pdfFilename":""},{"id":"cf08","num":"CF 08","badge":"new","updatedAt":"2025-07-01","title":"AO.com Drives 30% Higher Conversion with Real-Time Hyper-Personalisation","client":"AO.com","industry":"Retail","products":["Confluent"],"region":"EMEA","usecase":"Customer Experience","summary":"AO.com adopted event streaming with Confluent Cloud to respond to a shift from in-store to online retail, enabling real-time hyper-personalisation and accelerating delivery of new customer capabilities.","metrics":["Up to 30% increase in customer conversion rates","Faster pace of innovation","Developer focus shifted from operations to value-add features"],"pdfPath":"","pdfFilename":""}];

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

function StoryCard({ story, isStarred, onToggleStar, isAdmin, onUpload }) {
  const c = INDUSTRY_COLORS[story.industry] || { bg: '#f4f4f4', color: '#525252', icon: '📄' };
  const fileInputRef = React.useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(story.id, file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {story.pdfPath && (
            <button
              style={styles.btnOnePager}
              onClick={() => downloadFile(story.pdfPath, story.pdfFilename)}
            >
              ⬇ One-Pager
            </button>
          )}
          {isAdmin && (
            <>
              <button
                style={styles.btnUpload}
                onClick={handleUploadClick}
                title="Upload one-pager"
              >
                ⬆ Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pptx,.pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>
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
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin-manager';
  
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [filters, setFilters] = useState({ industry: [], product: [], usecase: [] });
  const [starred, setStarred] = useState(getStoredStarred);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        const elem = document.querySelector('[data-client-stories-root]');
        if (!elem) return;
        
        if (elem.requestFullscreen && !document.fullscreenElement) {
          await elem.requestFullscreen();
          setIsFullscreen(true);
        } else if (elem.webkitRequestFullscreen && !document.webkitFullscreenElement) {
          await elem.webkitRequestFullscreen();
          setIsFullscreen(true);
        }
      } catch (err) {
        console.log('Fullscreen not available:', err.message);
      }
    };
    
    enterFullscreen();
  }, []);

  const handleFullscreenToggle = async () => {
    try {
      if (isFullscreen) {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else if (document.webkitFullscreenElement) {
          document.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      } else {
        const elem = document.querySelector('[data-client-stories-root]');
        if (!elem) return;
        
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

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

  const handleUpload = async (storyId, file) => {
    if (!isAdmin) return;
    
    try {
      const result = await uploadClientStoryFile(storyId, file);
      alert(`✓ File uploaded successfully!\n\nFile: ${result.fileName}\nSize: ${(result.size / 1024).toFixed(2)} KB\nURL: ${result.url}`);
      console.log('Upload result:', result);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + err.message);
    }
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
    <div style={styles.root} data-client-stories-root>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.ibmLogo}>IBM</span>
          <span style={styles.headerDivider} />
          <span style={styles.headerTitle}>Client Stories</span>
        </div>
        <button
          onClick={handleFullscreenToggle}
          style={styles.fullscreenBtn}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>
      </div>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        <div style={styles.statsContent}>
          <span style={styles.statsLabel}>A curated library of <strong>IBM Data &amp; AI</strong> client stories — filter by industry, product, or use case to find the right reference for any conversation.</span>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statNum}>{ALL_STORIES.length}</div>
              <div style={styles.statLbl}>STORIES</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNum}>{totalIndustries}</div>
              <div style={styles.statLbl}>INDUSTRIES</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNum}>{totalUseCases}</div>
              <div style={styles.statLbl}>USE CASES</div>
            </div>
          </div>
        </div>
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
                    <StoryCard key={s.id} story={s} isStarred={starred.includes(s.id)} onToggleStar={toggleStar} isAdmin={isAdmin} onUpload={handleUpload} />
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
                  <StoryCard key={s.id} story={s} isStarred={true} onToggleStar={toggleStar} isAdmin={isAdmin} onUpload={handleUpload} />
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
  header: { background: '#13161f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 40, borderBottom: '3px solid #0f62fe', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  ibmLogo: { fontSize: 16, fontWeight: 700, letterSpacing: 3 },
  headerDivider: { display: 'inline-block', width: 1, height: 20, background: 'rgba(255,255,255,0.25)' },
  headerTitle: { fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.7)' },
  fullscreenBtn: { background: 'transparent', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, transition: 'opacity 0.2s', opacity: 0.8, fontFamily: 'inherit' },
  statsBar: { background: '#13161f', color: '#fff', padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  statsContent: { display: 'flex', alignItems: 'center', gap: 40, flex: 1 },
  statsLabel: { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, flex: 1, maxWidth: 700 },
  statsGrid: { display: 'flex', gap: 40, marginLeft: 'auto' },
  statItem: { textAlign: 'center' },
  statNum: { fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 },
  statLbl: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginTop: 4 },
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
  card: { background: '#fff', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
  cardHeader: { padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardIndustry: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8, flex: 1 },
  starBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', lineHeight: 1, flexShrink: 0, opacity: 0.5 },
  cardBody: { padding: '16px 16px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: 800, color: '#161616', lineHeight: 1.4 },
  cardClient: { fontSize: 14, fontWeight: 700, color: '#0f62fe' },
  cardSummary: { fontSize: 13, color: '#424242', lineHeight: 1.65, flex: 1, fontWeight: 400 },
  cardMetrics: { display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 },
  cardMetric: { fontSize: 13, color: '#198038', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 },
  cardFooter: { padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' },
  cardDate: { fontSize: 12, color: '#999', fontWeight: 400 },
  btnOnePager: { background: '#0f62fe', color: '#fff', border: 'none', padding: '8px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnUpload: { background: '#24a148', color: '#fff', border: 'none', padding: '8px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
};

export default ClientStoriesTab;

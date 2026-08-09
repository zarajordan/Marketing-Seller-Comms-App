#!/usr/bin/env node

/**
 * Extract base64 PDFs from IBM_Client_Stories_export (4).json and upload to Supabase
 *
 * Usage: node extract-and-upload-pdfs.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zashpljcxjssogosxovf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_ANON_KEY not set in .env');
  console.error('Make sure SUPABASE_ANON_KEY is defined in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function extractAndUploadPDFs() {
  try {
    console.log('📖 Reading IBM_Client_Stories_export (4).json...');
    const jsonPath = path.join(__dirname, 'IBM_Client_Stories_export (4).json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`✅ Found ${jsonData.length} stories`);
    
    let uploaded = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const story of jsonData) {
      if (!story.pdfData) {
        console.log(`⏭️  Story "${story.title}" - no PDF data`);
        skipped++;
        continue;
      }
      
      try {
        // Extract base64 string
        const base64Match = story.pdfData.match(/base64,(.+)/);
        if (!base64Match) {
          console.log(`⏭️  Story "${story.title}" - invalid base64 format`);
          skipped++;
          continue;
        }
        
        const base64String = base64Match[1];
        const buffer = Buffer.from(base64String, 'base64');
        
        // Generate filename
        const fileName = `${story.id}_${story.client.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;
        const filePath = `client-story-pdfs/${fileName}`;
        
        console.log(`📤 Uploading: ${fileName} (${(buffer.length / 1024 / 1024).toFixed(2)}MB)...`);
        
        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from('story-files')
          .upload(filePath, buffer, {
            contentType: 'application/pdf',
            upsert: false,
          });
        
        if (error) {
          console.log(`❌ Failed: ${story.title} - ${error.message}`);
          failed++;
          continue;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('story-files')
          .getPublicUrl(data.path);
        
        console.log(`✅ Uploaded: ${story.title}`);
        console.log(`   URL: ${publicUrl}\n`);
        uploaded++;
        
      } catch (err) {
        console.log(`❌ Error processing ${story.title}: ${err.message}`);
        failed++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Uploaded: ${uploaded}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📁 Total processed: ${jsonData.length}`);
    
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

// Run extraction
extractAndUploadPDFs();

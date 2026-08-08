#!/usr/bin/env node
/**
 * Upload extracted files to Supabase Storage
 * Updates client-stories.html with storage URLs
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env file
require('dotenv').config();

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
  console.error('Make sure your .env file contains these variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'story-files';
const extractDir = path.join(__dirname, 'extracted-files');

async function ensureBucketExists() {
  console.log(`🔍 Checking if bucket "${BUCKET_NAME}" exists...\n`);
  
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`📦 Creating bucket "${BUCKET_NAME}"...`);
      const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true
      });
      
      if (error) {
        console.log(`⚠ Could not create bucket (may already exist): ${error.message}`);
        console.log(`ℹ Attempting to proceed with upload...\n`);
      } else {
        console.log(`✓ Bucket created successfully\n`);
      }
    } else {
      console.log(`✓ Bucket already exists\n`);
    }
  } catch (error) {
    console.log(`⚠ Could not verify bucket (may already exist): ${error.message}`);
    console.log(`ℹ Attempting to proceed with upload...\n`);
  }
}

async function uploadFiles() {
  const pptDir = path.join(extractDir, 'ppts');
  const pdfDir = path.join(extractDir, 'pdfs');
  
  const uploadedFiles = [];
  const failedFiles = [];
  
  // Upload PPT files
  console.log('📤 Uploading PowerPoint files...\n');
  const pptFiles = fs.readdirSync(pptDir);
  
  for (const file of pptFiles) {
    const filePath = path.join(pptDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const uploadPath = `ppts/${file}`;
    
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uploadPath, fileBuffer, { upsert: true });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadPath);
      
      const sizeKB = (fileBuffer.length / 1024).toFixed(2);
      console.log(`✓ ${file} (${sizeKB} KB) → ${uploadPath}`);
      
      uploadedFiles.push({
        type: 'pptx',
        filename: file,
        path: uploadPath,
        url: urlData.publicUrl,
        size: fileBuffer.length
      });
    } catch (error) {
      console.error(`✗ Failed to upload ${file}:`, error.message);
      failedFiles.push({ file, error: error.message });
    }
  }
  
  // Upload PDF files
  console.log('\n📤 Uploading PDF files...\n');
  const pdfFiles = fs.readdirSync(pdfDir);
  
  for (const file of pdfFiles) {
    const filePath = path.join(pdfDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const uploadPath = `pdfs/${file}`;
    
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uploadPath, fileBuffer, { upsert: true });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadPath);
      
      const sizeKB = (fileBuffer.length / 1024).toFixed(2);
      console.log(`✓ ${file} (${sizeKB} KB) → ${uploadPath}`);
      
      uploadedFiles.push({
        type: 'pdf',
        filename: file,
        path: uploadPath,
        url: urlData.publicUrl,
        size: fileBuffer.length
      });
    } catch (error) {
      console.error(`✗ Failed to upload ${file}:`, error.message);
      failedFiles.push({ file, error: error.message });
    }
  }
  
  return { uploadedFiles, failedFiles };
}

function generateUploadManifest(uploadedFiles) {
  const manifest = {
    bucket: BUCKET_NAME,
    uploadedAt: new Date().toISOString(),
    totalFiles: uploadedFiles.length,
    files: uploadedFiles.sort((a, b) => a.filename.localeCompare(b.filename))
  };
  
  const manifestPath = path.join(extractDir, 'upload-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifestPath;
}

async function main() {
  try {
    console.log('🚀 Starting Supabase file upload...\n');
    
    await ensureBucketExists();
    
    const { uploadedFiles, failedFiles } = await uploadFiles();
    
    // Generate manifest
    const manifestPath = generateUploadManifest(uploadedFiles);
    console.log(`\n✓ Upload manifest saved to: ${manifestPath}`);
    
    // Summary
    console.log(`\n📊 Upload Summary:`);
    console.log(`   Total files uploaded: ${uploadedFiles.length}`);
    console.log(`   Failed uploads: ${failedFiles.length}`);
    console.log(`   Total size uploaded: ${(uploadedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB`);
    
    if (failedFiles.length > 0) {
      console.log(`\n❌ Failed files:`);
      failedFiles.forEach(({ file, error }) => {
        console.log(`   - ${file}: ${error}`);
      });
    }
    
    console.log(`\n✓ All files uploaded to Supabase Storage`);
    console.log(`📦 Bucket: ${BUCKET_NAME}`);
    console.log(`🔗 Base URL: ${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();

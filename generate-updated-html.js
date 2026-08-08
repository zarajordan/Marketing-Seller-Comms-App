#!/usr/bin/env node
/**
 * Generate updated client-stories.html with Supabase Storage URLs
 * Replaces all embedded pdfData with pdfPath references
 */

const fs = require('fs');
const path = require('path');

// Load .env file
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
  console.error('❌ Error: SUPABASE_URL environment variable is required');
  process.exit(1);
}

const manifestPath = path.join(__dirname, 'extracted-files', 'upload-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Error: upload-manifest.json not found. Run upload-to-supabase.js first');
  process.exit(1);
}

const originalHtmlPath = path.join(__dirname, 'public', 'client-stories.html');
const originalHtml = fs.readFileSync(originalHtmlPath, 'utf8');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('🔄 Generating updated HTML with Supabase Storage URLs...\n');

// Create a map of base64 hashes to storage URLs
// This is done by comparing file sizes since we have the original data
const bucket = manifest.bucket;
const baseStorageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}`;

// Extract all embedded data URIs and their metadata
const dataUriRegex = /pdfData:\s*"(data:application\/(?:vnd\.openxmlformats-officedocument\.presentationml\.presentation|pdf);base64,[^"]+)"/g;
const embeddings = [];
let match;

console.log('📊 Scanning embedded files:\n');

while ((match = dataUriRegex.exec(originalHtml)) !== null) {
  const dataUri = match[1];
  const base64Data = dataUri.split(',')[1];
  const sizeBytes = Math.floor(base64Data.length * 0.75); // Approximate decoded size
  
  embeddings.push({
    dataUri,
    base64DataLength: base64Data.length,
    sizeBytes,
    index: match.index
  });
}

console.log(`Found ${embeddings.length} embedded files\n`);

// Try to match with manifest files by size (with tolerance)
const matchedFiles = [];
const unmatchedEmbeddings = [...embeddings];

console.log('🔗 Matching files with manifest:\n');

for (const embedding of embeddings) {
  // Find best match in manifest
  let bestMatch = null;
  let bestDifference = Infinity;
  
  for (const manifestFile of manifest.files) {
    const difference = Math.abs(embedding.sizeBytes - manifestFile.size);
    
    // Allow 5% tolerance
    if (difference < manifestFile.size * 0.05 && difference < bestDifference) {
      bestMatch = manifestFile;
      bestDifference = difference;
    }
  }
  
  if (bestMatch) {
    matchedFiles.push({
      embedding,
      file: bestMatch
    });
    unmatchedEmbeddings.splice(unmatchedEmbeddings.indexOf(embedding), 1);
    console.log(`✓ ${bestMatch.filename} (${(bestMatch.size / 1024).toFixed(0)} KB)`);
  }
}

if (unmatchedEmbeddings.length > 0) {
  console.log(`\n⚠ Could not match ${unmatchedEmbeddings.length} embedded files to manifest`);
  console.log('These will remain as embedded files');
}

// Replace embedded data URIs with storage paths
let updatedHtml = originalHtml;
let replacementCount = 0;

for (const { embedding, file } of matchedFiles) {
  // Replace the data URI with a storage path
  // Format: pdfPath: "path/to/file"
  const oldPattern = `pdfData: "${embedding.dataUri}"`;
  const newPattern = `pdfPath: "${file.path}"`;
  
  if (updatedHtml.includes(oldPattern)) {
    updatedHtml = updatedHtml.replace(oldPattern, newPattern);
    replacementCount++;
  } else {
    console.warn(`⚠ Pattern not found for ${file.filename}`);
  }
}

console.log(`\n✅ Replaced ${replacementCount} embedded files with storage paths`);

// Save updated HTML
const outputPath = path.join(__dirname, 'public', 'client-stories.html');
const backupPath = path.join(__dirname, 'public', 'client-stories-backup.html');

// Create backup of original
if (fs.existsSync(outputPath)) {
  fs.copyFileSync(outputPath, backupPath);
  console.log(`\n✓ Backup created: ${backupPath}`);
}

fs.writeFileSync(outputPath, updatedHtml, 'utf8');
console.log(`✓ Updated file saved: ${outputPath}`);

// Generate summary
const summary = {
  updatedAt: new Date().toISOString(),
  embeddedFilesProcessed: embeddings.length,
  filesMatched: matchedFiles.length,
  filesNotMatched: unmatchedEmbeddings.length,
  replacementsMade: replacementCount,
  supabaseUrl,
  bucket,
  baseStorageUrl,
  filesReplaced: matchedFiles.map(m => ({
    filename: m.file.filename,
    path: m.file.path,
    url: m.file.url
  }))
};

const summaryPath = path.join(__dirname, 'extracted-files', 'html-update-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log(`✓ Summary saved: ${summaryPath}`);

console.log(`\n📋 Next steps:`);
console.log(`1. Run: npm run build`);
console.log(`2. Review the changes in docs/client-stories.html`);
console.log(`3. Commit and push to GitHub`);
console.log(`4. GitHub Pages will deploy with the new Supabase storage URLs`);

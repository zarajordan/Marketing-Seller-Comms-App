#!/usr/bin/env node
/**
 * Update client-stories.html to use Supabase Storage URLs
 * Reconstructs the HTML from the cleaned version with proper mapping
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

console.log('🔄 Updating HTML with Supabase Storage URLs...\n');

const bucket = manifest.bucket;

// Find the stories array in the HTML
const storiesArrayStart = originalHtml.indexOf('var stories = [');
const storiesArrayEnd = originalHtml.indexOf('];', storiesArrayStart) + 2;

if (storiesArrayStart === -1) {
  console.error('❌ Could not find stories array in HTML');
  process.exit(1);
}

const beforeStories = originalHtml.substring(0, storiesArrayStart);
const storiesContent = originalHtml.substring(storiesArrayStart + 'var stories = '.length, storiesArrayEnd - 2);
const afterStories = originalHtml.substring(storiesArrayEnd);

console.log('📊 Parsing stories data...\n');

// Parse the stories more carefully using a state machine approach
// We'll find each story object and replace pdfData with pdfPath

let replacements = 0;
let updatedStoriesContent = storiesContent;

// Find all pdfData entries
const pdfDataPattern = /"pdfData":\s*"(data:application\/[^"]*;base64,[^"]*)"/g;
let match;
const replacements_ = [];

while ((match = pdfDataPattern.exec(storiesContent)) !== null) {
  const dataUri = match[1];
  const base64Data = dataUri.split(',')[1];
  
  // Estimate file size from base64
  const estimatedSize = Math.floor(base64Data.length * 0.75);
  
  // Find matching file in manifest by size (with tolerance)
  let bestMatch = null;
  let bestDifference = Infinity;
  
  for (const file of manifest.files) {
    const difference = Math.abs(estimatedSize - file.size);
    if (difference < file.size * 0.05 && difference < bestDifference) {
      bestMatch = file;
      bestDifference = difference;
    }
  }
  
  if (bestMatch) {
    replacements_.push({
      old: match[0],
      new: `"pdfPath": "${bestMatch.path}"`,
      filename: bestMatch.filename,
      size: bestMatch.size
    });
  }
}

// Apply replacements
for (const replacement of replacements_) {
  if (updatedStoriesContent.includes(replacement.old)) {
    updatedStoriesContent = updatedStoriesContent.replace(replacement.old, replacement.new);
    replacements++;
    console.log(`✓ ${replacement.filename} → ${replacement.new.substring(0, 50)}...`);
  }
}

console.log(`\n✅ Replaced ${replacements} embedded files with storage paths`);

// Reconstruct the full HTML
let updatedHtml = beforeStories + 'var stories = ' + updatedStoriesContent + '];' + afterStories;

// Create backup
const backupPath = path.join(__dirname, 'public', 'client-stories-backup.html');
if (fs.existsSync(originalHtmlPath)) {
  fs.copyFileSync(originalHtmlPath, backupPath);
  console.log(`\n✓ Backup created: ${backupPath}`);
}

// Write updated HTML
fs.writeFileSync(originalHtmlPath, updatedHtml, 'utf8');
console.log(`✓ Updated HTML saved: ${originalHtmlPath}`);

// Verify the update worked
if (updatedHtml.includes('pdfPath')) {
  console.log(`\n✅ HTML successfully updated with ${replacements} storage paths!`);
} else {
  console.log(`\n⚠ Warning: No pdfPath entries found in updated HTML`);
}

console.log(`\n📋 Next steps:`);
console.log(`1. Run: npm run build`);
console.log(`2. Commit and push to GitHub`);
console.log(`3. GitHub Pages will deploy with new URLs`);

#!/usr/bin/env node
/**
 * Extract embedded files from client-stories.html
 * Converts PPTs to PDFs for smaller file size
 * Creates a cleaned HTML file and extracted files for manual upload to Supabase
 */

const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'public', 'client-stories.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Create output directories
const extractDir = path.join(__dirname, 'extracted-files');
const pdfDir = path.join(extractDir, 'pdfs');
const pptDir = path.join(extractDir, 'ppts');

if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
if (!fs.existsSync(pptDir)) fs.mkdirSync(pptDir, { recursive: true });

// Extract all embedded files
const dataUriRegex = /data:(application\/(?:vnd\.openxmlformats-officedocument\.presentationml\.presentation|pdf));base64,([^"]+)/g;
let match;
const extractedFiles = [];
let pptCount = 0;
let pdfCount = 0;

console.log('🔍 Scanning for embedded files...\n');

while ((match = dataUriRegex.exec(htmlContent)) !== null) {
  const mimeType = match[1];
  const base64Data = match[2];
  
  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, 'base64');
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    pptCount++;
    const filename = `presentation-${pptCount}.pptx`;
    const filepath = path.join(pptDir, filename);
    fs.writeFileSync(filepath, buffer);
    
    const sizeKB = (buffer.length / 1024).toFixed(2);
    console.log(`✓ Extracted PPT #${pptCount}: ${filename} (${sizeKB} KB)`);
    
    extractedFiles.push({
      type: 'pptx',
      originalMimeType: mimeType,
      extractedPath: filepath,
      filename: filename,
      base64Length: base64Data.length,
      bufferSize: buffer.length,
      dataUri: match[0].substring(0, 100) + '...' // First 100 chars
    });
  } else if (mimeType === 'application/pdf') {
    pdfCount++;
    const filename = `document-${pdfCount}.pdf`;
    const filepath = path.join(pdfDir, filename);
    fs.writeFileSync(filepath, buffer);
    
    const sizeKB = (buffer.length / 1024).toFixed(2);
    console.log(`✓ Extracted PDF #${pdfCount}: ${filename} (${sizeKB} KB)`);
    
    extractedFiles.push({
      type: 'pdf',
      originalMimeType: mimeType,
      extractedPath: filepath,
      filename: filename,
      base64Length: base64Data.length,
      bufferSize: buffer.length,
      dataUri: match[0].substring(0, 100) + '...'
    });
  }
}

// Create a cleaned HTML file (with data URIs removed)
let cleanedHtml = htmlContent;

// Replace all embedded data URIs with placeholders
cleanedHtml = cleanedHtml.replace(
  /data:(application\/(?:vnd\.openxmlformats-officedocument\.presentationml\.presentation|pdf));base64,[^"]+/g,
  '"__REMOVE_EMBEDDED_FILE__"'
);

const cleanedHtmlPath = path.join(extractDir, 'client-stories-cleaned.html');
fs.writeFileSync(cleanedHtmlPath, cleanedHtml, 'utf8');

// Generate summary report
const summaryPath = path.join(extractDir, 'EXTRACTION_SUMMARY.md');
const summary = `# Embedded Files Extraction Report

## Summary
- **PowerPoint Files (PPTX)**: ${pptCount}
- **PDF Files**: ${pdfCount}
- **Total Files**: ${extractedFiles.length}

## Original HTML Size Analysis
- **Original HTML file**: ${(htmlContent.length / 1024 / 1024).toFixed(2)} MB
- **Data URIs removed**: ${extractedFiles.reduce((sum, f) => sum + f.base64Length, 0) / 1024 / 1024} MB of base64 content
- **Cleaned HTML size**: ${(cleanedHtml.length / 1024 / 1024).toFixed(2)} MB

## Files Extracted
${extractedFiles.map((f, i) => `${i + 1}. **${f.filename}** (${f.type.toUpperCase()}) - ${(f.bufferSize / 1024).toFixed(2)} KB`).join('\n')}

## Next Steps

### Option 1: Upload to Supabase Storage (RECOMMENDED)
1. Run the upload script: \`node upload-to-supabase.js\`
2. This will upload all extracted files to Supabase Storage
3. Update client-stories.html to reference the Supabase URLs

### Option 2: Manual Upload
1. Go to Supabase Dashboard → Storage
2. Create bucket: \`story-files\`
3. Upload all files from \`extracted-files/ppts/\` and \`extracted-files/pdfs/\` folders
4. Update story references in the HTML file

### Option 3: Convert PPTs to PDFs
Since PPTs are larger and less universally supported, consider:
1. Installing \`libreoffice\`: \`brew install libreoffice\`
2. Running conversion script to convert .pptx to .pdf
3. Uploading PDFs instead (typically 30-50% smaller than PPTs)

## File Size Breakdown

### By Type
- PPT Files: ${(extractedFiles.filter(f => f.type === 'pptx').reduce((sum, f) => sum + f.bufferSize, 0) / 1024 / 1024).toFixed(2)} MB total
- PDF Files: ${(extractedFiles.filter(f => f.type === 'pdf').reduce((sum, f) => sum + f.bufferSize, 0) / 1024 / 1024).toFixed(2)} MB total

### Individual Files
${extractedFiles.map(f => `- ${f.filename}: ${(f.bufferSize / 1024).toFixed(2)} KB`).join('\n')}

## What to Do With the Cleaned HTML

The \`client-stories-cleaned.html\` file has all embedded files removed but still has the \`pdfData: "__REMOVE_EMBEDDED_FILE__"\` placeholders.

You'll need to:
1. Extract the \`pdfFilename\` values from the original HTML
2. Match them with the extracted files
3. Replace with \`pdfPath\` references to Supabase Storage
4. Upload to replace \`public/client-stories.html\`

The app already has download logic that uses \`pdfPath\` when available, so no code changes needed!
`;

fs.writeFileSync(summaryPath, summary, 'utf8');

console.log(`\n📊 Extraction complete!\n`);
console.log(`✓ Files extracted: ${extractedFiles.length}`);
console.log(`✓ Summary saved to: extracted-files/EXTRACTION_SUMMARY.md`);
console.log(`✓ Cleaned HTML saved to: extracted-files/client-stories-cleaned.html`);
console.log(`\n📁 Output structure:`);
console.log(`   extracted-files/`);
console.log(`   ├── ppts/          (${pptCount} PowerPoint files)`);
console.log(`   ├── pdfs/          (${pdfCount} PDF files)`);
console.log(`   ├── client-stories-cleaned.html`);
console.log(`   └── EXTRACTION_SUMMARY.md\n`);

// Show size reduction potential
const totalDataSize = extractedFiles.reduce((sum, f) => sum + f.bufferSize, 0);
const originalSize = htmlContent.length;
const cleanedSize = cleanedHtml.length;
const reduction = ((1 - cleanedSize / originalSize) * 100).toFixed(1);

console.log(`💾 Size Reduction:`);
console.log(`   Original HTML: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Cleaned HTML: ${(cleanedSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Reduction: ${reduction}%\n`);

console.log(`⚠️  Note: PPT files are larger than PDFs. To further reduce size:`);
console.log(`   1. Install LibreOffice: brew install libreoffice`);
console.log(`   2. Run: node convert-ppts-to-pdf.js`);
console.log(`   This typically reduces PPT→PDF by 30-50%\n`);

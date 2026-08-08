#!/bin/bash
# Master script to upload extracted files to Supabase and update HTML

set -e

echo "🚀 IBM Marketing Hub - File Upload & Update Process"
echo "====================================================="
echo ""

# Check environment variables
if [ -z "$SUPABASE_URL" ]; then
  echo "❌ Error: SUPABASE_URL environment variable not set"
  echo "Please load your .env file: source .env"
  exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ Error: SUPABASE_ANON_KEY environment variable not set"
  echo "Please load your .env file: source .env"
  exit 1
fi

echo "✓ Environment variables loaded"
echo "✓ Supabase URL: $SUPABASE_URL"
echo ""

# Check if extracted files exist
if [ ! -d "extracted-files/ppts" ] || [ ! -d "extracted-files/pdfs" ]; then
  echo "❌ Error: extracted-files directory not found"
  echo "Please run: node extract-and-optimize-files.js"
  exit 1
fi

echo "📦 Files to upload:"
echo "   PPTs: $(ls extracted-files/ppts | wc -l) files"
echo "   PDFs: $(ls extracted-files/pdfs | wc -l) files"
echo ""

# Step 1: Upload to Supabase
echo "Step 1️⃣  Uploading files to Supabase Storage..."
echo "---"
node upload-to-supabase.js

if [ ! -f "extracted-files/upload-manifest.json" ]; then
  echo "❌ Upload failed - manifest not created"
  exit 1
fi

echo ""
echo "✓ Upload complete!"
echo ""

# Step 2: Generate updated HTML
echo "Step 2️⃣  Updating HTML with Supabase Storage URLs..."
echo "---"
node generate-updated-html.js

if [ ! -f "public/client-stories.html" ]; then
  echo "❌ HTML generation failed"
  exit 1
fi

echo ""
echo "✓ HTML updated!"
echo ""

# Step 3: Build for production
echo "Step 3️⃣  Building for production..."
echo "---"
npm run build

echo ""
echo "✓ Build complete!"
echo ""

# Step 4: Summary
echo "📊 Summary"
echo "=========="
echo "✓ Extracted files uploaded to Supabase Storage"
echo "✓ HTML updated with storage URLs"
echo "✓ Production build complete"
echo ""
echo "🔍 Review the changes:"
echo "   - Backup: public/client-stories-backup.html"
echo "   - Updated: public/client-stories.html"
echo "   - Build output: docs/"
echo ""
echo "📤 Ready to deploy:"
echo "   git add ."
echo "   git commit -m 'Remove embedded files, use Supabase Storage'"
echo "   git push origin main"
echo ""
echo "✅ All done! Your app is ready for deployment."

# Embedded Files Extraction Report

## Summary
- **PowerPoint Files (PPTX)**: 47
- **PDF Files**: 28
- **Total Files**: 75

## Original HTML Size Analysis
- **Original HTML file**: 133.68 MB
- **Data URIs removed**: 133.53912353515625 MB of base64 content
- **Cleaned HTML size**: 0.14 MB

## Files Extracted
1. **presentation-1.pptx** (PPTX) - 2111.25 KB
2. **presentation-2.pptx** (PPTX) - 2410.61 KB
3. **presentation-3.pptx** (PPTX) - 297.14 KB
4. **presentation-4.pptx** (PPTX) - 237.88 KB
5. **presentation-5.pptx** (PPTX) - 2507.48 KB
6. **presentation-6.pptx** (PPTX) - 2287.79 KB
7. **presentation-7.pptx** (PPTX) - 500.70 KB
8. **presentation-8.pptx** (PPTX) - 234.33 KB
9. **presentation-9.pptx** (PPTX) - 702.35 KB
10. **document-1.pdf** (PDF) - 234.37 KB
11. **document-2.pdf** (PDF) - 204.14 KB
12. **document-3.pdf** (PDF) - 196.64 KB
13. **document-4.pdf** (PDF) - 170.15 KB
14. **document-5.pdf** (PDF) - 191.36 KB
15. **document-6.pdf** (PDF) - 198.75 KB
16. **document-7.pdf** (PDF) - 189.34 KB
17. **document-8.pdf** (PDF) - 267.65 KB
18. **document-9.pdf** (PDF) - 191.20 KB
19. **document-10.pdf** (PDF) - 287.33 KB
20. **document-11.pdf** (PDF) - 233.47 KB
21. **document-12.pdf** (PDF) - 279.95 KB
22. **document-13.pdf** (PDF) - 281.48 KB
23. **document-14.pdf** (PDF) - 235.09 KB
24. **document-15.pdf** (PDF) - 179.54 KB
25. **document-16.pdf** (PDF) - 192.71 KB
26. **document-17.pdf** (PDF) - 309.10 KB
27. **document-18.pdf** (PDF) - 247.34 KB
28. **document-19.pdf** (PDF) - 230.41 KB
29. **document-20.pdf** (PDF) - 163.15 KB
30. **document-21.pdf** (PDF) - 161.37 KB
31. **document-22.pdf** (PDF) - 232.97 KB
32. **document-23.pdf** (PDF) - 146.10 KB
33. **document-24.pdf** (PDF) - 187.28 KB
34. **document-25.pdf** (PDF) - 313.03 KB
35. **document-26.pdf** (PDF) - 191.07 KB
36. **presentation-10.pptx** (PPTX) - 958.11 KB
37. **document-27.pdf** (PDF) - 155.82 KB
38. **document-28.pdf** (PDF) - 214.95 KB
39. **presentation-11.pptx** (PPTX) - 426.38 KB
40. **presentation-12.pptx** (PPTX) - 991.09 KB
41. **presentation-13.pptx** (PPTX) - 599.26 KB
42. **presentation-14.pptx** (PPTX) - 221.73 KB
43. **presentation-15.pptx** (PPTX) - 356.16 KB
44. **presentation-16.pptx** (PPTX) - 479.79 KB
45. **presentation-17.pptx** (PPTX) - 197.15 KB
46. **presentation-18.pptx** (PPTX) - 743.07 KB
47. **presentation-19.pptx** (PPTX) - 279.21 KB
48. **presentation-20.pptx** (PPTX) - 637.15 KB
49. **presentation-21.pptx** (PPTX) - 407.05 KB
50. **presentation-22.pptx** (PPTX) - 315.22 KB
51. **presentation-23.pptx** (PPTX) - 3502.22 KB
52. **presentation-24.pptx** (PPTX) - 2471.49 KB
53. **presentation-25.pptx** (PPTX) - 3251.79 KB
54. **presentation-26.pptx** (PPTX) - 2566.48 KB
55. **presentation-27.pptx** (PPTX) - 1228.13 KB
56. **presentation-28.pptx** (PPTX) - 2555.18 KB
57. **presentation-29.pptx** (PPTX) - 4551.01 KB
58. **presentation-30.pptx** (PPTX) - 2033.53 KB
59. **presentation-31.pptx** (PPTX) - 943.00 KB
60. **presentation-32.pptx** (PPTX) - 873.06 KB
61. **presentation-33.pptx** (PPTX) - 3883.19 KB
62. **presentation-34.pptx** (PPTX) - 7319.91 KB
63. **presentation-35.pptx** (PPTX) - 6297.46 KB
64. **presentation-36.pptx** (PPTX) - 557.55 KB
65. **presentation-37.pptx** (PPTX) - 3496.58 KB
66. **presentation-38.pptx** (PPTX) - 1704.99 KB
67. **presentation-39.pptx** (PPTX) - 1101.25 KB
68. **presentation-40.pptx** (PPTX) - 8769.33 KB
69. **presentation-41.pptx** (PPTX) - 2184.19 KB
70. **presentation-42.pptx** (PPTX) - 1158.15 KB
71. **presentation-43.pptx** (PPTX) - 9806.87 KB
72. **presentation-44.pptx** (PPTX) - 4024.29 KB
73. **presentation-45.pptx** (PPTX) - 1542.43 KB
74. **presentation-46.pptx** (PPTX) - 1452.37 KB
75. **presentation-47.pptx** (PPTX) - 1296.84 KB

## Next Steps

### Option 1: Upload to Supabase Storage (RECOMMENDED)
1. Run the upload script: `node upload-to-supabase.js`
2. This will upload all extracted files to Supabase Storage
3. Update client-stories.html to reference the Supabase URLs

### Option 2: Manual Upload
1. Go to Supabase Dashboard → Storage
2. Create bucket: `story-files`
3. Upload all files from `extracted-files/ppts/` and `extracted-files/pdfs/` folders
4. Update story references in the HTML file

### Option 3: Convert PPTs to PDFs
Since PPTs are larger and less universally supported, consider:
1. Installing `libreoffice`: `brew install libreoffice`
2. Running conversion script to convert .pptx to .pdf
3. Uploading PDFs instead (typically 30-50% smaller than PPTs)

## File Size Breakdown

### By Type
- PPT Files: 94.21 MB total
- PDF Files: 5.94 MB total

### Individual Files
- presentation-1.pptx: 2111.25 KB
- presentation-2.pptx: 2410.61 KB
- presentation-3.pptx: 297.14 KB
- presentation-4.pptx: 237.88 KB
- presentation-5.pptx: 2507.48 KB
- presentation-6.pptx: 2287.79 KB
- presentation-7.pptx: 500.70 KB
- presentation-8.pptx: 234.33 KB
- presentation-9.pptx: 702.35 KB
- document-1.pdf: 234.37 KB
- document-2.pdf: 204.14 KB
- document-3.pdf: 196.64 KB
- document-4.pdf: 170.15 KB
- document-5.pdf: 191.36 KB
- document-6.pdf: 198.75 KB
- document-7.pdf: 189.34 KB
- document-8.pdf: 267.65 KB
- document-9.pdf: 191.20 KB
- document-10.pdf: 287.33 KB
- document-11.pdf: 233.47 KB
- document-12.pdf: 279.95 KB
- document-13.pdf: 281.48 KB
- document-14.pdf: 235.09 KB
- document-15.pdf: 179.54 KB
- document-16.pdf: 192.71 KB
- document-17.pdf: 309.10 KB
- document-18.pdf: 247.34 KB
- document-19.pdf: 230.41 KB
- document-20.pdf: 163.15 KB
- document-21.pdf: 161.37 KB
- document-22.pdf: 232.97 KB
- document-23.pdf: 146.10 KB
- document-24.pdf: 187.28 KB
- document-25.pdf: 313.03 KB
- document-26.pdf: 191.07 KB
- presentation-10.pptx: 958.11 KB
- document-27.pdf: 155.82 KB
- document-28.pdf: 214.95 KB
- presentation-11.pptx: 426.38 KB
- presentation-12.pptx: 991.09 KB
- presentation-13.pptx: 599.26 KB
- presentation-14.pptx: 221.73 KB
- presentation-15.pptx: 356.16 KB
- presentation-16.pptx: 479.79 KB
- presentation-17.pptx: 197.15 KB
- presentation-18.pptx: 743.07 KB
- presentation-19.pptx: 279.21 KB
- presentation-20.pptx: 637.15 KB
- presentation-21.pptx: 407.05 KB
- presentation-22.pptx: 315.22 KB
- presentation-23.pptx: 3502.22 KB
- presentation-24.pptx: 2471.49 KB
- presentation-25.pptx: 3251.79 KB
- presentation-26.pptx: 2566.48 KB
- presentation-27.pptx: 1228.13 KB
- presentation-28.pptx: 2555.18 KB
- presentation-29.pptx: 4551.01 KB
- presentation-30.pptx: 2033.53 KB
- presentation-31.pptx: 943.00 KB
- presentation-32.pptx: 873.06 KB
- presentation-33.pptx: 3883.19 KB
- presentation-34.pptx: 7319.91 KB
- presentation-35.pptx: 6297.46 KB
- presentation-36.pptx: 557.55 KB
- presentation-37.pptx: 3496.58 KB
- presentation-38.pptx: 1704.99 KB
- presentation-39.pptx: 1101.25 KB
- presentation-40.pptx: 8769.33 KB
- presentation-41.pptx: 2184.19 KB
- presentation-42.pptx: 1158.15 KB
- presentation-43.pptx: 9806.87 KB
- presentation-44.pptx: 4024.29 KB
- presentation-45.pptx: 1542.43 KB
- presentation-46.pptx: 1452.37 KB
- presentation-47.pptx: 1296.84 KB

## What to Do With the Cleaned HTML

The `client-stories-cleaned.html` file has all embedded files removed but still has the `pdfData: "__REMOVE_EMBEDDED_FILE__"` placeholders.

You'll need to:
1. Extract the `pdfFilename` values from the original HTML
2. Match them with the extracted files
3. Replace with `pdfPath` references to Supabase Storage
4. Upload to replace `public/client-stories.html`

The app already has download logic that uses `pdfPath` when available, so no code changes needed!

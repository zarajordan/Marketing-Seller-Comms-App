# Outlook-Compatible Layout Preview

## 🎯 Goal
Ensure emails look consistent in Outlook regardless of reading pane width (when users drag the toolbar to resize).

---

## 📊 Current Layout vs. Proposed Layout

### **CURRENT LAYOUT** (Problematic)

```html
<!-- Current Structure -->
<div class="email-container" style="max-width: 600px;">
  <img src="banner.jpg" class="banner" style="width: 100%;">
  <div class="content" style="padding: 32px;">
    <h1>Title</h1>
    <p>Body text...</p>
    <img src="content.jpg" style="width: 100%;">
  </div>
</div>
```

**Issues:**
- ❌ `max-width: 600px` - Shrinks in narrow reading panes
- ❌ `width: 100%` on images - Can overflow or shrink unpredictably
- ❌ Div-based layout - Outlook renders differently than browsers
- ❌ Relative padding - Can cause misalignment

**What happens when reading pane is narrow:**
```
┌─────────────────┐  ← 600px container
│   BANNER        │  ← Shrinks to fit
│                 │
│  Title          │  ← Text reflows
│  Body text that │
│  wraps weird    │
│                 │
│ [Image shrinks] │  ← Becomes too small
└─────────────────┘
```

---

### **PROPOSED LAYOUT** (Outlook-Compatible)

```html
<!-- Proposed Structure -->
<table width="600" cellpadding="0" cellspacing="0" border="0" align="center">
  <tr>
    <td>
      <img src="banner.jpg" width="600" height="150" style="display:block;">
    </td>
  </tr>
  <tr>
    <td style="padding: 32px;">
      <h1>Title</h1>
      <p>Body text...</p>
      <img src="content.jpg" width="560" style="display:block;">
    </td>
  </tr>
</table>
```

**Benefits:**
- ✅ Fixed `width="600"` - Always 600px, never shrinks
- ✅ Explicit image dimensions - Prevents overflow
- ✅ Table-based layout - Outlook's native rendering method
- ✅ Fixed padding - Consistent spacing

**What happens when reading pane is narrow:**
```
┌──────────────────────┐  ← 600px container (fixed)
│      BANNER          │  ← Always 600px wide
│                      │
│  Title               │  ← Text stays aligned
│  Body text maintains │
│  proper formatting   │
│                      │
│  [Image stays sized] │  ← Always 560px (600-40 padding)
└──────────────────────┘
     ↓ Horizontal scroll appears if needed
```

---

## 🔍 Key Differences Explained

### 1. **Container Width**

**Current:**
```css
.email-container { max-width: 600px; }
```
- Shrinks below 600px in narrow views
- Causes layout shifts

**Proposed:**
```html
<table width="600">
```
- Always exactly 600px
- Adds horizontal scroll if needed (standard email behavior)

---

### 2. **Banner Image**

**Current:**
```html
<img src="banner.jpg" class="banner" style="width: 100%;">
```
- Scales with container
- Can become distorted

**Proposed:**
```html
<img src="banner.jpg" width="600" height="150" style="display:block; width:600px; height:150px;">
```
- Fixed dimensions
- Always aligned with container edges
- No gaps or overflow

---

### 3. **Content Images**

**Current:**
```html
<img src="content.jpg" style="width: 100%; max-width: 500px;">
```
- Percentage-based sizing
- Can misalign with text

**Proposed:**
```html
<img src="content.jpg" width="560" style="display:block; width:560px; max-width:560px;">
```
- Fixed 560px (600px - 20px padding each side)
- Always aligned with text
- Prevents overflow

---

### 4. **Text Content**

**Current:**
```html
<div class="content" style="padding: 32px;">
  <p>Text here</p>
</div>
```
- Padding can compress in narrow views

**Proposed:**
```html
<table width="600">
  <tr>
    <td style="padding: 20px 20px 20px 20px;">
      <p style="margin:0; padding:0;">Text here</p>
    </td>
  </tr>
</table>
```
- Fixed padding values
- Text container always 560px wide (600 - 40)
- Consistent alignment

---

## 📐 Layout Measurements

### Current Layout (Flexible)
```
Reading Pane Width: 800px
├─ Email Container: 600px ✓
├─ Banner: 600px ✓
├─ Content: 536px (600 - 64px padding) ✓
└─ Images: ~500px ✓

Reading Pane Width: 500px
├─ Email Container: 500px ✗ (shrunk)
├─ Banner: 500px ✗ (shrunk)
├─ Content: 436px ✗ (shrunk)
└─ Images: ~400px ✗ (shrunk)
```

### Proposed Layout (Fixed)
```
Reading Pane Width: 800px
├─ Email Container: 600px ✓
├─ Banner: 600px ✓
├─ Content: 560px (600 - 40px padding) ✓
└─ Images: 560px ✓

Reading Pane Width: 500px
├─ Email Container: 600px ✓ (horizontal scroll)
├─ Banner: 600px ✓
├─ Content: 560px ✓
└─ Images: 560px ✓
```

---

## 🎨 Visual Comparison

### Current Layout in Narrow Reading Pane
```
┌─────────────┐
│   BANNER    │  ← Compressed
│  (shrunk)   │
├─────────────┤
│ Title       │
│             │
│ Body text   │
│ wraps       │
│ awkwardly   │
│             │
│ [IMG]       │  ← Too small
│ (shrunk)    │
└─────────────┘
```

### Proposed Layout in Narrow Reading Pane
```
┌──────────────────────┐
│      BANNER          │  ← Full size
│   (always 600px)     │
├──────────────────────┤
│  Title               │
│                      │
│  Body text maintains │
│  proper formatting   │
│  and readability     │
│                      │
│  [CONTENT IMAGE]     │  ← Full size
│   (always 560px)     │
└──────────────────────┘
    ↓ Scroll bar appears
```

---

## 🔧 Technical Implementation

### Changes to `generateEmailHTML()` function:

1. **Replace outer container:**
   ```html
   <!-- OLD -->
   <div class="email-container">...</div>
   
   <!-- NEW -->
   <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="width:600px;">
     <tr><td>...</td></tr>
   </table>
   ```

2. **Update banner:**
   ```html
   <!-- OLD -->
   <img src="${bannerImage}" class="banner">
   
   <!-- NEW -->
   <img src="${bannerImage}" width="600" height="150" style="display:block; width:600px; height:150px;">
   ```

3. **Wrap content in table cell:**
   ```html
   <!-- OLD -->
   <div class="content">...</div>
   
   <!-- NEW -->
   <table width="600"><tr><td style="padding:20px;">...</td></tr></table>
   ```

4. **Fix content images:**
   ```html
   <!-- OLD -->
   <img src="${image}" class="content-image">
   
   <!-- NEW -->
   <img src="${image}" width="560" style="display:block; width:560px; max-width:560px;">
   ```

---

## ✅ Benefits Summary

| Feature | Current | Proposed |
|---------|---------|----------|
| **Consistency** | ❌ Varies by pane width | ✅ Always same |
| **Banner Alignment** | ❌ Can shrink | ✅ Always 600px |
| **Image Alignment** | ❌ Can overflow/shrink | ✅ Fixed size |
| **Text Alignment** | ❌ Can reflow oddly | ✅ Consistent |
| **Outlook Compatibility** | ⚠️ Partial | ✅ Full |
| **Mobile Support** | ✅ Good | ✅ Good (with media queries) |

---

## 📱 Mobile Considerations

The proposed layout includes responsive media queries for mobile devices:

```css
@media only screen and (max-width: 600px) {
  table[class="email-container"] {
    width: 100% !important;
  }
  img[class="banner"] {
    width: 100% !important;
    height: auto !important;
  }
}
```

This ensures:
- Desktop Outlook: Fixed 600px (consistent)
- Mobile devices: Responsive (scales to screen)

---

## 🚀 Next Steps

If you approve this approach, I will:

1. ✅ Update the `generateEmailHTML()` function
2. ✅ Convert all divs to table-based layout
3. ✅ Add fixed dimensions to all images
4. ✅ Add Outlook-specific CSS fixes
5. ✅ Add mobile responsive media queries
6. ✅ Test the preview to ensure it works

**Would you like me to proceed with implementing these changes?**
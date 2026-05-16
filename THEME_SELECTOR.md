# Theme Selector Feature

## Overview
The IBM Marketing Comms App now includes a comprehensive theme selector that allows users to customize the appearance of the application with multiple color themes and a dark mode toggle.

## Features

### 1. **Light/Dark Mode Toggle**
- **Light Mode**: Default bright theme optimized for daytime use
- **Dark Mode**: Eye-friendly dark theme for low-light environments
- Smooth transitions between modes
- Persists user preference in localStorage

### 2. **Color Themes**
Six professionally designed color themes:

#### IBM Blue (Default)
- Primary: `#0f62fe`
- Secondary: `#0043ce`
- Background: Light blue gradient
- Best for: Professional IBM branding

#### Vibrant
- Primary: `#ff6b6b`
- Secondary: `#ee5a6f`
- Background: Soft red gradient
- Best for: Energetic, attention-grabbing designs

#### Pastel
- Primary: `#a29bfe`
- Secondary: `#6c5ce7`
- Background: Yellow-orange gradient
- Best for: Creative, friendly atmosphere

#### Ocean
- Primary: `#00b894`
- Secondary: `#00cec9`
- Background: Cyan gradient
- Best for: Calm, refreshing feel

#### Sunset
- Primary: `#fd79a8`
- Secondary: `#fdcb6e`
- Background: Pink-peach gradient
- Best for: Warm, inviting designs

#### Forest
- Primary: `#27ae60`
- Secondary: `#229954`
- Background: Green gradient
- Best for: Natural, eco-friendly themes

### 3. **Custom Theme Builder**
The theme system uses CSS variables, making it easy to extend:

```css
:root {
  --primary-color: #0f62fe;
  --secondary-color: #0043ce;
  --background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  --text-color: #161616;
  --card-background: rgba(255, 255, 255, 0.9);
}
```

## How to Use

### Accessing the Theme Selector
1. Click the **Color Palette icon** (🎨) in the top-right header
2. The Theme Selector modal will open

### Changing Themes
1. Select a theme from the radio button list
2. Each theme shows a color preview circle
3. Theme applies instantly with a success toast notification
4. Preview buttons show the selected theme colors

### Toggling Dark Mode
1. Use the **Dark Mode toggle** at the top of the modal
2. Toggle between Light and Dark modes
3. Dark mode works with all color themes
4. Preference is saved automatically

### Resetting to Default
1. Click the **"Reset to Default"** button
2. Returns to IBM Blue theme with Light mode
3. Clears saved preferences

## Technical Implementation

### Components
- **ThemeSelector.js**: Main theme selector modal component
- **App.js**: Integrates theme selector with header button
- **styles.scss**: CSS variables for theme system

### State Management
- Theme preference stored in `localStorage` as `app_theme`
- Dark mode preference stored as `app_dark_mode`
- Loads saved preferences on app startup

### Theme Application
Themes are applied by updating CSS custom properties:
```javascript
const root = document.documentElement;
root.style.setProperty('--primary-color', theme.primary);
root.style.setProperty('--secondary-color', theme.secondary);
root.style.setProperty('--background', theme.background);
root.style.setProperty('--text-color', theme.text);
root.style.setProperty('--card-background', cardBg);
```

### Dark Mode Logic
When dark mode is enabled:
- Background becomes dark gradient (`#1a1a1a` to `#2d2d2d`)
- Text color changes to light (`#f4f4f4`)
- Card backgrounds use semi-transparent white overlay
- Primary/secondary colors remain from selected theme

## User Experience

### Visual Feedback
- ✅ Success toast when theme is applied
- 🌙 Moon emoji for dark mode
- ☀️ Sun emoji for light mode
- 🎨 Paint palette emoji for theme changes
- Live preview of button colors in modal

### Accessibility
- Proper ARIA labels on all controls
- Keyboard navigation support
- High contrast in dark mode
- Clear visual indicators for selected theme

### Performance
- Instant theme switching (no page reload)
- Smooth CSS transitions (0.3s ease)
- Minimal re-renders
- Efficient localStorage usage

## Future Enhancements

### Potential Additions
1. **Custom Color Picker**: Allow users to create their own themes
2. **Theme Import/Export**: Share themes with team members
3. **Scheduled Themes**: Auto-switch based on time of day
4. **More Themes**: Add seasonal or event-specific themes
5. **Theme Preview**: Full-page preview before applying
6. **Accessibility Themes**: High contrast, colorblind-friendly options

### Advanced Features
- Theme synchronization across devices
- Team-wide theme standards
- Theme analytics (most popular themes)
- Integration with IBM Design Language updates

## Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- Requires CSS custom properties support

## Troubleshooting

### Theme Not Applying
1. Clear browser cache
2. Check localStorage is enabled
3. Verify CSS variables are supported

### Dark Mode Issues
1. Ensure toggle is in correct position
2. Check if system dark mode is overriding
3. Try resetting to default theme

### Colors Look Wrong
1. Verify browser color profile settings
2. Check display calibration
3. Try a different theme

## Code Examples

### Adding a New Theme
```javascript
const themes = {
  'custom-theme': {
    name: 'Custom Theme',
    primary: '#your-color',
    secondary: '#your-color',
    background: 'linear-gradient(135deg, #color1 0%, #color2 100%)',
    text: '#your-text-color',
  },
};
```

### Using Theme Variables in Components
```css
.my-component {
  background-color: var(--primary-color);
  color: var(--text-color);
  border: 1px solid var(--secondary-color);
}
```

## Support
For issues or feature requests related to the theme selector, please contact the development team or create an issue in the project repository.

---

**Made with Bob** 🎨
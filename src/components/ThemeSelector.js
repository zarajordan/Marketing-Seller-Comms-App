import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  RadioButtonGroup,
  RadioButton,
  Toggle,
} from '@carbon/react';
import { Paint, Checkmark } from '@carbon/icons-react';
import { toast } from 'react-toastify';

const themes = {
  'ibm-blue': {
    name: 'IBM Blue',
    primary: '#0f62fe',
    secondary: '#0043ce',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)',
    text: '#161616',
  },
  'vibrant': {
    name: 'Vibrant',
    primary: '#ff6b6b',
    secondary: '#ee5a6f',
    background: 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)',
    text: '#2d3436',
  },
  'pastel': {
    name: 'Pastel',
    primary: '#a29bfe',
    secondary: '#6c5ce7',
    background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
    text: '#2d3436',
  },
  'ocean': {
    name: 'Ocean',
    primary: '#00b894',
    secondary: '#00cec9',
    background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
    text: '#0d3b66',
  },
  'sunset': {
    name: 'Sunset',
    primary: '#fd79a8',
    secondary: '#fdcb6e',
    background: 'linear-gradient(135deg, #fff0f3 0%, #ffe8cc 100%)',
    text: '#2d3436',
  },
  'forest': {
    name: 'Forest',
    primary: '#27ae60',
    secondary: '#229954',
    background: 'linear-gradient(135deg, #e8f8f5 0%, #d5f4e6 100%)',
    text: '#145a32',
  },
};

const ThemeSelector = ({ open, onClose }) => {
  const [selectedTheme, setSelectedTheme] = useState('ibm-blue');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('app_theme') || 'ibm-blue';
    const savedDarkMode = localStorage.getItem('app_dark_mode') === 'true';
    setSelectedTheme(savedTheme);
    setDarkMode(savedDarkMode);
    applyTheme(savedTheme, savedDarkMode);
  }, []);

  const applyTheme = (themeName, isDark) => {
    const theme = themes[themeName];
    const root = document.documentElement;

    if (isDark) {
      root.style.setProperty('--primary-color', theme.primary);
      root.style.setProperty('--secondary-color', theme.secondary);
      root.style.setProperty('--background', 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)');
      root.style.setProperty('--text-color', '#f4f4f4');
      root.style.setProperty('--card-background', 'rgba(255, 255, 255, 0.05)');
      document.body.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
    } else {
      root.style.setProperty('--primary-color', theme.primary);
      root.style.setProperty('--secondary-color', theme.secondary);
      root.style.setProperty('--background', theme.background);
      root.style.setProperty('--text-color', theme.text);
      root.style.setProperty('--card-background', 'rgba(255, 255, 255, 0.9)');
      document.body.style.background = theme.background;
    }

    document.body.style.backgroundAttachment = 'fixed';
  };

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    applyTheme(theme, darkMode);
    localStorage.setItem('app_theme', theme);
    toast.success(`🎨 ${themes[theme].name} theme applied!`, {
      icon: <Checkmark size={24} />,
      autoClose: 2000,
    });
  };

  const handleDarkModeToggle = (checked) => {
    setDarkMode(checked);
    applyTheme(selectedTheme, checked);
    localStorage.setItem('app_dark_mode', checked);
    toast.success(`${checked ? '🌙' : '☀️'} ${checked ? 'Dark' : 'Light'} mode enabled!`, {
      icon: <Checkmark size={24} />,
      autoClose: 2000,
    });
  };

  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      modalHeading="🎨 Theme Selector"
      primaryButtonText="Done"
      secondaryButtonText="Reset to Default"
      onRequestSubmit={onClose}
      onSecondarySubmit={() => {
        handleThemeChange('ibm-blue');
        handleDarkModeToggle(false);
      }}
      size="sm"
    >
      <div style={{ padding: '16px 0' }}>
        {/* Dark Mode Toggle */}
        <div style={{ marginBottom: '24px' }}>
          <Toggle
            id="dark-mode-toggle"
            labelText="Dark Mode"
            labelA="Light"
            labelB="Dark"
            toggled={darkMode}
            onToggle={handleDarkModeToggle}
          />
          <p style={{ fontSize: '12px', color: '#525252', marginTop: '8px' }}>
            {darkMode ? '🌙 Dark mode is easier on the eyes' : '☀️ Light mode for better visibility'}
          </p>
        </div>

        {/* Theme Selection */}
        <div>
          <h4 style={{ marginBottom: '16px' }}>Choose a Color Theme</h4>
          <RadioButtonGroup
            name="theme-selector"
            valueSelected={selectedTheme}
            onChange={handleThemeChange}
            orientation="vertical"
          >
            {Object.entries(themes).map(([key, theme]) => (
              <RadioButton
                key={key}
                id={`theme-${key}`}
                labelText={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                        border: '2px solid #e0e0e0',
                      }}
                    />
                    <span>{theme.name}</span>
                  </div>
                }
                value={key}
              />
            ))}
          </RadioButtonGroup>
        </div>

        {/* Theme Preview */}
        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <h5 style={{ marginBottom: '8px' }}>Preview</h5>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              kind="primary"
              size="sm"
              style={{
                backgroundColor: themes[selectedTheme].primary,
                borderColor: themes[selectedTheme].primary,
              }}
            >
              Primary
            </Button>
            <Button
              kind="secondary"
              size="sm"
              style={{
                backgroundColor: themes[selectedTheme].secondary,
                borderColor: themes[selectedTheme].secondary,
                color: 'white',
              }}
            >
              Secondary
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ThemeSelector;

// Made with Bob
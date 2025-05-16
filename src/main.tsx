import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './App.css'

// Add viewport meta tag to ensure proper mobile scaling
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
document.getElementsByTagName('head')[0].appendChild(meta);

// Add theme meta tag for theme color
const themeColorMeta = document.createElement('meta');
themeColorMeta.name = 'theme-color';
themeColorMeta.content = '#F0F9FF';
document.getElementsByTagName('head')[0].appendChild(themeColorMeta);

// Apply theme preference with light mode as default
const storedTheme = localStorage.getItem('theme');

if (storedTheme === 'dark') {
  document.documentElement.classList.add('dark');
  themeColorMeta.content = '#0F172A';
} else {
  // Default to light mode
  document.documentElement.classList.remove('dark');
  // If no theme is set, initialize to light mode
  if (!storedTheme) {
    localStorage.setItem('theme', 'light');
  }
}

createRoot(document.getElementById("root")!).render(<App />);

// Remove event listener for system theme changes as we no longer respect system preferences

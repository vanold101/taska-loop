
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

// Apply system preference for dark mode
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const storedTheme = localStorage.getItem('theme');

if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
  document.documentElement.classList.add('dark');
  themeColorMeta.content = '#0F172A';
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById("root")!).render(<App />);

// Add event listener for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const storedTheme = localStorage.getItem('theme');
  
  // Only change if the user hasn't set a preference
  if (!storedTheme) {
    if (e.matches) {
      document.documentElement.classList.add('dark');
      themeColorMeta.content = '#0F172A';
    } else {
      document.documentElement.classList.remove('dark');
      themeColorMeta.content = '#F0F9FF';
    }
  }
});

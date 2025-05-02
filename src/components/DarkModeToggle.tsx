import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getCurrentTheme, toggleTheme } from '@/utils/theme';

const DarkModeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for user's preferred color scheme or saved preference
  useEffect(() => {
    // Set initial state based on current theme
    setIsDarkMode(getCurrentTheme() === 'dark');
    
    // Listen for system color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleToggle = () => {
    const newTheme = toggleTheme();
    setIsDarkMode(newTheme === 'dark');
    
    // Add haptic feedback on mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="dark-mode-toggle"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-gloop-dark-text-main" />
      ) : (
        <Moon className="w-5 h-5 text-gloop-text-main" />
      )}
    </button>
  );
};

export default DarkModeToggle;

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getCurrentTheme, toggleTheme } from '@/utils/theme';

const DarkModeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for the current theme
  useEffect(() => {
    // Set initial state based on current theme
    setIsDarkMode(getCurrentTheme() === 'dark');
    
    // We no longer use system preference changes to automatically switch themes
    // as we want light mode to be the default regardless of system preferences
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

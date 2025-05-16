// Theme utility functions with light mode as default

/**
 * Initialize the theme based on user preferences with light mode as default
 */
export function initializeTheme() {
  // Check if theme is stored in localStorage
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    // Default to light mode for any other value or if no theme is set
    document.documentElement.classList.remove('dark');
    
    // If no theme is set, initialize to light mode
    if (!savedTheme) {
      localStorage.setItem('theme', 'light');
    }
  }
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    return 'light';
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    return 'dark';
  }
}

/**
 * Get the current theme
 */
export function getCurrentTheme(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

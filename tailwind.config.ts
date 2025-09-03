import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
        inter: ["Inter", "sans-serif"],
      },
      scale: {
        '101': '1.01',
        '102': '1.02',
        '103': '1.03',
        '105': '1.05',
      },
      colors: {
        // Brand & Color System from style guide
        gloop: {
          bg: "hsl(var(--background))",
          surface: "#FFFFFF",
          "text-main": "#1E293B",
          "text-muted": "#64748B",
          primary: "#3B82F6",
          "primary-hover": "#3B6FDB",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          outline: "#E2E8F0",
          disabled: "#C7CCD9",
          accent: "#F0F9FF",
          // Dark theme colors
          "dark-bg": "#0F172A",
          "dark-surface": "#1E293B",
          "dark-text-main": "#F7B955",
          "dark-text-muted": "#94A3B8",
          "dark-accent": "#1E293B",
          "dark-outline": "#334155",
        },
        // Premium gradient colors
        "gloop-premium-gradient-start": "#3B82F6",
        "gloop-premium-gradient-end": "#10B981",
        "gloop-card-border": "#E2E8F0",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#4F8CFF",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "12pt": "12px",
        "24pt": "24px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-subtle": {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      boxShadow: {
        fab: "0 4px 14px 0 rgba(79, 140, 255, 0.39)",
      },
      spacing: {
        "56pt": "56px",
        "64pt": "64px",
        "72pt": "72px",
      },
      fontSize: {
        "display-1": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "title-1": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "title-2": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-1": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-2": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "caption": ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      // Responsive fluid spacing
      padding: {
        'clamp': 'clamp(1.5rem, 5vw, 3rem)',
        'clamp-sm': 'clamp(1rem, 3vw, 2rem)',
      },
      margin: {
        'clamp': 'clamp(1.5rem, 5vw, 3rem)',
        'clamp-sm': 'clamp(1rem, 3vw, 2rem)',
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
        'premium-radial': 'radial-gradient(circle at top right, #3B82F6, #10B981)',
        'dark-gradient': 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add plugin for fluid typography and custom responsive classes
    function({ addComponents, theme }: { addComponents: any; theme: any }) {
      addComponents({
        // Responsive typography utility classes
        '.text-clamp-2xl': {
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          lineHeight: '1.2',
          fontWeight: '700',
        },
        '.text-clamp-xl': {
          fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
          lineHeight: '1.3',
          fontWeight: '600',
        },
        '.text-clamp-lg': {
          fontSize: 'clamp(1.125rem, 1.5vw, 1.5rem)',
          lineHeight: '1.4',
          fontWeight: '600',
        },
        '.text-clamp-base': {
          fontSize: 'clamp(0.875rem, 1vw, 1rem)',
          lineHeight: '1.5',
        },
        '.text-clamp-sm': {
          fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)',
          lineHeight: '1.5',
        },
        
        // Feature card styling
        '.py-clamp': {
          paddingTop: 'clamp(3rem, 8vh, 5rem)',
          paddingBottom: 'clamp(3rem, 8vh, 5rem)',
        },
        '.py-clamp-sm': {
          paddingTop: 'clamp(2rem, 5vh, 3rem)',
          paddingBottom: 'clamp(2rem, 5vh, 3rem)',
        },
        '.mb-clamp': {
          marginBottom: 'clamp(1.5rem, 5vh, 3rem)',
        },
        '.mb-clamp-sm': {
          marginBottom: 'clamp(1rem, 3vh, 2rem)',
        },
        
        // Feature card components
        '.feature-card': {
          background: 'white',
          borderRadius: 'clamp(1rem, 2vw, 1.5rem)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          backdropFilter: 'blur(10px)',
          '@apply hover:shadow-lg dark:bg-gray-800/90 dark:border-gray-700/50': {},
        },
        '.feature-icon-container': {
          width: 'clamp(3rem, 4vw, 4rem)',
          height: 'clamp(3rem, 4vw, 4rem)',
          marginBottom: 'clamp(1rem, 1.5vw, 1.5rem)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: '0',
          '@apply bg-gradient-to-r from-blue-500 to-green-500 shadow-md': {},
        },
        '.feature-icon': {
          width: 'clamp(1.25rem, 1.75vw, 1.75rem)',
          height: 'clamp(1.25rem, 1.75vw, 1.75rem)',
          '@apply text-white': {},
        },
        '.feature-content': {
          flexGrow: '1',
        },
        '.feature-title': {
          marginBottom: 'clamp(0.5rem, 1vw, 0.75rem)',
          '@apply font-semibold text-clamp-lg': {},
        },
        '.feature-description': {
          marginBottom: 'clamp(0.75rem, 1.5vw, 1.25rem)',
          '@apply text-clamp-base text-gray-600 dark:text-gray-300 line-clamp-2': {},
        },
        '.feature-list': {
          '@apply space-y-2': {},
        },
        '.feature-list-item': {
          display: 'flex',
          alignItems: 'flex-start',
          '@apply text-clamp-sm text-gray-600 dark:text-gray-300': {},
        },
        '.feature-check-icon': {
          width: '1rem',
          height: '1rem',
          marginRight: '0.5rem',
          marginTop: '0.125rem',
          flexShrink: '0',
          '@apply text-green-500': {},
        },
        
        // Mini feature cards
        '.mini-feature-card': {
          textAlign: 'center',
          borderRadius: 'clamp(0.75rem, 1vw, 1rem)',
          padding: 'clamp(0.75rem, 1.5vw, 1.25rem)',
          transition: 'all 0.3s ease',
          '@apply bg-white/90 dark:bg-gray-800/90 hover:shadow-md shadow-sm': {},
        },
        '.mini-feature-icon-container': {
          width: 'clamp(2.5rem, 3vw, 3rem)',
          height: 'clamp(2.5rem, 3vw, 3rem)',
          margin: '0 auto',
          marginBottom: 'clamp(0.5rem, 0.75vw, 0.75rem)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '@apply bg-gradient-to-r from-blue-500/20 to-green-500/20 dark:from-blue-900/30 dark:to-green-900/30': {},
        },
        '.mini-feature-icon': {
          width: 'clamp(1.25rem, 1.5vw, 1.5rem)',
          height: 'clamp(1.25rem, 1.5vw, 1.5rem)',
          '@apply text-blue-600 dark:text-blue-400': {},
        },
        '.mini-feature-title': {
          '@apply font-medium text-clamp-sm': {},
        },
      });
    },
  ],
} satisfies Config;

export default config;


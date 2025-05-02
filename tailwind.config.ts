import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
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
        sans: ["var(--font-sans)", ...fontFamily.sans],
        display: ["var(--font-display)", ...fontFamily.sans],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        // Brand & Color System from style guide
        gloop: {
          bg: "#F0F9FF",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
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
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

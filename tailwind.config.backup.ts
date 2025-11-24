import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // AirBear Eco Colors
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5", 
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        lime: {
          50: "#f7fee7",
          100: "#ecfccb",
          200: "#d9f99d", 
          300: "#bef264",
          400: "#a3e635",
          500: "#84cc16",
          600: "#65a30d",
          700: "#4d7c0f",
          800: "#365314",
          900: "#1a2e05",
        },
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d", 
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        // AirBear Custom Keyframes
        "pulse-glow": {
          "0%": { 
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" 
          },
          "100%": { 
            boxShadow: "0 0 40px rgba(16, 185, 129, 0.8), 0 0 60px rgba(16, 185, 129, 0.4)" 
          },
        },
        "float": {
          "0%, 100%": { 
            transform: "translateY(0px)" 
          },
          "50%": { 
            transform: "translateY(-10px)" 
          },
        },
        "shimmer": {
          "0%": { 
            transform: "translateX(-100%)" 
          },
          "100%": { 
            transform: "translateX(100%)" 
          },
        },
        "particle": {
          "0%, 100%": { 
            transform: "translateY(0) scale(1)", 
            opacity: "1" 
          },
          "50%": { 
            transform: "translateY(-20px) scale(1.2)", 
            opacity: "0.7" 
          },
        },
        "rickshaw-bounce": {
          "0%": { 
            transform: "scale(1)" 
          },
          "50%": { 
            transform: "scale(1.1) rotate(5deg)" 
          },
          "100%": { 
            transform: "scale(1)" 
          },
        },
        "wheel-spin": {
          "from": { 
            transform: "rotate(0deg)" 
          },
          "to": { 
            transform: "rotate(360deg)" 
          },
        },
        "neon-glow": {
          "0%": { 
            filter: "drop-shadow(0 0 5px rgba(16, 185, 129, 0.8)) drop-shadow(0 0 10px rgba(16, 185, 129, 0.6))" 
          },
          "100%": { 
            filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 1)) drop-shadow(0 0 20px rgba(16, 185, 129, 0.8)) drop-shadow(0 0 30px rgba(16, 185, 129, 0.4))" 
          },
        },
        "vortex-zoom": {
          "0%": {
            transform: "scale(1) rotate(0deg)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(0.3) rotate(360deg)",
            opacity: "0",
          },
        },
        "confetti-burst": {
          "0%": {
            transform: "scale(0) rotate(0deg)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.2) rotate(180deg)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(0.8) rotate(360deg)",
            opacity: "0",
          },
        },
        "liquid-fill": {
          "0%": {
            transform: "scaleX(0)",
            transformOrigin: "left",
          },
          "100%": {
            transform: "scaleX(1)",
            transformOrigin: "left",
          },
        },
        "ripple-wave": {
          "0%": {
            transform: "scale(0)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(4)",
            opacity: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // AirBear Animations
        "spin-slow": "wheel-spin 3s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "particle": "particle 4s ease-in-out infinite",
        "rickshaw-bounce": "rickshaw-bounce 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "wheel-spin": "wheel-spin 1s linear infinite",
        "neon-glow": "neon-glow 1.5s ease-in-out infinite alternate",
        "vortex-zoom": "vortex-zoom 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        "confetti-burst": "confetti-burst 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "liquid-fill": "liquid-fill 1s ease-out",
        "ripple-wave": "ripple-wave 0.6s ease-out",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
  ],
} satisfies Config;

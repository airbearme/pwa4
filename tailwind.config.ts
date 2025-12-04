import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  // Preserve all custom AirBear styles
  safelist: [
    "airbear-holographic", "airbear-plasma", "airbear-solar-rays", "airbear-marker", "airbear-eco-breeze", "airbear-god-rays",
    "glass-morphism", "neumorphism", "eco-gradient", "particle-system", "airbear-wheel", "hover-lift", "ripple-effect",
    "animate-spin-slow", "animate-pulse-glow", "animate-float", "animate-shimmer", "animate-particle", "animate-rickshaw-bounce",
    "animate-wheel-spin", "animate-neon-glow", "animate-vortex-zoom", "animate-confetti-burst", "animate-liquid-fill", "animate-ripple-wave",
    "animate-holographic", "animate-plasma", "animate-solar-rays", "animate-eco-breeze", "animate-airbear-bounce", "animate-god-rays",
    { pattern: /bg-(emerald|lime|amber)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-(emerald|lime|amber)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-(emerald|lime|amber)-(50|100|200|300|400|500|600|700|800|900)/ },
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
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
        // Additional AirBear Animations
        "holographic-shift": {
          "0%": { 
            backgroundPosition: "0% 50%",
            filter: "hue-rotate(0deg)",
          },
          "50%": { 
            backgroundPosition: "100% 50%",
            filter: "hue-rotate(180deg)",
          },
          "100%": { 
            backgroundPosition: "0% 50%",
            filter: "hue-rotate(360deg)",
          },
        },
        "plasma-flow": {
          "0%": { 
            background: "radial-gradient(circle at 0% 50%, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.6) 50%, rgba(16, 185, 129, 0.4) 100%)",
          },
          "25%": { 
            background: "radial-gradient(circle at 100% 50%, rgba(59, 130, 246, 0.8) 0%, rgba(16, 185, 129, 0.6) 50%, rgba(147, 51, 234, 0.4) 100%)",
          },
          "50%": { 
            background: "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.8) 0%, rgba(147, 51, 234, 0.6) 50%, rgba(59, 130, 246, 0.4) 100%)",
          },
          "75%": { 
            background: "radial-gradient(circle at 50% 100%, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.6) 50%, rgba(16, 185, 129, 0.4) 100%)",
          },
          "100%": { 
            background: "radial-gradient(circle at 0% 50%, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.6) 50%, rgba(16, 185, 129, 0.4) 100%)",
          },
        },
        "solar-rays": {
          "0%": { 
            transform: "rotate(0deg) scale(1)",
            opacity: "0.6",
          },
          "50%": { 
            transform: "rotate(180deg) scale(1.2)",
            opacity: "1",
          },
          "100%": { 
            transform: "rotate(360deg) scale(1)",
            opacity: "0.6",
          },
        },
        "eco-breeze": {
          "0%": { 
            transform: "translateX(-100%) rotate(0deg)",
            opacity: "0",
          },
          "50%": { 
            transform: "translateX(0%) rotate(180deg)",
            opacity: "1",
          },
          "100%": { 
            transform: "translateX(100%) rotate(360deg)",
            opacity: "0",
          },
        },
        "airbear-bounce": {
          "0%, 100%": { 
            transform: "translateY(0) scale(1) rotate(0deg)",
          },
          "25%": { 
            transform: "translateY(-10px) scale(1.1) rotate(5deg)",
          },
          "50%": { 
            transform: "translateY(-20px) scale(1.2) rotate(0deg)",
          },
          "75%": { 
            transform: "translateY(-10px) scale(1.1) rotate(-5deg)",
          },
        },
        "god-rays": {
          "0%": { 
            opacity: "0.3",
            transform: "scale(0.8) rotate(0deg)",
          },
          "50%": { 
            opacity: "0.8",
            transform: "scale(1.2) rotate(180deg)",
          },
          "100%": { 
            opacity: "0.3",
            transform: "scale(0.8) rotate(360deg)",
          },
        },
        "rolling-fire": {
          "0%": {
            transform: "rotate(0deg) scale(1)",
            boxShadow: "0 0 10px rgba(255, 69, 0, 0.8)",
          },
          "50%": {
            transform: "rotate(180deg) scale(1.1)",
            boxShadow: "0 0 20px rgba(255, 165, 0, 1), 0 0 30px rgba(255, 69, 0, 0.6)",
          },
          "100%": {
            transform: "rotate(360deg) scale(1)",
            boxShadow: "0 0 10px rgba(255, 69, 0, 0.8)",
          },
        },
        "smoke-trail": {
          "0%": {
            transform: "translateY(0) scale(0.5)",
            opacity: "0.8",
          },
          "50%": {
            transform: "translateY(-20px) scale(1)",
            opacity: "0.4",
          },
          "100%": {
            transform: "translateY(-40px) scale(1.5)",
            opacity: "0",
          },
        },
        "prismatic-rays": {
          "0%": {
            background: "linear-gradient(to top, #fde047, #f97316, #dc2626)",
            filter: "hue-rotate(0deg)",
          },
          "33%": {
            background: "linear-gradient(to top, #a78bfa, #06b6d4, #10b981)",
            filter: "hue-rotate(120deg)",
          },
          "66%": {
            background: "linear-gradient(to top, #f472b6, #ec4899, #be185d)",
            filter: "hue-rotate(240deg)",
          },
          "100%": {
            background: "linear-gradient(to top, #fde047, #f97316, #dc2626)",
            filter: "hue-rotate(360deg)",
          },
        },
        "burning-wheel": {
          "0%": {
            boxShadow: "0 0 10px rgba(255, 69, 0, 0.8), inset 0 0 10px rgba(255, 165, 0, 0.4)",
          },
          "50%": {
            boxShadow: "0 0 25px rgba(255, 165, 0, 1), 0 0 35px rgba(255, 69, 0, 0.8), inset 0 0 15px rgba(255, 215, 0, 0.6)",
          },
          "100%": {
            boxShadow: "0 0 10px rgba(255, 69, 0, 0.8), inset 0 0 10px rgba(255, 165, 0, 0.4)",
          },
        },
        "holo-shimmer": {
          "0%": {
            backgroundPosition: "-200% center",
            filter: "hue-rotate(0deg) brightness(1)",
          },
          "50%": {
            backgroundPosition: "200% center",
            filter: "hue-rotate(180deg) brightness(1.2)",
          },
          "100%": {
            backgroundPosition: "-200% center",
            filter: "hue-rotate(360deg) brightness(1)",
          },
        },
        "plasma-vortex": {
          "0%": {
            background: "radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.6) 30%, rgba(16, 185, 129, 0.4) 60%, transparent 100%)",
            transform: "rotate(0deg) scale(1)",
          },
          "25%": {
            background: "radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.8) 0%, rgba(16, 185, 129, 0.6) 30%, rgba(147, 51, 234, 0.4) 60%, transparent 100%)",
            transform: "rotate(90deg) scale(1.1)",
          },
          "50%": {
            background: "radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.8) 0%, rgba(147, 51, 234, 0.6) 30%, rgba(59, 130, 246, 0.4) 60%, transparent 100%)",
            transform: "rotate(180deg) scale(1)",
          },
          "75%": {
            background: "radial-gradient(circle at 70% 70%, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.6) 30%, rgba(16, 185, 129, 0.4) 60%, transparent 100%)",
            transform: "rotate(270deg) scale(1.1)",
          },
          "100%": {
            background: "radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.6) 30%, rgba(16, 185, 129, 0.4) 60%, transparent 100%)",
            transform: "rotate(360deg) scale(1)",
          },
        },
        "airbear-trail": {
          "0%": {
            transform: "translateX(-100%) scale(0.5)",
            opacity: "0",
          },
          "50%": {
            transform: "translateX(0%) scale(1)",
            opacity: "1",
          },
          "100%": {
            transform: "translateX(100%) scale(0.5)",
            opacity: "0",
          },
        },
        "ceo-signature-glow": {
          "0%": {
            textShadow: "0 0 5px rgba(255, 193, 7, 0.5)",
            color: "#f59e0b",
          },
          "50%": {
            textShadow: "0 0 20px rgba(255, 193, 7, 0.8), 0 0 30px rgba(255, 193, 7, 0.6)",
            color: "#fbbf24",
          },
          "100%": {
            textShadow: "0 0 5px rgba(255, 193, 7, 0.5)",
            color: "#f59e0b",
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
        "holographic-shift": "holographic-shift 3s ease infinite",
        "plasma-flow": "plasma-flow 4s ease infinite",
        "solar-rays": "solar-rays 6s linear infinite",
        "eco-breeze": "eco-breeze 4s ease-in-out infinite",
        "airbear-bounce": "airbear-bounce 2s ease-in-out infinite",
        "god-rays": "god-rays 8s ease-in-out infinite",
        "rolling-fire": "rolling-fire 2s linear infinite",
        "smoke-trail": "smoke-trail 3s ease-out infinite",
        "prismatic-rays": "prismatic-rays 4s linear infinite",
        "burning-wheel": "burning-wheel 1.5s ease-in-out infinite",
        "holo-shimmer": "holo-shimmer 3s linear infinite",
        "plasma-vortex": "plasma-vortex 5s ease-in-out infinite",
        "airbear-trail": "airbear-trail 3s ease-in-out infinite",
        "ceo-signature": "ceo-signature-glow 2s ease-in-out infinite",
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

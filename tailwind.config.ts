import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        exo:  ['"Exo 2"', "sans-serif"],
        mono: ['"Space Mono"', "monospace"],
      },
      colors: {
        cyber: {
          /* These use CSS vars so they respond to data-theme switching */
          cyan:   "var(--cyber-cyan)",
          purple: "var(--cyber-purple)",
          green:  "var(--cyber-green)",
          gold:   "var(--cyber-gold)",
          red:    "var(--cyber-red)",
          bg:     "var(--cyber-bg)",
          card:   "var(--cyber-surface)",
          border: "var(--cyber-border)",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple))",
        "gradient-xp":      "linear-gradient(90deg,  var(--cyber-green), var(--cyber-cyan))",
        "gradient-levelup": "linear-gradient(135deg, var(--cyber-gold),  var(--cyber-red))",
        "gradient-fire":    "linear-gradient(135deg, var(--cyber-red),   var(--cyber-gold))",
        "gradient-card":    "linear-gradient(135deg, var(--cyber-surface), var(--cyber-bg))",
      },
      boxShadow: {
        "neon-cyan":   "0 0 20px rgba(0, 245, 255,  0.4)",
        "neon-purple": "0 0 20px rgba(192, 38, 211, 0.4)",
        "neon-green":  "0 0 20px rgba(34, 255, 136, 0.4)",
        "neon-gold":   "0 0 20px rgba(255, 215, 0,  0.4)",
        "neon-red":    "0 0 20px rgba(255, 45,  85, 0.4)",
      },
      animation: {
        "pulse-neon":  "pulse-neon 2s ease-in-out infinite",
        "streak-fire": "streak-fire 0.5s ease-out forwards",
        "slash-in":    "slash-in 0.3s ease-out forwards",
        "shake":       "shake 0.4s ease-out forwards",
        "level-up":    "level-up 0.8s ease-out forwards",
        "xp-rise":     "xp-rise 1.2s ease-out forwards",
        "float":       "float 3s ease-in-out infinite",
        "float-slow":  "float 5s ease-in-out infinite",
        "spin-slow":   "spin 10s linear infinite",
        "bounce-slow": "float 2s ease-in-out infinite",
        "ping-slow":   "ping 2.5s cubic-bezier(0,0,.2,1) infinite",
        "slide-up":    "slide-up 0.4s ease-out forwards",
        "fade-in":     "fade-in 0.4s ease-out forwards",
        "pop":         "pop 0.3s cubic-bezier(.36,.07,.19,.97) forwards",
        "burst":       "burst 0.45s cubic-bezier(.36,.07,.19,.97) forwards",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.55" },
        },
        "streak-fire": {
          "0%":   { transform: "scale(1)",   opacity: "1" },
          "50%":  { transform: "scale(1.3)", opacity: "0.8" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        "slash-in": {
          "0%":   { transform: "translateX(-20px) rotate(-10deg)", opacity: "0" },
          "100%": { transform: "translateX(0) rotate(0deg)",       opacity: "1" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%":      { transform: "translateX(-8px)" },
          "40%":      { transform: "translateX(8px)" },
          "60%":      { transform: "translateX(-4px)" },
          "80%":      { transform: "translateX(4px)" },
        },
        "level-up": {
          "0%":   { transform: "scale(1)",    filter: "brightness(1)" },
          "50%":  { transform: "scale(1.15)", filter: "brightness(2.2)" },
          "100%": { transform: "scale(1)",    filter: "brightness(1)" },
        },
        "xp-rise": {
          "0%":   { transform: "translateY(0px)",  opacity: "0" },
          "30%":  { transform: "translateY(-15px)", opacity: "1" },
          "100%": { transform: "translateY(-45px)", opacity: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "slide-up": {
          "0%":   { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pop": {
          "0%":   { transform: "scale(0.7)", opacity: "0" },
          "70%":  { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        "burst": {
          "0%":   { transform: "scale(1)",    filter: "brightness(1)" },
          "18%":  { transform: "scale(1.07)", filter: "brightness(2.2)" },
          "42%":  { transform: "scale(0.97)", filter: "brightness(1.3)" },
          "68%":  { transform: "scale(1.02)", filter: "brightness(1.1)" },
          "100%": { transform: "scale(1)",    filter: "brightness(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

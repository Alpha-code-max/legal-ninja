/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "cyber-bg":     "#050A0F",
        "cyber-surface":"#0D1B2A",
        "cyber-card":   "rgba(13,27,42,0.9)",
        "cyber-border": "rgba(26,45,66,0.7)",
        "cyber-cyan":   "#00F5FF",
        "cyber-purple": "#C026D3",
        "cyber-green":  "#22FF88",
        "cyber-gold":   "#FFD700",
        "cyber-red":    "#FF2D55",
        "text-base":    "#E2EAF0",
        "text-muted":   "rgba(226,234,240,0.45)",
      },
      fontFamily: {
        grotesk:       ["SpaceGrotesk_400Regular"],
        "grotesk-bold":["SpaceGrotesk_700Bold"],
        mono:          ["SpaceMono_400Regular"],
        "mono-bold":   ["SpaceMono_700Bold"],
      },
    },
  },
  plugins: [],
};

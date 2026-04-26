"use client";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="w-9 h-9 rounded-full flex items-center justify-center border border-cyber-border glass-card transition-all hover:border-cyber-cyan/50"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-base leading-none"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </motion.span>
    </motion.button>
  );
}

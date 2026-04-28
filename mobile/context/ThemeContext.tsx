import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { themes, type ThemeId, type AppColors } from "@lib/theme";

interface ThemeContextValue {
  themeId: ThemeId;
  colors:  AppColors;
  setTheme:(id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId:  "cyber_dark",
  colors:   themes.cyber_dark,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("cyber_dark");

  useEffect(() => {
    SecureStore.getItemAsync("app_theme").then((saved) => {
      if (saved === "cyber_dark" || saved === "light") setThemeId(saved);
    });
  }, []);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    SecureStore.setItemAsync("app_theme", id);
  };

  return (
    <ThemeContext.Provider value={{ themeId, colors: themes[themeId], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

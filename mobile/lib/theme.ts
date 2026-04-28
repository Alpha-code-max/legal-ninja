export type ThemeId = "cyber_dark" | "light";

export interface AppColors {
  bg:           string;
  bgAlt:        string;
  card:         string;
  inputBg:      string;
  text:         string;
  textMuted:    string;
  textFaint:    string;
  border:       string;
  borderFaint:  string;
  tabBg:        string;
  tabBorder:    string;
  tabInactive:  string;
  statusBar:    "light" | "dark";
  isDark:       boolean;
}

export const themes: Record<ThemeId, AppColors> = {
  cyber_dark: {
    bg:          "#050A0F",
    bgAlt:       "#090F1A",
    card:        "#0D1B2A",
    inputBg:     "rgba(13,27,42,0.95)",
    text:        "#E2EAF0",
    textMuted:   "rgba(226,234,240,0.45)",
    textFaint:   "rgba(226,234,240,0.25)",
    border:      "rgba(26,45,66,0.7)",
    borderFaint: "rgba(26,45,66,0.4)",
    tabBg:       "#090F1A",
    tabBorder:   "rgba(0,245,255,0.12)",
    tabInactive: "rgba(226,234,240,0.35)",
    statusBar:   "light",
    isDark:      true,
  },
  light: {
    bg:          "#F0F5FA",
    bgAlt:       "#FFFFFF",
    card:        "#FFFFFF",
    inputBg:     "#F8FAFC",
    text:        "#0D1B2A",
    textMuted:   "rgba(13,27,42,0.5)",
    textFaint:   "rgba(13,27,42,0.3)",
    border:      "rgba(13,27,42,0.14)",
    borderFaint: "rgba(13,27,42,0.07)",
    tabBg:       "#FFFFFF",
    tabBorder:   "rgba(0,135,181,0.18)",
    tabInactive: "rgba(13,27,42,0.4)",
    statusBar:   "dark",
    isDark:      false,
  },
};

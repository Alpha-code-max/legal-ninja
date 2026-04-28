import { View, ViewStyle } from "react-native";
import { useTheme } from "@context/ThemeContext";

interface Props {
  children: React.ReactNode;
  style?:   ViewStyle;
  accent?:  "cyan" | "purple" | "green" | "gold" | "red" | "none";
  padding?: number;
}

const ACCENT_COLORS: Record<string, string> = {
  cyan:   "#00F5FF",
  purple: "#C026D3",
  green:  "#22FF88",
  gold:   "#FFD700",
  red:    "#FF2D55",
};

export function CyberCard({ children, style, accent = "none", padding = 16 }: Props) {
  const { colors } = useTheme();
  const borderColor = accent !== "none" ? ACCENT_COLORS[accent] : colors.border;

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderWidth:      1,
          borderColor,
          borderRadius:     16,
          padding,
          overflow:         "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

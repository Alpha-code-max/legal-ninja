import { View, Text } from "react-native";
import { FadeIn } from "./FadeIn";
import { useTheme } from "@context/ThemeContext";

export function StreakCounter({ streak, size = "md" }: { streak: number; size?: "sm" | "md" | "lg" }) {
  const { colors } = useTheme();
  const fs  = size === "sm" ? 14 : size === "md" ? 20 : 28;
  const fs2 = size === "sm" ? 9  : size === "md" ? 11 : 13;
  const hot = streak >= 5;

  return (
    <FadeIn style={{ alignItems: "center" }}>
      <Text style={{ fontSize: fs, fontFamily: "SpaceMono_700Bold", color: hot ? "#FFD700" : "#00F5FF" }}>
        {streak}
      </Text>
      <Text style={{ fontSize: fs2, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular" }}>
        {hot ? "🔥 Streak" : "Streak"}
      </Text>
    </FadeIn>
  );
}

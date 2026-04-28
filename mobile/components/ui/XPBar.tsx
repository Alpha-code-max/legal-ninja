import { View, Text, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { useTheme } from "@context/ThemeContext";

const LEVELS = [
  { level: 1, xp_required: 0 },    { level: 2, xp_required: 250 },
  { level: 3, xp_required: 600 },  { level: 4, xp_required: 1200 },
  { level: 5, xp_required: 2500 }, { level: 6, xp_required: 5000 },
  { level: 7, xp_required: 10000 },
];

export function XPBar({ xp, level, showLabel = true }: { xp: number; level: number; showLabel?: boolean }) {
  const { colors } = useTheme();
  const current = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const next    = LEVELS.find((l) => l.level === level + 1);
  const pct     = next
    ? Math.min(100, Math.round(((xp - current.xp_required) / (next.xp_required - current.xp_required)) * 100))
    : 100;

  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, { toValue: pct, duration: 600, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View>
      {showLabel && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular" }}>XP</Text>
          <Text style={{ fontSize: 10, color: "#00F5FF", fontFamily: "SpaceMono_400Regular" }}>{xp.toLocaleString()}</Text>
        </View>
      )}
      <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" }}>
        <Animated.View style={{ height: "100%", borderRadius: 3, backgroundColor: "#00F5FF", width: width.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }} />
      </View>
    </View>
  );
}

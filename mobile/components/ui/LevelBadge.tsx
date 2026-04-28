import { View, Text } from "react-native";

const LEVELS = [
  { level: 1, name: "1L Rookie",       color: "#00F5FF" },
  { level: 2, name: "Case Hunter",     color: "#22FF88" },
  { level: 3, name: "Brief Writer",    color: "#00F5FF" },
  { level: 4, name: "Legal Warrior",   color: "#60a5fa" },
  { level: 5, name: "Sr. Advocate",    color: "#C026D3" },
  { level: 6, name: "Legal Ninja",     color: "#FFD700" },
  { level: 7, name: "Supreme Sensei",  color: "#FF2D55" },
];

export function LevelBadge({ level, size = "md", showName = false }: { level: number; size?: "sm" | "md" | "lg"; showName?: boolean }) {
  const info  = LEVELS[Math.min(level - 1, 6)];
  const color = info?.color ?? "#00F5FF";
  const dim   = size === "sm" ? 28 : size === "md" ? 40 : 52;
  const fs    = size === "sm" ? 11 : size === "md" ? 15 : 20;

  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <View style={{
        width: dim, height: dim, borderRadius: dim / 2,
        backgroundColor: `${color}22`,
        borderWidth: 2, borderColor: color,
        alignItems: "center", justifyContent: "center",
      }}>
        <Text style={{ color, fontSize: fs, fontFamily: "SpaceMono_700Bold", fontWeight: "800" }}>
          {level}
        </Text>
      </View>
      {showName && (
        <Text style={{ fontSize: 9, color, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {info?.name ?? "Ninja"}
        </Text>
      )}
    </View>
  );
}

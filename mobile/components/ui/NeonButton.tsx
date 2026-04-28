import { FadeIn } from '@components/ui/FadeIn';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from "react-native";
import { useTheme } from "@context/ThemeContext";

type Variant = "cyan" | "purple" | "green" | "gold" | "red" | "ghost";
type Size    = "sm" | "md" | "lg";

const COLORS: Record<Variant, { bg: string; border: string; text: string }> = {
  cyan:   { bg: "rgba(0,245,255,0.12)",   border: "#00F5FF", text: "#00F5FF" },
  purple: { bg: "rgba(192,38,211,0.12)",  border: "#C026D3", text: "#C026D3" },
  green:  { bg: "rgba(34,255,136,0.12)",  border: "#22FF88", text: "#22FF88" },
  gold:   { bg: "rgba(255,215,0,0.12)",   border: "#FFD700", text: "#FFD700" },
  red:    { bg: "rgba(255,45,85,0.12)",   border: "#FF2D55", text: "#FF2D55" },
  ghost:  { bg: "transparent",            border: "",        text: "" }, // filled at runtime
};

const SIZES: Record<Size, { py: number; px: number; fontSize: number; radius: number }> = {
  sm: { py: 11, px: 18, fontSize: 12, radius: 10 },
  md: { py: 15, px: 22, fontSize: 14, radius: 12 },
  lg: { py: 18, px: 26, fontSize: 16, radius: 14 },
};

interface Props {
  label:     string;
  onPress:   () => void;
  variant?:  Variant;
  size?:     Size;
  disabled?: boolean;
  loading?:  boolean;
  fullWidth?: boolean;
  style?:    ViewStyle;
}

export function NeonButton({ label, onPress, variant = "cyan", size = "md", disabled, loading, fullWidth, style }: Props) {
  const { colors } = useTheme();
  const s = SIZES[size];

  const c = variant === "ghost"
    ? { bg: "transparent", border: colors.border, text: colors.textMuted }
    : COLORS[variant];

  const isDisabled = !!disabled && !loading;

  return (
    <FadeIn style={style}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        disabled={disabled || loading}
        style={{
          backgroundColor: isDisabled ? colors.borderFaint : c.bg,
          borderWidth:     1,
          borderColor:     isDisabled ? colors.border : c.border,
          borderRadius:    s.radius,
          paddingVertical: s.py,
          paddingHorizontal: s.px,
          alignItems:      "center",
          justifyContent:  "center",
          flexDirection:   "row",
          gap:             8,
          opacity:         isDisabled ? 0.5 : loading ? 0.75 : 1,
          width:           fullWidth ? "100%" : undefined,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={c.text} />
        ) : (
          <Text style={{ color: isDisabled ? colors.textMuted : c.text, fontSize: s.fontSize, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase", fontFamily: "SpaceGrotesk_700Bold" }}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </FadeIn>
  );
}

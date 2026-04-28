import { FadeIn } from '@components/ui/FadeIn';
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { NeonButton } from "@components/ui/NeonButton";
import { api } from "@lib/api";
import { setToken, clearGuest } from "@lib/storage";
import { useTheme } from "@context/ThemeContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TRACKS = [
  { id: "law_school_track",    label: "Bar Part I" },
  { id: "undergraduate_track", label: "Bar Part II" },
];
const ROLES = [
  { id: "law_student",  label: "📖 Law Student",  desc: "All subjects" },
  { id: "bar_student",  label: "🎓 Bar Student",  desc: "Bar exam focused" },
];

export default function SignUp() {
  const { colors }  = useTheme();
  const [email,    setEmail]    = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [track,    setTrack]    = useState("law_school_track");
  const [role,     setRole]     = useState("law_student");
  const [referral, setReferral] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const inputStyle = { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 14, fontFamily: "SpaceGrotesk_400Regular" } as const;
  const labelStyle = { fontSize: 10, color: colors.textMuted, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 6 };

  const handleRegister = async () => {
    setError("");
    const trimmedEmail    = email.trim().toLowerCase();
    const trimmedUsername = username.trim();
    if (!trimmedEmail || !trimmedUsername || !password) { setError("Please fill in all required fields."); return; }
    if (!EMAIL_RE.test(trimmedEmail))                   { setError("Enter a valid email address."); return; }
    if (trimmedUsername.length < 3)                     { setError("Username must be at least 3 characters."); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername))      { setError("Username can only contain letters, numbers, and underscores."); return; }
    if (password.length < 8)                            { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await api.register(trimmedEmail, trimmedUsername, password, track, role, referral.trim() || undefined);
      await setToken(res.token);
      await clearGuest();
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} keyboardShouldPersistTaps="handled">
        <FadeIn duration={400}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(auth)/sign-in")} style={{ marginBottom: 24 }}>
            <Text style={{ color: "#00F5FF", fontSize: 14, fontFamily: "SpaceGrotesk_400Regular" }}>← Back</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 24, fontFamily: "SpaceGrotesk_700Bold", color: colors.text, marginBottom: 6 }}>Create Account</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular", marginBottom: 20 }}>Join thousands of Nigerian law students</Text>

          {!!error && (
            <View style={{ backgroundColor: "rgba(255,45,85,0.1)", borderWidth: 1, borderColor: "rgba(255,45,85,0.4)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 }}>
              <Text style={{ color: "#FF2D55", fontSize: 13, fontFamily: "SpaceGrotesk_400Regular", lineHeight: 18 }}>{error}</Text>
            </View>
          )}

          <View style={{ gap: 12, marginBottom: 20 }}>
            {([
              { label: "Email",    value: email,    set: setEmail,    keyboard: "email-address" as const, auto: "email" as const,    placeholder: "you@lawschool.edu.ng", secure: false },
              { label: "Username", value: username, set: setUsername, keyboard: "default" as const,       auto: "username" as const,  placeholder: "LegalNinja99 (letters, numbers, _)", secure: false },
              { label: "Password", value: password, set: setPassword, keyboard: "default" as const,       auto: "password" as const,  placeholder: "Min 8 characters",     secure: true  },
            ]).map(({ label, value, set, keyboard, auto, placeholder, secure }) => (
              <View key={label}>
                <Text style={labelStyle}>{label}</Text>
                <TextInput value={value} onChangeText={(t) => { set(t); setError(""); }}
                  keyboardType={keyboard} autoCapitalize="none" autoComplete={auto}
                  placeholder={placeholder} secureTextEntry={secure}
                  placeholderTextColor={colors.textFaint} style={inputStyle} />
              </View>
            ))}

            <View>
              <Text style={labelStyle}>Track</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {TRACKS.map((t) => (
                  <TouchableOpacity key={t.id} onPress={() => setTrack(t.id)}
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: track === t.id ? "#00F5FF" : colors.border, backgroundColor: track === t.id ? "rgba(0,245,255,0.08)" : colors.inputBg, alignItems: "center" }}>
                    <Text style={{ color: track === t.id ? "#00F5FF" : colors.textMuted, fontSize: 12, fontFamily: "SpaceGrotesk_700Bold" }}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={labelStyle}>Student Type</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {ROLES.map((r) => (
                  <TouchableOpacity key={r.id} onPress={() => setRole(r.id)}
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: role === r.id ? (r.id === "bar_student" ? "#FFD700" : "#22FF88") : colors.border, backgroundColor: role === r.id ? (r.id === "bar_student" ? "rgba(255,215,0,0.08)" : "rgba(34,255,136,0.08)") : colors.inputBg, alignItems: "center", gap: 2 }}>
                    <Text style={{ color: role === r.id ? (r.id === "bar_student" ? "#FFD700" : "#22FF88") : colors.textMuted, fontSize: 12, fontFamily: "SpaceGrotesk_700Bold" }}>{r.label}</Text>
                    <Text style={{ color: colors.textFaint, fontSize: 9, fontFamily: "SpaceGrotesk_400Regular" }}>{r.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={labelStyle}>Referral Code (optional)</Text>
              <TextInput value={referral} onChangeText={setReferral}
                autoCapitalize="characters" placeholder="NINJA123"
                placeholderTextColor={colors.textFaint}
                style={[inputStyle, { fontFamily: "SpaceMono_400Regular" }]} />
            </View>
          </View>

          <NeonButton label="Create Account" onPress={handleRegister} loading={loading} fullWidth style={{ marginBottom: 20 }} />

          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")} style={{ alignItems: "center" }}>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: "SpaceGrotesk_400Regular" }}>
              Already have an account?{" "}
              <Text style={{ color: "#00F5FF", fontFamily: "SpaceGrotesk_700Bold" }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </FadeIn>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

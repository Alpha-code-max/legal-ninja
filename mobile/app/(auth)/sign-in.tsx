import { FadeIn } from '@components/ui/FadeIn';
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { NeonButton } from "@components/ui/NeonButton";
import { api } from "@lib/api";
import { setToken, setGuest, clearGuest, storage } from "@lib/storage";
import { useTheme } from "@context/ThemeContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const { colors }  = useTheme();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const inputStyle = { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 14, fontFamily: "SpaceGrotesk_400Regular" } as const;
  const labelStyle = { fontSize: 10, color: colors.textMuted, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 6 };

  const handleLogin = async () => {
    setError("");
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password.trim()) { setError("Please enter your email and password."); return; }
    if (!EMAIL_RE.test(trimmedEmail))       { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      const res = await api.login(trimmedEmail, password);
      await setToken(res.token);
      await clearGuest();
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    setError("");
    const existingToken = await storage.getToken();
    if (!existingToken) { setError("Sign in with email and password first. Biometrics unlocks on future visits."); return; }
    const supported = await LocalAuthentication.hasHardwareAsync();
    if (!supported) { setError("Biometric authentication is not available on this device."); return; }
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: "Unlock Legal Ninja" });
    if (result.success) router.replace("/(tabs)");
  };

  const handleGuest = async () => {
    await setGuest(true);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }} keyboardShouldPersistTaps="handled">
        <FadeIn duration={400}>
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(0,245,255,0.1)", borderWidth: 2, borderColor: "#00F5FF", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 32 }}>⚖️</Text>
            </View>
            <Text style={{ fontSize: 28, fontFamily: "SpaceGrotesk_700Bold", color: "#00F5FF", letterSpacing: 1 }}>LEGAL NINJA</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular", marginTop: 4 }}>Master the Law</Text>
          </View>

          {!!error && (
            <View style={{ backgroundColor: "rgba(255,45,85,0.1)", borderWidth: 1, borderColor: "rgba(255,45,85,0.4)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 }}>
              <Text style={{ color: "#FF2D55", fontSize: 13, fontFamily: "SpaceGrotesk_400Regular", lineHeight: 18 }}>{error}</Text>
            </View>
          )}

          <View style={{ gap: 12, marginBottom: 24 }}>
            <View>
              <Text style={labelStyle}>Email</Text>
              <TextInput value={email} onChangeText={(t) => { setEmail(t); setError(""); }}
                keyboardType="email-address" autoCapitalize="none" autoComplete="email"
                placeholder="ninja@lawschool.edu.ng" placeholderTextColor={colors.textFaint}
                style={inputStyle} />
            </View>
            <View>
              <Text style={labelStyle}>Password</Text>
              <TextInput value={password} onChangeText={(t) => { setPassword(t); setError(""); }}
                secureTextEntry autoComplete="password"
                placeholder="••••••••" placeholderTextColor={colors.textFaint}
                style={inputStyle} />
            </View>
          </View>

          <NeonButton label="Login" onPress={handleLogin} loading={loading} fullWidth style={{ marginBottom: 12 }} />
          <NeonButton label="Use Biometrics" onPress={handleBiometric} variant="ghost" fullWidth style={{ marginBottom: 20 }} />

          <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")} style={{ alignItems: "center", marginBottom: 24 }}>
            <Text style={{ color: "#00F5FF", fontSize: 12, fontFamily: "SpaceGrotesk_400Regular" }}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ color: colors.textFaint, fontSize: 11, fontFamily: "SpaceGrotesk_400Regular" }}>OR</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          <NeonButton label="Continue as Guest" onPress={handleGuest} variant="ghost" fullWidth style={{ marginBottom: 24 }} />

          <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")} style={{ alignItems: "center" }}>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: "SpaceGrotesk_400Regular" }}>
              No account?{" "}
              <Text style={{ color: "#00F5FF", fontFamily: "SpaceGrotesk_700Bold" }}>Sign up free</Text>
            </Text>
          </TouchableOpacity>
        </FadeIn>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

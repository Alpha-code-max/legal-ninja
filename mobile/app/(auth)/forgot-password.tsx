import { FadeIn } from '@components/ui/FadeIn';
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from "react-native";
import { router } from "expo-router";
import { NeonButton } from "@components/ui/NeonButton";
import { api } from "@lib/api";
import { useTheme } from "@context/ThemeContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { colors }  = useTheme();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSend = async () => {
    setError("");
    const trimmed = email.trim().toLowerCase();
    if (!trimmed)              { setError("Please enter your email address."); return; }
    if (!EMAIL_RE.test(trimmed)) { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      await api.forgotPassword(trimmed);
      setSent(true);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg, padding: 24 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FadeIn duration={350} style={{ flex: 1, justifyContent: "center" }}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(auth)/sign-in")} style={{ marginBottom: 32 }}>
          <Text style={{ color: "#00F5FF", fontSize: 14, fontFamily: "SpaceGrotesk_400Regular" }}>← Back</Text>
        </TouchableOpacity>

        {sent ? (
          <View style={{ alignItems: "center", gap: 16 }}>
            <Text style={{ fontSize: 40 }}>📬</Text>
            <Text style={{ fontSize: 20, fontFamily: "SpaceGrotesk_700Bold", color: "#22FF88", textAlign: "center" }}>Check your inbox</Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular", textAlign: "center", lineHeight: 20 }}>
              We sent a reset link to{"\n"}<Text style={{ color: colors.text }}>{email}</Text>
            </Text>
            <NeonButton label="Back to Login" onPress={() => router.replace("/(auth)/sign-in")} variant="ghost" style={{ marginTop: 16 }} />
          </View>
        ) : (
          <>
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Image 
                source={require("@/assets/logo.png")} 
                style={{ width: 100, height: 100, marginBottom: 16 }} 
                resizeMode="contain" 
              />
              <Text style={{ fontSize: 24, fontFamily: "SpaceGrotesk_700Bold", color: colors.text, marginBottom: 8 }}>Reset Password</Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular", textAlign: "center" }}>Enter your email and we'll send a reset link.</Text>
            </View>

            {!!error && (
              <View style={{ backgroundColor: "rgba(255,45,85,0.1)", borderWidth: 1, borderColor: "rgba(255,45,85,0.4)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 }}>
                <Text style={{ color: "#FF2D55", fontSize: 13, fontFamily: "SpaceGrotesk_400Regular", lineHeight: 18 }}>{error}</Text>
              </View>
            )}

            <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Email</Text>
            <TextInput value={email} onChangeText={(t) => { setEmail(t); setError(""); }}
              keyboardType="email-address" autoCapitalize="none" autoComplete="email"
              placeholder="you@lawschool.edu.ng" placeholderTextColor={colors.textFaint}
              style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 14, fontFamily: "SpaceGrotesk_400Regular", marginBottom: 24 }} />

            <NeonButton label="Send Reset Link" onPress={handleSend} loading={loading} fullWidth />
          </>
        )}
      </FadeIn>
    </KeyboardAvoidingView>
  );
}

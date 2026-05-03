import { FadeIn } from '@components/ui/FadeIn';
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Modal, Alert } from "react-native";
import { router } from "expo-router";
import { CyberCard } from "@components/ui/CyberCard";
import { NeonButton } from "@components/ui/NeonButton";
import { useTheme } from "@context/ThemeContext";
import { api } from "@lib/api";
import type { ThemeId } from "@lib/theme";

const MISSION = `Legal Ninja was born from a simple frustration: Nigerian law students preparing for the Bar exams had no engaging, mobile-first way to test their knowledge.

Law school is intense. The reading is dense, the exams are unforgiving, and traditional revision methods — stacks of notes and past questions — leave little room for active recall.

We built Legal Ninja to change that. We wanted to make studying feel less like a chore and more like a game — one where every question answered is a step closer to becoming a certified legal professional.

Our goal is to be the most trusted study companion for every Nigerian Bar Part I and Part II student.`;

const CREDITS = [
  { role: "Founder & Lead Developer", name: "Orji Favour" },
  { role: "UI / UX Design",           name: "Orji Favour" },
  { role: "Question Curation",        name: "Legal Ninja Team" },
  { role: "AI Explanations",          name: "Powered by Groq / Gemini" },
  { role: "Payments",                 name: "Paystack" },
  { role: "Infrastructure",           name: "MongoDB Atlas" },
];

const FAQ: { q: string; a: string }[] = [
  { q: "How many free questions do I get?",  a: "Every new account starts with 100 free questions. Earn more by completing quests, referring friends, or purchasing bundles from the Armory." },
  { q: "What tracks are supported?",         a: "Legal Ninja supports Bar Part I (Law School Track) and Bar Part II (Undergraduate Track). Select your track during sign-up or update it in your profile." },
  { q: "How does XP and levelling work?",    a: "You earn XP for correct answers, maintaining streaks, and completing daily quests. Level up from 1L Rookie all the way to Supreme Sensei." },
  { q: "What happens when my balance runs out?", a: "Purchase question bundles from the Armory, or earn questions through quests and referrals. Guest play uses a shared pool." },
  { q: "Are the AI explanations accurate?",  a: "AI explanations are designed to aid understanding. Always cross-reference with your core study materials — they are study aids, not legal advice." },
  { q: "How do I report a wrong question?",  a: "Email support@legalninja.app with the question text. We review every report and correct errors within 48 hours." },
];

const THEMES: { id: ThemeId; label: string; preview: string[]; available: boolean }[] = [
  { id: "cyber_dark", label: "Cyber Dark", preview: ["#050A0F", "#00F5FF", "#C026D3"], available: true },
  { id: "light",      label: "Light Mode", preview: ["#F0F5FA", "#0087B5", "#6D28D9"], available: true },
  { id: "moonlight", label: "Moonlight", preview: ["#0F1419", "#E8EDF5", "#9CA3AF"], available: true },
];

function SectionLabel({ label }: { label: string }) {
  const { colors } = useTheme();
  return <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 24, paddingHorizontal: 4 }}>{label}</Text>;
}

function Row({ icon, label, value, onPress, accent, last }: { icon: string; label: string; value?: string; onPress?: () => void; accent?: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: last ? 0 : 1, borderColor: colors.borderFaint }}>
      <Text style={{ fontSize: 18, marginRight: 14 }}>{icon}</Text>
      <Text style={{ flex: 1, color: accent ?? colors.text, fontSize: 14, fontFamily: "SpaceGrotesk_700Bold" }}>{label}</Text>
      {value && <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: "SpaceGrotesk_400Regular", marginRight: 8 }}>{value}</Text>}
      {onPress && <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>}
    </TouchableOpacity>
  );
}

function ExpandableRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity onPress={() => setOpen((o) => !o)} activeOpacity={0.7}
        style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 18, marginRight: 14 }}>{icon}</Text>
        <Text style={{ flex: 1, color: colors.text, fontSize: 14, fontFamily: "SpaceGrotesk_700Bold" }}>{label}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {open && <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>{children}</View>}
    </View>
  );
}

export default function Settings() {
  const { colors, themeId, setTheme } = useTheme();
  const [faqOpen,      setFaqOpen]      = useState<number | null>(null);
  const [missionOpen,  setMissionOpen]  = useState(false);
  const [creditsOpen,  setCreditsOpen]  = useState(false);
  const [userRole,     setUserRole]     = useState<string>("law_student");
  const [roleLoading,  setRoleLoading]  = useState(false);

  // Fetch user role on mount
  useEffect(() => {
    api.getMe().then((me) => setUserRole(me.role ?? "law_student")).catch(() => {});
  }, []);

  const modalBg   = colors.bgAlt;
  const modalBorder = `${colors.border}`;

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        <FadeIn duration={350}>
          <Text style={{ fontSize: 22, fontFamily: "SpaceGrotesk_700Bold", color: colors.text, marginTop: 4, marginBottom: 4 }}>⚙️ Settings</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular" }}>Manage your account and preferences</Text>

          {/* ACCOUNT */}
          <SectionLabel label="Account" />
          <CyberCard style={{ padding: 0 }}>
            <Row icon="🥷" label="My Profile"   onPress={() => router.push("/(tabs)/profile")} />
            <Row icon="✏️" label="Edit Profile"  onPress={() => router.push("/(tabs)/profile")} last />
          </CyberCard>

          {/* STUDENT TYPE */}
          <SectionLabel label="Student Type" />
          <CyberCard style={{ padding: 16 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Your Role</Text>
            <Text style={{ color: colors.textFaint, fontSize: 11, fontFamily: "SpaceGrotesk_400Regular", marginBottom: 14, lineHeight: 16 }}>
              Bar students see only bar exam subjects. Law students see all subjects.
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                { id: "law_student", label: "📖 Law Student", color: "#22FF88" },
                { id: "bar_student", label: "🎓 Bar Student", color: "#FFD700" },
              ].map((r) => {
                const active = userRole === r.id;
                return (
                  <TouchableOpacity key={r.id}
                    onPress={async () => {
                      if (active || roleLoading) return;
                      setRoleLoading(true);
                      try {
                        await api.updateMe({ role: r.id });
                        setUserRole(r.id);
                        Alert.alert("Updated", `Your role has been changed to ${r.label.replace(/[📖🎓] ?/, "")}.`);
                      } catch {
                        Alert.alert("Error", "Failed to update role. Try again.");
                      } finally {
                        setRoleLoading(false);
                      }
                    }}
                    activeOpacity={active ? 1 : 0.8}
                    style={{
                      flex: 1, borderRadius: 14, borderWidth: 2,
                      borderColor: active ? r.color : colors.border,
                      padding: 14, alignItems: "center", gap: 4,
                      backgroundColor: active ? `${r.color}10` : "transparent",
                      opacity: roleLoading && !active ? 0.5 : 1,
                    }}>
                    <Text style={{ color: active ? r.color : colors.textMuted, fontSize: 13, fontFamily: "SpaceGrotesk_700Bold" }}>{r.label}</Text>
                    <View style={{ backgroundColor: active ? r.color : colors.border, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: active ? colors.bg : colors.textMuted, fontSize: 8, fontFamily: "SpaceGrotesk_700Bold" }}>
                        {active ? "ACTIVE" : "TAP"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </CyberCard>

          {/* APPEARANCE */}
          <SectionLabel label="Appearance" />
          <CyberCard style={{ padding: 16 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Theme</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {THEMES.map((t) => {
                const active = themeId === t.id;
                return (
                  <TouchableOpacity key={t.id}
                    onPress={() => t.available ? setTheme(t.id as ThemeId) : undefined}
                    activeOpacity={t.available ? 0.8 : 1}
                    style={{ flex: 1, borderRadius: 14, borderWidth: 2, borderColor: active ? "#00F5FF" : colors.border, padding: 12, alignItems: "center", gap: 8, backgroundColor: active ? "rgba(0,245,255,0.06)" : "transparent", opacity: t.available ? 1 : 0.45 }}
                  >
                    <View style={{ flexDirection: "row", gap: 4 }}>
                      {t.preview.map((c, i) => <View key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c }} />)}
                    </View>
                    <Text style={{ color: active ? "#00F5FF" : colors.textMuted, fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", textAlign: "center" }}>{t.label}</Text>
                    <View style={{ backgroundColor: active ? "#00F5FF" : colors.border, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: active ? colors.bg : colors.textMuted, fontSize: 8, fontFamily: "SpaceGrotesk_700Bold" }}>
                        {active ? "ACTIVE" : t.available ? "TAP" : "SOON"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </CyberCard>

          {/* SUPPORT */}
          <SectionLabel label="Support" />
          <CyberCard style={{ padding: 0 }}>
            <ExpandableRow icon="❓" label="Help & FAQ">
              <View style={{ gap: 2 }}>
                {FAQ.map((item, i) => (
                  <View key={i} style={{ marginBottom: 4 }}>
                    <TouchableOpacity onPress={() => setFaqOpen(faqOpen === i ? null : i)} activeOpacity={0.75}
                      style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 10 }}>
                      <Text style={{ flex: 1, color: "#00F5FF", fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", lineHeight: 18, paddingRight: 8 }}>{item.q}</Text>
                      <Text style={{ color: "#00F5FF", fontSize: 12 }}>{faqOpen === i ? "▲" : "▼"}</Text>
                    </TouchableOpacity>
                    {faqOpen === i && (
                      <View style={{ backgroundColor: "rgba(0,245,255,0.04)", borderLeftWidth: 3, borderLeftColor: "#00F5FF", borderRadius: 4, padding: 12, marginBottom: 6 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: "SpaceGrotesk_400Regular", lineHeight: 20 }}>{item.a}</Text>
                      </View>
                    )}
                    {i < FAQ.length - 1 && <View style={{ height: 1, backgroundColor: colors.borderFaint }} />}
                  </View>
                ))}
              </View>
            </ExpandableRow>
            <View style={{ height: 1, backgroundColor: colors.borderFaint }} />
            <Row icon="📧" label="Contact Support" onPress={() => Linking.openURL("mailto:support@legalninja.app")} last />
          </CyberCard>

          {/* ABOUT */}
          <SectionLabel label="About" />
          <CyberCard style={{ padding: 0 }}>
            <Row icon="🎯" label="Our Mission"       onPress={() => setMissionOpen(true)} />
            <View style={{ height: 1, backgroundColor: colors.borderFaint }} />
            <Row icon="🏆" label="Credits"           onPress={() => setCreditsOpen(true)} />
            <View style={{ height: 1, backgroundColor: colors.borderFaint }} />
            <Row icon="🔒" label="Privacy Policy"    onPress={() => Linking.openURL("https://legalninja.app/privacy")} />
            <View style={{ height: 1, backgroundColor: colors.borderFaint }} />
            <Row icon="📄" label="Terms of Service"  onPress={() => Linking.openURL("https://legalninja.app/terms")} last />
          </CyberCard>

          {/* FOOTER */}
          <View style={{ alignItems: "center", marginTop: 36, gap: 4 }}>
            <Text style={{ fontSize: 28 }}>⚖️</Text>
            <Text style={{ color: "#00F5FF", fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", letterSpacing: 1 }}>LEGAL NINJA</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceMono_400Regular" }}>Version 1.0.0</Text>
            <Text style={{ color: colors.textFaint, fontSize: 10, fontFamily: "SpaceGrotesk_400Regular", marginTop: 2 }}>Made with ⚖️ in Nigeria</Text>
          </View>
        </FadeIn>
      </ScrollView>

      {/* Mission Modal */}
      <Modal visible={missionOpen} transparent animationType="slide" onRequestClose={() => setMissionOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: modalBg, borderTopWidth: 1, borderColor: modalBorder, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: "80%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: "#00F5FF", fontSize: 16, fontFamily: "SpaceGrotesk_700Bold" }}>🎯 Our Mission</Text>
              <TouchableOpacity onPress={() => setMissionOpen(false)}><Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ color: colors.text, fontSize: 14, fontFamily: "SpaceGrotesk_400Regular", lineHeight: 24 }}>{MISSION}</Text>
            </ScrollView>
            <NeonButton label="Close" onPress={() => setMissionOpen(false)} variant="ghost" fullWidth style={{ marginTop: 20 }} />
          </View>
        </View>
      </Modal>

      {/* Credits Modal */}
      <Modal visible={creditsOpen} transparent animationType="slide" onRequestClose={() => setCreditsOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: modalBg, borderTopWidth: 1, borderColor: modalBorder, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: "#FFD700", fontSize: 16, fontFamily: "SpaceGrotesk_700Bold" }}>🏆 Credits</Text>
              <TouchableOpacity onPress={() => setCreditsOpen(false)}><Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text></TouchableOpacity>
            </View>
            <View style={{ gap: 14 }}>
              {CREDITS.map((c) => (
                <View key={c.role} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottomWidth: 1, borderColor: colors.borderFaint }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: "SpaceGrotesk_400Regular", flex: 1 }}>{c.role}</Text>
                  <Text style={{ color: colors.text, fontSize: 13, fontFamily: "SpaceGrotesk_700Bold" }}>{c.name}</Text>
                </View>
              ))}
            </View>
            <View style={{ marginTop: 20, padding: 14, backgroundColor: "rgba(0,245,255,0.04)", borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_400Regular", textAlign: "center", lineHeight: 18 }}>
                Built with React Native, Expo, Node.js, and MongoDB.{"\n"}© 2025 Legal Ninja. All rights reserved.
              </Text>
            </View>
            <NeonButton label="Close" onPress={() => setCreditsOpen(false)} variant="ghost" fullWidth style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </>
  );
}

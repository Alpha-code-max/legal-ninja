import { FadeIn } from '@components/ui/FadeIn';
import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Alert, Linking, AppState, AppStateStatus } from "react-native";
import { CyberCard } from "@components/ui/CyberCard";
import { NeonButton } from "@components/ui/NeonButton";
import { api } from "@lib/api";
import { storage } from "@lib/storage";
import { useTheme } from "@context/ThemeContext";

const BUNDLES = [
  { index: 0, label: "Starter Pack",  qty: 50,   price: "₦500",   color: "#00F5FF" },
  { index: 1, label: "Standard Pack", qty: 100,  price: "₦1,000", color: "#22FF88" },
  { index: 2, label: "Pro Pack",      qty: 200,  price: "₦1,900", color: "#C026D3" },
  { index: 3, label: "Supreme Pack",  qty: 500,  price: "₦4,500", color: "#FFD700" },
];
const PASSES = [
  { id: "7_day_unlimited",  label: "7-Day Unlimited",     duration: "7 days",  price: "₦700",  color: "#00F5FF", emoji: "⚡" },
  { id: "subject_mastery",  label: "Subject Mastery Pack", duration: "30 days", price: "₦800",  color: "#C026D3", emoji: "🎓" },
];

export default function Store() {
  const { colors }    = useTheme();
  const [loading,     setLoading]     = useState<string | null>(null);
  const [verifying,   setVerifying]   = useState(false);
  const paymentOpen   = useRef(false);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active" && paymentOpen.current) {
        paymentOpen.current = false;
        setVerifying(true);
        api.getBalance().then(() => Alert.alert("Payment received", "Your balance has been updated."))
          .catch(() => Alert.alert("Check your balance", "If payment completed, questions will appear shortly."))
          .finally(() => setVerifying(false));
      }
    });
    return () => sub.remove();
  }, []);

  const handleBuy = async (type: "bundle" | "pass", id: number | string) => {
    const key = `${type}-${id}`;
    const g = await storage.isGuest();
    if (g) { Alert.alert("Sign in required", "Create an account to purchase."); return; }
    setLoading(key);
    try {
      const res = type === "bundle" ? await api.buyBundle(id as number) : await api.buyPass(id as string);
      paymentOpen.current = true;
      await Linking.openURL(res.authorization_url);
    } catch (e: any) {
      Alert.alert("Purchase failed", e.message ?? "Try again.");
    } finally {
      setLoading(null);
    }
  };

  const sectionLabel = { color: colors.textMuted, fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 12 };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 20, fontFamily: "SpaceGrotesk_700Bold", color: colors.text, marginTop: 8, marginBottom: 4 }}>🛒 Armory</Text>
      <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular", marginBottom: 24 }}>Top up questions, unlock unlimited access</Text>

      {verifying && (
        <CyberCard accent="green" style={{ marginBottom: 16, alignItems: "center" }}>
          <Text style={{ color: "#22FF88", fontSize: 12, fontFamily: "SpaceGrotesk_700Bold" }}>Verifying payment...</Text>
        </CyberCard>
      )}

      <Text style={sectionLabel}>Question Bundles</Text>
      <View style={{ gap: 10, marginBottom: 28 }}>
        {BUNDLES.map((b) => (
          <FadeIn key={b.index}>
            <CyberCard>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: b.color, fontSize: 14, fontFamily: "SpaceGrotesk_700Bold" }}>{b.label}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: "SpaceGrotesk_400Regular" }}>
                    <Text style={{ color: colors.text, fontFamily: "SpaceMono_700Bold" }}>{b.qty}</Text> questions
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 8 }}>
                  <Text style={{ color: colors.text, fontSize: 16, fontFamily: "SpaceMono_700Bold" }}>{b.price}</Text>
                  <NeonButton label="Buy" onPress={() => handleBuy("bundle", b.index)} loading={loading === `bundle-${b.index}`} size="sm"
                    variant={b.index === 0 ? "cyan" : b.index === 1 ? "green" : b.index === 2 ? "purple" : "gold"} />
                </View>
              </View>
            </CyberCard>
          </FadeIn>
        ))}
      </View>

      <Text style={sectionLabel}>Unlimited Passes</Text>
      <View style={{ gap: 10 }}>
        {PASSES.map((p) => (
          <FadeIn key={p.id}>
            <CyberCard style={{ borderColor: `${p.color}44` }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${p.color}22`, borderWidth: 1.5, borderColor: p.color, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
                  </View>
                  <View style={{ gap: 3 }}>
                    <Text style={{ color: p.color, fontSize: 14, fontFamily: "SpaceGrotesk_700Bold" }}>{p.label}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_400Regular" }}>Unlimited for {p.duration}</Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end", gap: 8 }}>
                  <Text style={{ color: colors.text, fontSize: 15, fontFamily: "SpaceMono_700Bold" }}>{p.price}</Text>
                  <NeonButton label="Get Pass" onPress={() => handleBuy("pass", p.id)} loading={loading === `pass-${p.id}`} size="sm"
                    variant={p.id === "7_day_unlimited" ? "cyan" : "purple"} />
                </View>
              </View>
            </CyberCard>
          </FadeIn>
        ))}
      </View>

      <View style={{ marginTop: 28, gap: 12 }}>
        <View style={{ padding: 16, backgroundColor: colors.isDark ? "rgba(0,245,255,0.04)" : "rgba(0,135,181,0.06)", borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_400Regular", textAlign: "center", lineHeight: 18 }}>
            🔒 Payments processed securely via Paystack. Questions credited instantly after payment.
          </Text>
        </View>

        <View style={{ padding: 16, backgroundColor: colors.isDark ? "rgba(34,255,136,0.04)" : "rgba(34,255,136,0.06)", borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: "#22FF88", fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", marginBottom: 6 }}>QUESTIONS USAGE ORDER</Text>
          <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: "SpaceGrotesk_400Regular", lineHeight: 16 }}>
            Questions used in this order:{"\n"}
            1️⃣ <Text style={{ color: "#22FF88", fontFamily: "SpaceMono_700Bold" }}>Earned</Text> (from activities){"\n"}
            2️⃣ <Text style={{ color: "#00F5FF", fontFamily: "SpaceMono_700Bold" }}>Paid</Text> (what you purchased){"\n"}
            3️⃣ <Text style={{ color: "#C026D3", fontFamily: "SpaceMono_700Bold" }}>Free</Text> (starter questions)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

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
  { index: 1, label: "Student Pack",  qty: 200,  price: "₦1,500", color: "#22FF88" },
  { index: 2, label: "Ninja Pack",    qty: 500,  price: "₦3,000", color: "#C026D3" },
  { index: 3, label: "Supreme Pack",  qty: 1500, price: "₦8,000", color: "#FFD700" },
];
const PASSES = [
  { id: "daily_pass",   label: "Daily Pass",   duration: "1 day",   price: "₦200",   color: "#00F5FF", emoji: "⚡" },
  { id: "weekly_pass",  label: "Weekly Pass",  duration: "7 days",  price: "₦800",   color: "#22FF88", emoji: "🔥" },
  { id: "monthly_pass", label: "Monthly Pass", duration: "30 days", price: "₦2,500", color: "#C026D3", emoji: "👑" },
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
                    variant={p.id === "daily_pass" ? "cyan" : p.id === "weekly_pass" ? "green" : "purple"} />
                </View>
              </View>
            </CyberCard>
          </FadeIn>
        ))}
      </View>

      <View style={{ marginTop: 28, padding: 16, backgroundColor: colors.isDark ? "rgba(0,245,255,0.04)" : "rgba(0,135,181,0.06)", borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_400Regular", textAlign: "center", lineHeight: 18 }}>
          Payments processed securely via Paystack. You'll be redirected to complete payment in your browser. Questions are credited instantly after payment.
        </Text>
      </View>
    </ScrollView>
  );
}

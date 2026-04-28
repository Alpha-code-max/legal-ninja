import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { getToken, isGuest } from "@lib/storage";
import { useTheme } from "@context/ThemeContext";

export default function Index() {
  const { colors } = useTheme();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const guest = await isGuest();
      if (token || guest) router.replace("/(tabs)");
      else router.replace("/(auth)/sign-in");
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#00F5FF" size="large" />
    </View>
  );
}

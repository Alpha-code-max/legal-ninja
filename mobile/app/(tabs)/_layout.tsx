import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   "#00F5FF",
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize:       10,
          fontFamily:     "SpaceGrotesk_700Bold",
          letterSpacing:  0.5,
          marginBottom:   6,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBg,
          borderTopColor:  colors.tabBorder,
          borderTopWidth:  1,
        },
      }}
    >
      <Tabs.Screen name="index"
        options={{ tabBarLabel: "HUB",      tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text> }} />
      <Tabs.Screen name="play"
        options={{ href: null }} />
      <Tabs.Screen name="leaderboard"
        options={{ tabBarLabel: "RANK",     tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏆</Text> }} />
      <Tabs.Screen name="store"
        options={{ tabBarLabel: "STORE",    tabBarIcon: () => <Text style={{ fontSize: 22 }}>🛒</Text> }} />
      <Tabs.Screen name="profile"
        options={{ tabBarLabel: "PROFILE",  tabBarIcon: () => <Text style={{ fontSize: 22 }}>🥷</Text> }} />
      <Tabs.Screen name="settings"
        options={{ tabBarLabel: "SETTINGS", tabBarIcon: () => <Text style={{ fontSize: 22 }}>⚙️</Text> }} />
    </Tabs>
  );
}

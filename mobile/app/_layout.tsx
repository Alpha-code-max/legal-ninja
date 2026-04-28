import "../global.css";
import { useEffect } from "react";

import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@context/ThemeContext";
import { setUnauthorizedHandler } from "@lib/api";
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from "@expo-google-fonts/space-mono";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function RootStack() {
  const insets       = useSafeAreaInsets();
  const { colors }   = useTheme();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      router.replace("/(auth)/sign-in");
    });
  }, []);

  return (
    <>
      <StatusBar style={colors.statusBar} backgroundColor={colors.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg, paddingTop: insets.top },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quiz/setup" />
        <Stack.Screen name="quiz/active" />
        <Stack.Screen name="quiz/results" />
        <Stack.Screen name="quiz/review" />
        <Stack.Screen name="lobby/index" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

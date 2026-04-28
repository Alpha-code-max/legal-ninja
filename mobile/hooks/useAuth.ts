import { useState, useEffect } from "react";
import { router } from "expo-router";
import { storage } from "@lib/storage";
import { mobileApi } from "@lib/api";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [authed,  setAuthed]  = useState(false);

  useEffect(() => {
    storage.getToken().then((token) => {
      setAuthed(!!token);
      setLoading(false);
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    const { token } = await mobileApi.login(email, password);
    await storage.setToken(token);
    setAuthed(true);
    router.replace("/(tabs)");
  };

  const signOut = async () => {
    await storage.deleteToken();
    await storage.clearGuest();
    setAuthed(false);
    router.replace("/(auth)/sign-in");
  };

  return { loading, authed, signIn, signOut };
}

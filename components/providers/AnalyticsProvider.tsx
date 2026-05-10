"use client";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { useUserStore } from "@/lib/store/user-store";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const user = useUserStore();

  useEffect(() => {
    // Initialize Mixpanel
    analytics.init();

    // Identify user if logged in
    if (user.uid) {
      analytics.identify(user.uid, {
        username: user.username,
        track: user.track,
        role: user.role,
        level: user.level,
      });
    }
  }, [user.uid, user.username, user.track, user.role, user.level]);

  return <>{children}</>;
}

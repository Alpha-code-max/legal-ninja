import { router } from "expo-router";
import { useEffect } from "react";

// Not shown as a tab — used as a programmatic shortcut from the dashboard
export default function Play() {
  useEffect(() => { router.replace("/quiz/setup"); }, []);
  return null;
}

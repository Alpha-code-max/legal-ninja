"use client";
import { useRouter } from "next/navigation";
import { NeonButton } from "@/components/ui/NeonButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useUserStore } from "@/lib/store/user-store";

export default function Home() {
  const router = useRouter();
  const uid = useUserStore((s) => s.uid);
  const isLoggedIn = !!uid;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b" style={{ borderColor: "var(--cyber-border)", background: "rgba(15, 15, 30, 0.7)" }}>
        <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-lg sm:text-xl font-black neon-text-cyan">
            ⚔️ NINJA
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {isLoggedIn ? (
              <NeonButton variant="cyan" size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard
              </NeonButton>
            ) : (
              <>
                <button onClick={() => router.push("/auth/sign-in")} className="text-xs sm:text-sm font-bold hidden sm:block" style={{ color: "var(--text-muted)" }}>
                  Sign In
                </button>
                <NeonButton variant="cyan" size="sm" onClick={() => router.push("/auth/sign-up")}>
                  Sign Up
                </NeonButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 pt-20">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none" style={{ background: "var(--orb-a)" }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none" style={{ background: "var(--orb-b)" }} />

        <div className="relative max-w-4xl text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            <span className="gradient-text">Master Law</span>
            <br />
            <span className="gradient-text">Through Battle</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Compete with other law students. Master Nigerian law through real-time duels. Ace your exams.
          </p>

          <div className="pt-8 space-y-3 max-w-sm mx-auto">
            {isLoggedIn ? (
              <>
                <NeonButton variant="cyan" fullWidth size="lg" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </NeonButton>
              </>
            ) : (
              <>
                <NeonButton variant="cyan" fullWidth size="lg" onClick={() => router.push("/auth/sign-up")}>
                  Start Free (100 Questions)
                </NeonButton>
                <NeonButton variant="ghost" fullWidth size="lg" onClick={() => router.push("/auth/sign-in")}>
                  Already have an account? Sign In
                </NeonButton>
              </>
            )}
          </div>

          <p className="text-xs pt-4" style={{ color: "var(--text-muted)" }}>
            ✅ Trusted by 10K+ Nigerian Law Students
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 text-center" style={{ borderColor: "var(--cyber-border)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          © 2026 Legal Ninja. All rights reserved. 🥷
        </p>
      </footer>
    </div>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/ui/BottomNav";

export const metadata: Metadata = {
  title: "Legal Ninja — Gamified Law Study",
  description: "Master law through competitive quiz battles. Level up. Dominate the leaderboard.",
  keywords: ["law", "legal", "quiz", "study", "gamified", "Nigeria", "bar exam"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload fonts to prevent hydration shifts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Anti-flash theme script — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('legal-ninja-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();`,
          }}
        />
      </head>
      <body className="bg-cyber-bg min-h-screen antialiased relative" suppressHydrationWarning>
        {/* Persistent atmospheric background */}
        <div className="fixed inset-0 pointer-events-none z-[-1]">
          <div className="absolute inset-0 bg-noise" />
          <div className="absolute inset-0 cyber-grid" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_30%_20%,var(--orb-a)_0%,transparent_60%)]" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_70%_80%,var(--orb-b)_0%,transparent_60%)]" />
        </div>

        <main className="relative z-10 min-h-screen">
          {children}
        </main>

        <BottomNav />
      </body>
    </html>
  );
}

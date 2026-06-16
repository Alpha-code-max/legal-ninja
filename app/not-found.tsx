import Link from "next/link";
import { NeonButton } from "@/components/ui/NeonButton";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="cyber-card p-8 text-center flex flex-col items-center gap-3 max-w-sm w-full">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{
            background: "color-mix(in srgb, var(--cyber-purple) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--cyber-purple) 30%, transparent)",
          }}
        >
          🥷
        </div>
        <h1 className="text-5xl font-black gradient-text">404</h1>
        <h2 className="text-base font-black" style={{ color: "var(--text-base)" }}>
          This scroll is missing
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          The page you&apos;re looking for vanished into the shadows.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <NeonButton variant="cyan">Back to Dashboard</NeonButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo — the Legal Ninja brand mark. Renders both theme variants and lets CSS
 * show the right one for the active theme (see `.brand-logo` rules in
 * globals.css). The source JPEGs have solid backgrounds, so a blend mode is
 * applied to make them disappear:
 *   - dark theme  → logo-dark.jpeg  (white ninja on black) + screen
 *   - light theme → logo-light.jpeg (black ninja on white) + multiply
 */
export function Logo({
  size = 64,
  className,
  rounded = false,
  priority = false,
}: {
  size?: number;
  className?: string;
  rounded?: boolean;
  priority?: boolean;
}) {
  return (
    <div
      className={cn("brand-logo relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-dark.jpeg"
        alt="Legal Ninja"
        fill
        priority={priority}
        sizes={`${size}px`}
        className={cn("logo-dark object-contain", rounded && "rounded-xl")}
      />
      <Image
        src="/logo-light.jpeg"
        alt="Legal Ninja"
        fill
        priority={priority}
        sizes={`${size}px`}
        className={cn("logo-light object-contain", rounded && "rounded-xl")}
      />
    </div>
  );
}

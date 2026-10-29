import { cn } from "@/lib/utils";

// Placeholder logo: swap for your own SVG.
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("shrink-0", className)}>
      <defs>
        <radialGradient id="diginest-glow" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#8b74ff" />
          <stop offset="55%" stopColor="#5433eb" />
          <stop offset="100%" stopColor="#1b1450" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="#0b0b0c" />
      <circle cx="16" cy="16" r="10" fill="url(#diginest-glow)" />
      <path
        d="M12.5 10.5h3.2a5.5 5.5 0 0 1 0 11h-3.2z"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

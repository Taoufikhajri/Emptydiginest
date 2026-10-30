import { cn } from "@/lib/utils";

// The logo uploaded in admin Settings, or the default mark tinted with the brand color.
// Size it with a height class (h-8); the width follows the logo's shape.
export function BrandMark({ logoUrl, className }: { logoUrl?: string | null; className?: string }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- served from the database, already sized by the admin
    return <img src={logoUrl} alt="" className={cn("w-auto max-w-[160px] shrink-0 object-contain", className)} />;
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("aspect-square w-auto shrink-0", className)}>
      <defs>
        <radialGradient id="diginest-glow" cx="35%" cy="30%" r="75%">
          <stop offset="0%" style={{ stopColor: "color-mix(in oklab, var(--primary), white 35%)" }} />
          <stop offset="55%" style={{ stopColor: "var(--primary)" }} />
          <stop offset="100%" style={{ stopColor: "color-mix(in oklab, var(--primary), black 65%)" }} />
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

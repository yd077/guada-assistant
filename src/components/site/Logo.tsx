import { Link } from "@tanstack/react-router";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-emerald shadow-glow">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-emerald-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 21h18" />
          <path d="M5 21V8l7-5 7 5v13" />
          <path d="M9 21v-7h6v7" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif text-xl font-semibold tracking-tight ${
            light ? "text-white" : "text-foreground"
          }`}
        >
          BTP Guada
        </span>
        <span
          className={`text-[10px] uppercase tracking-[0.2em] ${
            light ? "text-white/70" : "text-muted-foreground"
          }`}
        >
          Excellence du chantier
        </span>
      </span>
    </Link>
  );
}

import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/recherche", label: "Trouver un artisan" },
  { to: "/projet", label: "Soumettre un projet" },
] as const;

export function Header({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !transparent || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "border-b border-border/60 bg-background/85 backdrop-blur-xl shadow-card"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 py-4">
        <Logo light={!solid} />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className={`text-sm font-medium transition-colors ${
                solid
                  ? "text-foreground/70 hover:text-foreground"
                  : "text-white/80 hover:text-white"
              }`}
              activeProps={{
                className: solid
                  ? "text-foreground font-semibold"
                  : "text-white font-semibold",
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/projet"
            className="inline-flex items-center rounded-full bg-emerald px-5 py-2.5 text-sm font-medium text-emerald-foreground shadow-glow transition-all hover:scale-[1.03] hover:shadow-elegant"
          >
            Démarrer mon projet
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className={`md:hidden rounded-md p-2 ${solid ? "text-foreground" : "text-white"}`}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

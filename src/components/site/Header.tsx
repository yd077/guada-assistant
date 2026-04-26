import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { Menu, X, LogOut, User as UserIcon, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/recherche", label: "Trouver un artisan" },
  { to: "/projet", label: "Soumettre un projet" },
] as const;

export function Header({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, role, signOut, isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const solid = !transparent || scrolled;
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "border-b border-border/60 bg-background/85 backdrop-blur-xl shadow-card"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 py-4">
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

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald text-sm font-semibold text-emerald-foreground shadow-glow transition hover:scale-105"
                aria-label="Menu utilisateur"
              >
                {initial}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-elegant">
                  <div className="border-b border-border px-4 py-3 text-xs">
                    <p className="font-semibold text-foreground">Connecté en tant que</p>
                    <p className="truncate text-muted-foreground">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted"
                  >
                    <UserIcon className="h-4 w-4" /> Mon espace
                  </Link>
                  {role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald hover:bg-muted"
                    >
                      <ShieldCheck className="h-4 w-4" /> Panel admin
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await signOut();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className={`text-sm font-medium transition-colors ${
                solid
                  ? "text-foreground/70 hover:text-foreground"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Connexion
            </Link>
          )}

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
            {isAuthenticated ? (
              <button
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                }}
                className="rounded-md px-3 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                Se déconnecter
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-muted"
              >
                Connexion / Inscription
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

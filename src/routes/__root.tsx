import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">Erreur 404</p>
        <h1 className="mt-3 font-serif text-7xl text-foreground">404</h1>
        <h2 className="mt-3 font-serif text-2xl text-foreground">Page introuvable</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-emerald-foreground shadow-glow hover:opacity-90"
          >
            Retour à l'accueil
          </Link>
          <Link
            to="/recherche"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Trouver un artisan
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BTP Guada — L'excellence du chantier en Guadeloupe" },
      {
        name: "description",
        content:
          "Trouvez les meilleurs artisans BTP vérifiés en Guadeloupe : maçonnerie, électricité, plomberie, peinture, paysagisme. Devis gratuits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "BTP Guada — L'excellence du chantier en Guadeloupe" },
      { name: "twitter:title", content: "BTP Guada — L'excellence du chantier en Guadeloupe" },
      { property: "og:description", content: "Trouvez les meilleurs artisans BTP vérifiés en Guadeloupe : maçonnerie, électricité, plomberie, peinture, paysagisme. Devis gratuits." },
      { name: "twitter:description", content: "Trouvez les meilleurs artisans BTP vérifiés en Guadeloupe : maçonnerie, électricité, plomberie, peinture, paysagisme. Devis gratuits." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Bebas+Neue&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}

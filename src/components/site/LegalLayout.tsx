import { Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { ArrowRight, type LucideIcon } from "lucide-react";

type Section = { title: string; body: React.ReactNode };

export function LegalLayout({
  eyebrow,
  title,
  intro,
  sections,
  icon: Icon,
  cta,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
  icon?: LucideIcon;
  cta?: { label: string; to: "/projet" | "/recherche" | "/contact" };
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-32">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
            {eyebrow}
          </span>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{intro}</p>
        </Reveal>

        <div className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
                <div className="flex items-center gap-3">
                  {Icon && (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <h2 className="font-serif text-2xl">{s.title}</h2>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/80">
                  {s.body}
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        {cta && (
          <Reveal>
            <div className="mt-12 rounded-2xl bg-gradient-to-br from-emerald to-emerald/80 p-8 text-emerald-foreground shadow-glow">
              <h3 className="font-serif text-2xl">Prêt à démarrer&nbsp;?</h3>
              <p className="mt-2 text-sm opacity-90">
                Décrivez votre projet en 2 minutes, recevez jusqu'à 3 devis qualifiés.
              </p>
              <Link
                to={cta.to}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald hover:bg-white/90"
              >
                {cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
      </main>
      <Footer />
    </div>
  );
}

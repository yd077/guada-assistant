import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { createProInquiry, type ProInquiryInput } from "@/services/proInquiries";
import { SPECIALTIES_LIST } from "@/data/specialties";
import {
  Building2,
  ShieldCheck,
  Clock,
  Users,
  Check,
  Loader2,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/contact-pro")({
  head: () => ({
    meta: [
      { title: "Compte Pro Agences & Syndics — BTP Guada" },
      {
        name: "description",
        content:
          "Volume élevé, SLA garantis, tarifs négociés : ouvrez un compte Pro pour agences immobilières et syndics de copropriété en Guadeloupe.",
      },
      { property: "og:title", content: "Compte Pro Agences & Syndics — BTP Guada" },
      {
        property: "og:description",
        content:
          "Tarifs négociés et SLA dédié pour agences et syndics gérant un parc immobilier.",
      },
    ],
  }),
  component: ContactProPage,
});

const BENEFITS = [
  {
    icon: <Users className="h-5 w-5" />,
    title: "Compte multi-utilisateurs",
    text: "Plusieurs gestionnaires sur un même compte, suivi par bien.",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "SLA dédié",
    text: "Engagement de prise en charge sous 2h, 4h ou 24h selon contrat.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Artisans 100% vérifiés",
    text: "Kbis + assurance décennale contrôlés systématiquement.",
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: "Tarifs négociés",
    text: "Remise volumes et facturation centralisée mensuelle.",
  },
];

function ContactProPage() {
  const [form, setForm] = useState<ProInquiryInput>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    client_type: "agence",
    managed_units: null,
    recurring_specialties: [],
    desired_sla: "24h",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const toggleSpec = (name: string) => {
    setForm((f) => {
      const cur = f.recurring_specialties ?? [];
      return {
        ...f,
        recurring_specialties: cur.includes(name)
          ? cur.filter((s) => s !== name)
          : [...cur, name],
      };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_name || !form.email) {
      toast.error("Société, contact et email sont requis.");
      return;
    }
    setBusy(true);
    const r = await createProInquiry(form);
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error ?? "Envoi impossible");
      return;
    }
    toast.success("Demande reçue — nous vous recontactons sous 24h.");
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-32">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              <Building2 className="h-3 w-3" /> Compte Pro
            </span>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">
              Agences & Syndics : déléguez vos chantiers
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Un parc à gérer ? Un partenariat dédié avec tarifs négociés, SLA
              contractuels et facturation centralisée.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                  {b.icon}
                </span>
                <h3 className="mt-3 font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {done ? (
          <Reveal>
            <div className="mt-12 rounded-2xl border border-emerald/30 bg-emerald/5 p-10 text-center">
              <Check className="mx-auto h-10 w-10 text-emerald" />
              <h2 className="mt-3 font-serif text-2xl">Merci !</h2>
              <p className="mt-2 text-muted-foreground">
                Votre demande est arrivée. Notre équipe pro vous recontacte sous
                24h ouvrées.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-sm font-medium text-emerald-foreground"
              >
                Retour à l'accueil <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <form
              onSubmit={submit}
              className="mt-12 grid gap-5 rounded-2xl border border-border bg-card p-8 shadow-card md:grid-cols-2"
            >
              <Field label="Société">
                <Input
                  required
                  value={form.company_name}
                  onChange={(e) =>
                    setForm({ ...form, company_name: e.target.value })
                  }
                />
              </Field>
              <Field label="Contact">
                <Input
                  required
                  value={form.contact_name}
                  onChange={(e) =>
                    setForm({ ...form, contact_name: e.target.value })
                  }
                />
              </Field>
              <Field label="Email pro">
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Téléphone">
                <Input
                  type="tel"
                  value={form.phone ?? ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Type de structure">
                <Select
                  value={form.client_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      client_type: e.target.value as ProInquiryInput["client_type"],
                    })
                  }
                >
                  <option value="agence">Agence immobilière</option>
                  <option value="syndic">Syndic de copropriété</option>
                  <option value="autre">Autre (foncière, bailleur…)</option>
                </Select>
              </Field>
              <Field label="Nombre de biens gérés">
                <Input
                  type="number"
                  min={1}
                  value={form.managed_units ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      managed_units: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </Field>
              <Field label="SLA souhaité">
                <Select
                  value={form.desired_sla ?? "24h"}
                  onChange={(e) =>
                    setForm({ ...form, desired_sla: e.target.value })
                  }
                >
                  <option value="2h">Urgence — sous 2h</option>
                  <option value="4h">Rapide — sous 4h</option>
                  <option value="24h">Standard — sous 24h</option>
                  <option value="48h">Programmable — 48h+</option>
                </Select>
              </Field>
              <div className="md:col-span-2">
                <Label>Métiers récurrents</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SPECIALTIES_LIST.map((s) => {
                    const active =
                      form.recurring_specialties?.includes(s.name) ?? false;
                    return (
                      <button
                        type="button"
                        key={s.slug}
                        onClick={() => toggleSpec(s.name)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${
                          active
                            ? "border-emerald bg-emerald text-emerald-foreground"
                            : "border-border bg-background hover:border-emerald"
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="md:col-span-2">
                <Label>Message (volumes annuels, contraintes…)</Label>
                <textarea
                  rows={4}
                  value={form.message ?? ""}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3 font-medium text-emerald-foreground disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Demander un compte Pro
                </button>
              </div>
            </form>
          </Reveal>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald"
    />
  );
}

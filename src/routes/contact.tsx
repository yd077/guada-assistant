import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — BTP Guada" },
      { name: "description", content: "Une question, une suggestion ? Contactez l'équipe BTP Guada par email, téléphone ou via le formulaire." },
      { property: "og:title", content: "Contact — BTP Guada" },
      { property: "og:description", content: "Joignez l'équipe BTP Guada — réponse sous 24h." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || message.trim().length < 10) {
      toast.error("Merci de compléter le nom et un message d'au moins 10 caractères.");
      return;
    }
    setSubmitting(true);
    try {
      // Pas de table dédiée — on envoie un mailto ou simulation locale.
      // TODO : brancher sur server function + Resend si nécessaire.
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Message envoyé. Nous vous répondrons sous 24h.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-32">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald">
              Restons en contact
            </span>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">Contact</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Une question, une suggestion, un partenariat ? Notre équipe vous répond sous 24h ouvrées.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          <Reveal>
            <div className="space-y-4 lg:col-span-2">
              <ContactCard icon={Mail} label="Email" value="contact@btp-guada.fr" href="mailto:contact@btp-guada.fr" />
              <ContactCard icon={Phone} label="Téléphone" value="+590 590 00 00 00" href="tel:+590590000000" />
              <ContactCard icon={MapPin} label="Adresse" value="Pointe-à-Pitre, Guadeloupe" />
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-serif text-lg">Horaires</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Lundi — vendredi : 8h — 17h<br />
                  Samedi : 9h — 12h
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-card p-8 shadow-sm lg:col-span-3"
            >
              <h2 className="font-serif text-2xl">Envoyer un message</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Nom complet *">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-emerald"
                  />
                </Field>
                <Field label="Email *">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-emerald"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Sujet">
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Question, partenariat, presse…"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-emerald"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Message *">
                  <textarea
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-emerald"
                  />
                </Field>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-emerald-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-50 md:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
                  </>
                ) : (
                  <>
                    Envoyer le message <Send className="h-4 w-4" />
                  </>
                )}
              </button>
              <p className="mt-3 text-xs text-muted-foreground">
                En envoyant ce formulaire, vous acceptez notre politique de confidentialité.
              </p>
            </form>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

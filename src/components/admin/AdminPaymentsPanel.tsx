import { useEffect, useState } from "react";
import { CreditCard, Eye, EyeOff, Loader2, Save, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  fetchPaymentSettings,
  updatePaymentSettings,
  type PaymentSettings,
} from "@/services/payments";

export function AdminPaymentsPanel() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPaymentSettings()
      .then((s) => setSettings(s))
      .catch((e) => toast.error(e.message ?? "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-emerald" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        <AlertTriangle className="mb-2 h-5 w-5" />
        Table <code className="font-mono">payment_settings</code> introuvable. Exécutez la
        migration <code className="font-mono">supabase-migration-payments-email.sql</code>.
      </div>
    );
  }

  const update = <K extends keyof PaymentSettings>(k: K, v: PaymentSettings[K]) =>
    setSettings((s) => (s ? { ...s, [k]: v } : s));

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updatePaymentSettings({
        mode: settings.mode,
        enabled: settings.enabled,
        test_publishable_key: settings.test_publishable_key,
        test_secret_key: settings.test_secret_key,
        test_webhook_secret: settings.test_webhook_secret,
        live_publishable_key: settings.live_publishable_key,
        live_secret_key: settings.live_secret_key,
        live_webhook_secret: settings.live_webhook_secret,
      });
      toast.success("Paramètres Stripe enregistrés");
    } catch (e) {
      toast.error((e as Error).message ?? "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const toggleShow = (k: string) => setShow((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div className="space-y-8">
      {/* En-tête statut */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl">Stripe</h2>
            <p className="text-xs text-muted-foreground">
              Configurez vos clés API pour activer les paiements (achat de crédits artisans).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ModeBadge mode={settings.mode} enabled={settings.enabled} />
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => update("enabled", e.target.checked)}
              className="h-4 w-4 accent-emerald"
            />
            Activé
          </label>
        </div>
      </div>

      {/* Mode */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Mode actif
        </h3>
        <div className="flex gap-3">
          {(["test", "live"] as const).map((m) => (
            <button
              key={m}
              onClick={() => update("mode", m)}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                settings.mode === m
                  ? "border-emerald bg-emerald/10 text-emerald"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {m === "test" ? "Mode Test (sandbox)" : "Mode Live (production)"}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Les clés Live ne doivent être renseignées qu'après vérification de votre compte
          Stripe.
        </p>
      </div>

      {/* Clés Test */}
      <KeyBlock
        title="Clés de Test"
        description="Pour développer et tester sans débit réel."
        fields={[
          {
            key: "test_publishable_key",
            label: "Publishable Key (pk_test_…)",
            value: settings.test_publishable_key,
            secret: false,
          },
          {
            key: "test_secret_key",
            label: "Secret Key (sk_test_…)",
            value: settings.test_secret_key,
            secret: true,
          },
          {
            key: "test_webhook_secret",
            label: "Webhook Signing Secret (whsec_…)",
            value: settings.test_webhook_secret,
            secret: true,
          },
        ]}
        show={show}
        toggleShow={toggleShow}
        onChange={(k, v) => update(k as keyof PaymentSettings, v as never)}
      />

      {/* Clés Live */}
      <KeyBlock
        title="Clés Live (production)"
        description="⚠️ Débit réel. À remplir uniquement après KYC Stripe."
        fields={[
          {
            key: "live_publishable_key",
            label: "Publishable Key (pk_live_…)",
            value: settings.live_publishable_key,
            secret: false,
          },
          {
            key: "live_secret_key",
            label: "Secret Key (sk_live_…)",
            value: settings.live_secret_key,
            secret: true,
          },
          {
            key: "live_webhook_secret",
            label: "Webhook Signing Secret (whsec_…)",
            value: settings.live_webhook_secret,
            secret: true,
          },
        ]}
        show={show}
        toggleShow={toggleShow}
        onChange={(k, v) => update(k as keyof PaymentSettings, v as never)}
      />

      {/* Webhook URL */}
      <div className="rounded-2xl border border-emerald/30 bg-emerald/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-emerald" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">URL de webhook à configurer dans Stripe</p>
            <p className="mt-1 text-muted-foreground">
              Dans Stripe → Developers → Webhooks, ajoutez l'endpoint :
            </p>
            <code className="mt-2 inline-block rounded-md bg-background px-3 py-1.5 font-mono text-xs">
              {typeof window !== "undefined" ? window.location.origin : ""}/api/public/stripe-webhook
            </code>
            <p className="mt-2 text-xs text-muted-foreground">
              Évènements à écouter : <code>checkout.session.completed</code>,{" "}
              <code>payment_intent.succeeded</code>.
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-medium text-emerald-foreground shadow-glow transition hover:scale-105 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer
        </button>
      </div>
    </div>
  );
}

function ModeBadge({ mode, enabled }: { mode: "test" | "live"; enabled: boolean }) {
  if (!enabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        Désactivé
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        mode === "live"
          ? "bg-destructive/10 text-destructive"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          mode === "live" ? "bg-destructive" : "bg-amber-500"
        }`}
      />
      {mode === "live" ? "LIVE" : "TEST"}
    </span>
  );
}

function KeyBlock({
  title,
  description,
  fields,
  show,
  toggleShow,
  onChange,
}: {
  title: string;
  description: string;
  fields: { key: string; label: string; value: string | null; secret: boolean }[];
  show: Record<string, boolean>;
  toggleShow: (k: string) => void;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">{description}</p>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-xs font-medium">{f.label}</label>
            <div className="relative">
              <input
                type={f.secret && !show[f.key] ? "password" : "text"}
                value={f.value ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder="—"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-10 font-mono text-xs outline-none focus:border-emerald"
              />
              {f.secret && (
                <button
                  type="button"
                  onClick={() => toggleShow(f.key)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label={show[f.key] ? "Masquer" : "Afficher"}
                >
                  {show[f.key] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

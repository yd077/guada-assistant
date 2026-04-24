import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import { toast } from "sonner";
import { SPECIALTIES, COMMUNES } from "@/data/artisans";
import { ArtisanZoneEditor } from "./ArtisanZoneEditor";
import { ArtisanWalletPanel } from "./ArtisanWalletPanel";
import { ArtisanDocumentsPanel } from "./ArtisanDocumentsPanel";
import { ArtisanOnboardingChecklist } from "./ArtisanOnboardingChecklist";
import { fetchSubscription } from "@/services/subscriptions";
import {
  Loader2,
  Save,
  ImagePlus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Check,
  ShieldCheck,
} from "lucide-react";

type ArtisanRow = {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  location: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  experience_years: number | null;
  certifications: string[] | null;
  status: "pending" | "verified" | "rejected";
  base_lat: number | null;
  base_lng: number | null;
  radius_km: number | null;
  base_address: string | null;
  kbis_url: string | null;
  insurance_url: string | null;
  verification_status: "pending" | "verified" | "rejected";
  verification_note: string | null;
};

type PortfolioRow = {
  id: string;
  image_url: string;
  title: string | null;
};

type QuoteRow = {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  message: string;
  status: "pending" | "read" | "responded";
  created_at: string;
};

export function ArtisanDashboard({ userId }: { userId: string }) {
  const [artisan, setArtisan] = useState<ArtisanRow | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPaidTier, setHasPaidTier] = useState(false);

  const refresh = async () => {
    const { data: a } = await supabase
      .from("artisans")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (a) {
      setArtisan(a as ArtisanRow);
      const [{ data: p }, { data: q }, sub] = await Promise.all([
        supabase
          .from("portfolio_items")
          .select("id, image_url, title")
          .eq("artisan_id", a.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("quote_requests")
          .select(
            "id, contact_name, contact_email, contact_phone, city, message, status, created_at",
          )
          .eq("artisan_id", a.id)
          .order("created_at", { ascending: false }),
        fetchSubscription(a.id),
      ]);
      setPortfolio((p ?? []) as PortfolioRow[]);
      setQuotes((q ?? []) as QuoteRow[]);
      setHasPaidTier(sub?.tier === "premium" || sub?.tier === "elite");
    } else {
      setArtisan(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-emerald" />
      </div>
    );
  }

  if (!artisan) {
    return <CreateArtisanProfile userId={userId} onCreated={refresh} />;
  }

  return (
    <div className="space-y-12">
      <ProfileEditor artisan={artisan} onSaved={refresh} />
      <ArtisanDocumentsPanel
        artisanId={artisan.id}
        userId={userId}
        initialKbisUrl={artisan.kbis_url ?? null}
        initialInsuranceUrl={artisan.insurance_url ?? null}
        initialStatus={artisan.verification_status ?? "pending"}
        verificationNote={artisan.verification_note}
        onSaved={refresh}
      />
      <ArtisanWalletPanel
        artisanId={artisan.id}
        specialty={artisan.specialty}
        baseLat={artisan.base_lat}
        baseLng={artisan.base_lng}
        radiusKm={artisan.radius_km}
      />
      <ArtisanZoneEditor
        artisanId={artisan.id}
        initialLat={artisan.base_lat}
        initialLng={artisan.base_lng}
        initialRadiusKm={artisan.radius_km ?? 20}
        initialAddress={artisan.base_address}
        onSaved={refresh}
      />
      <PortfolioManager
        artisanId={artisan.id}
        userId={userId}
        items={portfolio}
        onChange={refresh}
      />
      <QuoteRequestsList
        quotes={quotes}
        onUpdate={async (id, status) => {
          const { error } = await supabase
            .from("quote_requests")
            .update({ status })
            .eq("id", id);
          if (error) {
            toast.error("Mise à jour impossible");
          } else {
            toast.success("Statut mis à jour");
            refresh();
          }
        }}
      />
    </div>
  );
}

/* ────────────────────────── création initiale ────────────────────────── */
function CreateArtisanProfile({
  userId,
  onCreated,
}: {
  userId: string;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("artisans").insert({
      user_id: userId,
      name,
      specialty,
      location,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Fiche créée — en attente de vérification");
    onCreated();
  };

  return (
    <Reveal>
      <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
        <h2 className="font-serif text-2xl">Créer ma fiche artisan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Renseignez les infos essentielles. Vous pourrez les compléter ensuite.
        </p>
        <form onSubmit={submit} className="mt-6 grid gap-5">
          <div>
            <Label>Nom / raison sociale</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label>Spécialité</Label>
              <Select value={specialty} onChange={(e) => setSpecialty(e.target.value)} required>
                <option value="">Choisir…</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Commune</Label>
              <Select value={location} onChange={(e) => setLocation(e.target.value)} required>
                <option value="">Choisir…</option>
                {COMMUNES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-6 py-3 font-medium text-emerald-foreground disabled:opacity-60"
          >
            <Save className="h-4 w-4" />{" "}
            {submitting ? "Création…" : "Créer ma fiche"}
          </button>
        </form>
      </div>
    </Reveal>
  );
}

/* ────────────────────────── édition fiche ────────────────────────── */
function ProfileEditor({
  artisan,
  onSaved,
}: {
  artisan: ArtisanRow;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: artisan.name,
    specialty: artisan.specialty,
    location: artisan.location,
    bio: artisan.bio ?? "",
    experience_years: artisan.experience_years ?? 0,
    avatar_url: artisan.avatar_url ?? "",
    cover_url: artisan.cover_url ?? "",
    certifications: (artisan.certifications ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("artisans")
      .update({
        name: form.name,
        specialty: form.specialty,
        location: form.location,
        bio: form.bio,
        experience_years: Number(form.experience_years) || 0,
        avatar_url: form.avatar_url || null,
        cover_url: form.cover_url || null,
        certifications: form.certifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })
      .eq("id", artisan.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Fiche mise à jour");
    onSaved();
  };

  return (
    <Reveal>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Ma fiche</h2>
        <StatusBadge status={artisan.status} />
      </div>

      <form
        onSubmit={save}
        className="mt-4 space-y-5 rounded-2xl border border-border bg-card p-8 shadow-card"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label>Nom</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>Années d'expérience</Label>
            <Input
              type="number"
              min={0}
              value={form.experience_years}
              onChange={(e) =>
                setForm((f) => ({ ...f, experience_years: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <Label>Spécialité</Label>
            <Select
              value={form.specialty}
              onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Commune</Label>
            <Select
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            >
              {COMMUNES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label>Bio / présentation</Label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald"
            placeholder="Présentez votre savoir-faire, votre approche…"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label>URL avatar</Label>
            <Input
              value={form.avatar_url}
              onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
              placeholder="https://…"
            />
          </div>
          <div>
            <Label>URL photo de couverture</Label>
            <Input
              value={form.cover_url}
              onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value }))}
              placeholder="https://…"
            />
          </div>
        </div>

        <div>
          <Label>Certifications (séparées par des virgules)</Label>
          <Input
            value={form.certifications}
            onChange={(e) => setForm((f) => ({ ...f, certifications: e.target.value }))}
            placeholder="RGE Qualibat, Assurance décennale…"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald px-6 py-3 font-medium text-emerald-foreground disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </Reveal>
  );
}

/* ────────────────────────── portfolio ────────────────────────── */
function PortfolioManager({
  artisanId,
  userId,
  items,
  onChange,
}: {
  artisanId: string;
  userId: string;
  items: PortfolioRow[];
  onChange: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");

  const handleFile = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("artisan-media")
      .upload(path, file, { contentType: file.type });

    if (upErr) {
      toast.error(upErr.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("artisan-media").getPublicUrl(path);

    const { error: insErr } = await supabase.from("portfolio_items").insert({
      artisan_id: artisanId,
      image_url: publicUrl,
      title: title || null,
    });

    setUploading(false);
    setTitle("");

    if (insErr) {
      toast.error(insErr.message);
    } else {
      toast.success("Image ajoutée");
      onChange();
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Supprimé");
      onChange();
    }
  };

  return (
    <Reveal>
      <h2 className="font-serif text-2xl">Mon portfolio ({items.length})</h2>

      <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <Label>Titre (optionnel)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Villa contemporaine — Sainte-Anne"
            />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald px-5 py-3 font-medium text-emerald-foreground transition hover:bg-emerald/90">
            <ImagePlus className="h-4 w-4" />
            {uploading ? "Téléversement…" : "Ajouter une image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <figure
              key={it.id}
              className="group relative overflow-hidden rounded-2xl shadow-card"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={it.image_url}
                  alt={it.title ?? ""}
                  className="h-full w-full object-cover"
                />
              </div>
              {it.title && (
                <figcaption className="bg-card p-3 text-sm font-medium">
                  {it.title}
                </figcaption>
              )}
              <button
                onClick={() => remove(it.id)}
                className="absolute right-2 top-2 rounded-full bg-background/90 p-2 opacity-0 shadow-md transition group-hover:opacity-100"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </figure>
          ))}
        </div>
      )}
    </Reveal>
  );
}

/* ────────────────────────── demandes de devis reçues ────────────────────────── */
function QuoteRequestsList({
  quotes,
  onUpdate,
}: {
  quotes: QuoteRow[];
  onUpdate: (id: string, status: "read" | "responded") => void;
}) {
  return (
    <Reveal>
      <h2 className="font-serif text-2xl">Demandes reçues ({quotes.length})</h2>
      {quotes.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Aucune demande pour le moment.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {quotes.map((q) => (
            <article
              key={q.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{q.contact_name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      <a className="underline" href={`mailto:${q.contact_email}`}>
                        {q.contact_email}
                      </a>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      <a className="underline" href={`tel:${q.contact_phone}`}>
                        {q.contact_phone}
                      </a>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {q.city}
                    </span>
                  </div>
                </div>
                <StatusBadge status={q.status} />
              </div>
              <p className="mt-3 whitespace-pre-line text-sm">{q.message}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="text-muted-foreground">
                  {new Date(q.created_at).toLocaleString("fr-FR")}
                </span>
                <div className="ml-auto flex gap-2">
                  {q.status === "pending" && (
                    <button
                      onClick={() => onUpdate(q.id, "read")}
                      className="rounded-full border border-border px-3 py-1 hover:bg-muted"
                    >
                      Marquer comme lu
                    </button>
                  )}
                  {q.status !== "responded" && (
                    <button
                      onClick={() => onUpdate(q.id, "responded")}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald px-3 py-1 text-emerald-foreground"
                    >
                      <Check className="h-3 w-3" /> Répondu
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Reveal>
  );
}

/* ────────────────────────── primitives ────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium">{children}</label>;
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
      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon?: React.ReactNode }> = {
    pending: { label: "En attente", cls: "bg-accent/10 text-accent" },
    verified: {
      label: "Vérifié",
      cls: "bg-emerald/10 text-emerald",
      icon: <ShieldCheck className="h-3 w-3" />,
    },
    rejected: { label: "Refusé", cls: "bg-destructive/10 text-destructive" },
    read: { label: "Lu", cls: "bg-muted text-muted-foreground" },
    responded: { label: "Répondu", cls: "bg-emerald/10 text-emerald" },
  };
  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}
    >
      {s.icon} {s.label}
    </span>
  );
}

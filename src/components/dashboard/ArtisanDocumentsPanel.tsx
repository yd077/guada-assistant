import { useEffect, useState } from "react";
import {
  uploadArtisanDoc,
  getDocSignedUrl,
  type DocKind,
} from "@/services/documents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Upload,
  FileCheck2,
  ExternalLink,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

type Props = {
  artisanId: string;
  userId: string;
  initialKbisUrl: string | null;
  initialInsuranceUrl: string | null;
  initialStatus: "pending" | "verified" | "rejected";
  verificationNote?: string | null;
  onSaved: () => void;
};

export function ArtisanDocumentsPanel({
  artisanId,
  userId,
  initialKbisUrl,
  initialInsuranceUrl,
  initialStatus,
  verificationNote,
  onSaved,
}: Props) {
  const [kbisPath, setKbisPath] = useState(initialKbisUrl);
  const [insurancePath, setInsurancePath] = useState(initialInsuranceUrl);
  const [uploadingKind, setUploadingKind] = useState<DocKind | null>(null);

  useEffect(() => {
    setKbisPath(initialKbisUrl);
    setInsurancePath(initialInsuranceUrl);
  }, [initialKbisUrl, initialInsuranceUrl]);

  const handleUpload = async (kind: DocKind, file: File) => {
    setUploadingKind(kind);
    const r = await uploadArtisanDoc(userId, artisanId, kind, file);
    setUploadingKind(null);
    if (!r.ok) {
      toast.error(r.error ?? "Échec de l'envoi");
      return;
    }
    if (kind === "kbis") setKbisPath(r.path ?? null);
    else setInsurancePath(r.path ?? null);
    toast.success("Document envoyé — en attente de validation admin");
    onSaved();
  };

  const openDoc = async (path: string) => {
    const url = await getDocSignedUrl(path);
    if (!url) {
      toast.error("Lien indisponible");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Reveal>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Documents de vérification</h2>
        <StatusBadge status={initialStatus} />
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        Pour acheter des leads, vous devez fournir un Kbis récent et votre
        attestation d'assurance décennale. La validation est manuelle (≤ 24h).
      </p>

      {initialStatus === "rejected" && verificationNote && (
        <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <strong>Refusé :</strong> {verificationNote}
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <DocCard
          title="Extrait Kbis"
          description="PDF récent (< 3 mois)"
          path={kbisPath}
          uploading={uploadingKind === "kbis"}
          onUpload={(f) => handleUpload("kbis", f)}
          onOpen={() => kbisPath && openDoc(kbisPath)}
        />
        <DocCard
          title="Assurance décennale"
          description="Attestation valide en cours"
          path={insurancePath}
          uploading={uploadingKind === "insurance"}
          onUpload={(f) => handleUpload("insurance", f)}
          onOpen={() => insurancePath && openDoc(insurancePath)}
        />
      </div>
    </Reveal>
  );
}

function DocCard({
  title,
  description,
  path,
  uploading,
  onUpload,
  onOpen,
}: {
  title: string;
  description: string;
  path: string | null;
  uploading: boolean;
  onUpload: (file: File) => void;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {path ? (
          <FileCheck2 className="h-5 w-5 text-emerald" />
        ) : (
          <ShieldAlert className="h-5 w-5 text-amber-500" />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-emerald px-4 py-2 text-xs font-semibold text-emerald-foreground hover:bg-emerald/90">
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          {path ? "Remplacer" : "Téléverser"}
          <input
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }}
          />
        </label>
        {path && (
          <button
            onClick={onOpen}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs hover:bg-muted"
          >
            <ExternalLink className="h-3 w-3" /> Voir
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "verified" | "rejected" }) {
  const map = {
    pending: { label: "En attente", cls: "bg-amber-100 text-amber-800" },
    verified: { label: "Vérifié", cls: "bg-emerald/10 text-emerald" },
    rejected: { label: "Refusé", cls: "bg-destructive/10 text-destructive" },
  } as const;
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}
    >
      <ShieldCheck className="h-3 w-3" /> {s.label}
    </span>
  );
}

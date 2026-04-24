import { Mail, MapPin } from "lucide-react";
import type { AdminQuoteRequest } from "@/services/admin";

const STATUS_TONE: Record<AdminQuoteRequest["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  read: "bg-blue-50 text-blue-700",
  responded: "bg-emerald/10 text-emerald",
};

export function AdminQuoteRequestsPanel({
  requests,
}: {
  requests: AdminQuoteRequest[];
}) {
  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
        Aucune demande de devis.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{r.contact_name}</p>
                <span className="text-xs text-muted-foreground">→ {r.artisans?.name ?? "Artisan"}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_TONE[r.status]}`}
                >
                  {r.status}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {r.city} •{" "}
                {new Date(r.created_at).toLocaleDateString("fr-FR")}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{r.message}</p>
              <a
                href={`mailto:${r.contact_email}`}
                className="mt-2 inline-flex items-center gap-1 text-xs text-emerald hover:underline"
              >
                <Mail className="h-3 w-3" /> {r.contact_email}
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

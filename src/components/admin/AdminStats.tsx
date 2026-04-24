import { Users, ShieldCheck, Clock, Briefcase, Mail, FileText } from "lucide-react";
import type { AdminStats as Stats } from "@/services/admin";

export function AdminStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "Artisans en attente",
      value: stats.artisansPending,
      icon: Clock,
      tone: "text-amber-600 bg-amber-50",
      highlight: true,
    },
    {
      label: "Artisans vérifiés",
      value: stats.artisansVerified,
      icon: ShieldCheck,
      tone: "text-emerald bg-emerald/10",
    },
    {
      label: "Total artisans",
      value: stats.artisansTotal,
      icon: Users,
      tone: "text-foreground bg-muted",
    },
    {
      label: "Projets ouverts",
      value: stats.projectsOpen,
      icon: Briefcase,
      tone: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total projets",
      value: stats.projectsTotal,
      icon: FileText,
      tone: "text-foreground bg-muted",
    },
    {
      label: "Demandes en attente",
      value: stats.quoteRequestsPending,
      icon: Mail,
      tone: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md ${
            c.highlight && c.value > 0 ? "border-amber-300 ring-1 ring-amber-200" : "border-border"
          }`}
        >
          <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.tone}`}>
            <c.icon className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{c.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/services/api";
import { PageShell } from "@/components/layout/PageShell";

const auditQuery = queryOptions({
  queryKey: ["audit"],
  queryFn: () => api.listAuditEvents(),
});

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail — Aegis IR" },
      {
        name: "description",
        content:
          "Ordered record of every meaningful incident event: detections, investigation steps, authorizations and executed actions.",
      },
      { property: "og:title", content: "Audit Trail — Aegis IR" },
      {
        property: "og:description",
        content: "Who decided what, when — across detections, authorizations and executed actions.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(auditQuery),
  component: Audit,
});

const actorLabel = { agent: "Agent", analyst: "Analyst", system: "System" } as const;
const actorTone = {
  agent: "text-agent",
  analyst: "text-primary",
  system: "text-subtle",
} as const;

function Audit() {
  const { data: events } = useSuspenseQuery(auditQuery);
  const [incidentFilter, setIncidentFilter] = useState("All");

  const incidentIds = useMemo(
    () => ["All", ...Array.from(new Set(events.map((e) => e.incidentId)))],
    [events],
  );

  const filtered =
    incidentFilter === "All" ? events : events.filter((e) => e.incidentId === incidentFilter);

  return (
    <PageShell
      eyebrow="System · Audit"
      title="Audit trail"
      description="Every detection, investigation step, authorization and executed action, in order."
      actions={
        <div className="flex flex-wrap gap-1.5">
          {incidentIds.map((id) => (
            <button
              key={id}
              onClick={() => setIncidentFilter(id)}
              className={`rounded-full border px-3 py-1.5 font-mono text-[10.5px] tracking-[0.12em] uppercase transition-colors ${
                id === incidentFilter
                  ? "border-border-strong bg-surface-raised text-foreground"
                  : "border-border text-subtle hover:text-foreground"
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      }
    >
      <ol className="overflow-hidden rounded-lg border border-border bg-surface">
        {filtered.map((e) => (
          <li
            key={e.id}
            className="grid grid-cols-[62px_86px_78px_minmax(0,1fr)] items-baseline gap-3 border-b border-border/70 px-5 py-3 last:border-b-0"
          >
            <span className="font-mono text-[11.5px] text-foreground/80">{e.time}</span>
            <Link
              to="/incidents/$incidentId"
              params={{ incidentId: e.incidentId }}
              className="font-mono text-[11.5px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {e.incidentId}
            </Link>
            <span
              className={`font-mono text-[10.5px] tracking-[0.12em] uppercase ${actorTone[e.actor]}`}
            >
              {actorLabel[e.actor]}
            </span>
            <span className="text-[13px] leading-relaxed text-foreground/90">{e.text}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 font-mono text-[10.5px] tracking-[0.12em] uppercase text-subtle">
        Times shown in UTC · 28 Sep 2026 unless stated
      </p>
    </PageShell>
  );
}

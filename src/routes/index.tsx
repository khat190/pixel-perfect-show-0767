import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { PageShell } from "@/components/layout/PageShell";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { SectionLabel } from "@/components/ui/badges";

const activeIncidentsQuery = queryOptions({
  queryKey: ["incidents", "active"],
  queryFn: () => api.listActiveIncidents(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Active Incidents — Aegis IR" },
      {
        name: "description",
        content:
          "Every incident currently requiring analyst attention, with severity, response stage and time since detection.",
      },
      { property: "og:title", content: "Active Incidents — Aegis IR" },
      {
        property: "og:description",
        content: "Open queue for the security operations team, ordered by what needs attention now.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(activeIncidentsQuery),
  component: ActiveIncidents,
});

function ActiveIncidents() {
  const { data: incidents } = useSuspenseQuery(activeIncidentsQuery);

  const awaiting = incidents.filter((i) => i.status === "awaiting_approval").length;
  const critical = incidents.filter((i) => i.severity === "critical").length;

  return (
    <PageShell
      eyebrow="Incidents · Active"
      title="Active incidents"
      description="The response agent is monitoring each open incident. Consequential actions are held until you authorize them."
      actions={
        <dl className="flex gap-8">
          <div>
            <dt className="label-caps">Open</dt>
            <dd className="mt-1 font-mono text-[22px] leading-none">{incidents.length}</dd>
          </div>
          <div>
            <dt className="label-caps">Critical</dt>
            <dd className="mt-1 font-mono text-[22px] leading-none text-critical">{critical}</dd>
          </div>
          <div>
            <dt className="label-caps">Awaiting you</dt>
            <dd className="mt-1 font-mono text-[22px] leading-none text-primary">{awaiting}</dd>
          </div>
        </dl>
      }
    >
      <SectionLabel right={<span className="font-mono text-[11px] text-subtle">Ordered by attention required</span>}>
        Queue
      </SectionLabel>

      <div className="mt-4 space-y-3">
        {incidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>

      <p className="mt-8 max-w-xl text-[12.5px] leading-relaxed text-subtle">
        Prior incident outcomes and lessons are retained as organizational experience — a memory
        layer powered by Hindsight — and surfaced inside the workspace when they are relevant.
      </p>
    </PageShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { PageShell } from "@/components/layout/PageShell";
import { IncidentCard } from "@/components/incidents/IncidentCard";

const historyQuery = queryOptions({
  queryKey: ["incidents", "history"],
  queryFn: () => api.listIncidentHistory(),
});

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Incident History — Aegis IR" },
      {
        name: "description",
        content:
          "Closed incidents with the action taken, who authorized it and the outcome retained as organizational experience.",
      },
      { property: "og:title", content: "Incident History — Aegis IR" },
      {
        property: "og:description",
        content: "Every resolved incident, its authorized action and its recorded outcome.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(historyQuery),
  component: History,
});

function History() {
  const { data: incidents } = useSuspenseQuery(historyQuery);
  return (
    <PageShell
      eyebrow="Incidents · History"
      title="Incident history"
      description="Closed incidents. Each one contributed its outcome and lesson to organizational experience."
    >
      <div className="space-y-3">
        {incidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </PageShell>
  );
}

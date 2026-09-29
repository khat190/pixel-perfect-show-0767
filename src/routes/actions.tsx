import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { PageShell } from "@/components/layout/PageShell";

const actionsQuery = queryOptions({
  queryKey: ["actions"],
  queryFn: () => api.listActions(),
});

export const Route = createFileRoute("/actions")({
  head: () => ({
    meta: [
      { title: "Response Actions — Aegis IR" },
      {
        name: "description",
        content:
          "Every response action the agent requested, its approval state, execution state and the analyst who authorized it.",
      },
      { property: "og:title", content: "Response Actions — Aegis IR" },
      {
        property: "og:description",
        content: "Human-in-the-loop record: the agent requests, an analyst authorizes, the system executes.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(actionsQuery),
  component: Actions,
});

const approvalTone = {
  pending: "text-primary",
  approved: "text-success/90",
  declined: "text-muted-foreground",
} as const;

const executionTone = {
  not_started: "text-subtle",
  running: "text-primary",
  completed: "text-success/90",
  failed: "text-critical",
} as const;

const executionLabel = {
  not_started: "Not executed",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
} as const;

function Actions() {
  const { data: actions } = useSuspenseQuery(actionsQuery);
  const pending = actions.filter((a) => a.approval === "pending").length;

  return (
    <PageShell
      eyebrow="Response · Actions"
      title="Response actions"
      description="No action here executed without an analyst authorizing it first."
      actions={
        <div>
          <div className="label-caps">Awaiting authorization</div>
          <div className="mt-1 font-mono text-[22px] leading-none text-primary">{pending}</div>
        </div>
      }
    >
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-sunken">
              {["Action", "Incident", "Target", "Requested by", "Approval", "Execution", "Time"].map(
                (h) => (
                  <th key={h} className="label-caps px-4 py-3 font-normal">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.id} className="border-b border-border/70 bg-surface last:border-b-0">
                <td className="px-4 py-3.5">
                  <div className="text-[13px] font-medium">{a.name}</div>
                  <div className="mt-0.5 font-mono text-[10.5px] text-subtle">{a.tool}()</div>
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    to="/incidents/$incidentId"
                    params={{ incidentId: a.incidentId }}
                    className="font-mono text-[11.5px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {a.incidentId}
                  </Link>
                </td>
                <td className="max-w-[220px] px-4 py-3.5 text-[12.5px] text-muted-foreground">
                  {a.target}
                </td>
                <td className="px-4 py-3.5 text-[12.5px] text-muted-foreground">{a.requestedBy}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`font-mono text-[10.5px] tracking-[0.12em] uppercase ${approvalTone[a.approval]}`}
                  >
                    {a.approval === "pending" ? "Pending" : a.approval === "approved" ? "Approved" : "Declined"}
                  </span>
                  {a.approvedBy ? (
                    <div className="mt-0.5 text-[11.5px] text-subtle">{a.approvedBy}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`font-mono text-[10.5px] tracking-[0.12em] uppercase ${executionTone[a.execution]}`}
                  >
                    {executionLabel[a.execution]}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-[11.5px] text-subtle">{a.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

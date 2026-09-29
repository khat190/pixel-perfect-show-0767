import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/services/api";
import { PageShell } from "@/components/layout/PageShell";
import { Chip } from "@/components/ui/badges";

const playbooksQuery = queryOptions({
  queryKey: ["playbooks"],
  queryFn: () => api.listPlaybooks(),
});

export const Route = createFileRoute("/playbooks")({
  head: () => ({
    meta: [
      { title: "Playbooks — Aegis IR" },
      {
        name: "description",
        content:
          "The organization's approved response procedures by incident type, with version, review date and response stages.",
      },
      { property: "og:title", content: "Playbooks — Aegis IR" },
      {
        property: "og:description",
        content: "Approved procedures the response agent must follow, and any proposed updates awaiting review.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(playbooksQuery),
  component: Playbooks,
});

function Playbooks() {
  const { data: playbooks } = useSuspenseQuery(playbooksQuery);
  const [selectedId, setSelectedId] = useState(playbooks[0]?.id ?? "");
  const selected = playbooks.find((p) => p.id === selectedId) ?? playbooks[0];

  return (
    <PageShell
      eyebrow="Response · Playbooks"
      title="Organizational playbooks"
      description="The current approved procedure for each incident type. The agent follows these — it cannot change them without your approval."
    >
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <ul className="space-y-1.5">
          {playbooks.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setSelectedId(p.id)}
                className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
                  p.id === selected?.id
                    ? "border-border-strong bg-surface-raised"
                    : "border-border bg-surface hover:border-border-strong"
                }`}
              >
                <div className="text-[13.5px] font-medium">{p.name}</div>
                <div className="mt-1 flex items-center gap-2 font-mono text-[10.5px] tracking-[0.12em] uppercase text-subtle">
                  {p.version}
                  <span>·</span>
                  <span className={p.status === "approved" ? "text-success/90" : "text-primary"}>
                    {p.status === "approved" ? "Approved" : "Update proposed"}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {selected ? (
          <article className="panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[19px] font-semibold tracking-[-0.01em]">{selected.name}</h2>
                <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                  {selected.description}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 font-mono text-[10.5px] tracking-[0.14em] uppercase ${
                  selected.status === "approved"
                    ? "border-success/30 bg-success/8 text-success/90"
                    : "border-primary/40 bg-primary/10 text-primary"
                }`}
              >
                {selected.status === "approved" ? "Approved" : "Update proposed"}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Chip>Version {selected.version}</Chip>
              <Chip>Reviewed {selected.lastReviewed}</Chip>
              <Chip>Owner {selected.owner}</Chip>
            </div>

            <div className="mt-7 border-t border-border pt-6">
              <div className="label-caps">Response stages</div>
              <ol className="mt-3 divide-y divide-border/70">
                {selected.stages.map((s) => (
                  <li key={s.index} className="flex gap-4 py-2.5">
                    <span className="font-mono text-[11.5px] text-subtle">{s.index}</span>
                    <span className="text-[13px]">{s.name}</span>
                  </li>
                ))}
              </ol>
            </div>

            {selected.status === "proposed_update" ? (
              <p className="mt-6 rounded-md border border-primary/30 bg-primary/[0.05] px-4 py-3 text-[12.5px] leading-relaxed text-foreground/85">
                A revision is pending for this playbook. The approved procedure above stays in force
                until the playbook owner publishes the new version.
              </p>
            ) : null}
          </article>
        ) : null}
      </div>
    </PageShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { PageShell } from "@/components/layout/PageShell";

const lessonsQuery = queryOptions({
  queryKey: ["experience", "lessons"],
  queryFn: () => api.listExperience(),
});

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Lessons — Aegis IR" },
      {
        name: "description",
        content:
          "The distilled lessons carried forward from resolved incidents, each traceable to the incident that produced it.",
      },
      { property: "og:title", content: "Lessons — Aegis IR" },
      {
        property: "og:description",
        content: "Distilled operational lessons the response agent applies to new incidents.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(lessonsQuery),
  component: Lessons,
});

function Lessons() {
  const { data: records } = useSuspenseQuery(lessonsQuery);

  return (
    <PageShell
      eyebrow="Knowledge · Lessons"
      title="Lessons carried forward"
      description="Each lesson stays attached to the incident that produced it, so the reasoning behind it can always be checked."
    >
      <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {records.map((r) => (
          <li key={r.id} className="px-6 py-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[11.5px] tracking-[0.14em] text-subtle">
                {r.incidentId}
              </span>
              <span className="text-[13px] text-muted-foreground">{r.category}</span>
              <span className="ml-auto font-mono text-[11px] text-subtle">{r.occurredAt}</span>
            </div>
            <p className="mt-2.5 max-w-3xl text-[14px] leading-relaxed">{r.lesson}</p>
            <Link
              to="/experience"
              className="mt-3 inline-block font-mono text-[10.5px] tracking-[0.12em] uppercase text-subtle transition-colors hover:text-foreground"
            >
              Full record →
            </Link>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}

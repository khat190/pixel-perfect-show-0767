import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/services/api";
import { PageShell } from "@/components/layout/PageShell";
import { Chip } from "@/components/ui/badges";

const experienceQuery = queryOptions({
  queryKey: ["experience"],
  queryFn: () => api.listExperience(),
});

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Organizational Experience — Aegis IR" },
      {
        name: "description",
        content:
          "What happened before, what worked, and what the team learned — the retained experience the response agent reasons with.",
      },
      { property: "og:title", content: "Organizational Experience — Aegis IR" },
      {
        property: "og:description",
        content: "Accumulated incident experience: outcomes and lessons the agent draws on during live investigations.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(experienceQuery),
  component: Experience,
});

function Experience() {
  const { data: records } = useSuspenseQuery(experienceQuery);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(records.map((r) => r.category)))],
    [records],
  );

  const filtered = records.filter((r) => {
    const matchesCategory = category === "All" || r.category === category;
    const haystack = [r.title, r.incidentId, r.whatHappened, r.lesson, ...r.tags]
      .join(" ")
      .toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  });

  return (
    <PageShell
      eyebrow="Knowledge · Experience"
      title="Organizational experience"
      description="What happened before, what worked, what didn't, and what the team learned. This is retained knowledge — not the approved procedure."
      actions={
        <div className="text-right">
          <div className="label-caps">Retained records</div>
          <div className="mt-1 font-mono text-[22px] leading-none">{records.length}</div>
          <div className="mt-2 font-mono text-[9.5px] tracking-[0.14em] uppercase text-subtle">
            Memory layer · Hindsight
          </div>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search previous incidents…"
          className="w-full max-w-sm rounded-md border border-border bg-surface px-3.5 py-2 text-[13px] outline-none transition-colors focus:border-border-strong placeholder:text-subtle"
        />
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1.5 font-mono text-[10.5px] tracking-[0.12em] uppercase transition-colors ${
                c === category
                  ? "border-border-strong bg-surface-raised text-foreground"
                  : "border-border text-subtle hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((r) => (
          <article key={r.id} className="panel px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11.5px] tracking-[0.14em] text-subtle">
                  {r.incidentId}
                </span>
                <h2 className="text-[16px] font-semibold tracking-[-0.01em]">{r.title}</h2>
              </div>
              <span className="font-mono text-[11px] text-subtle">{r.occurredAt}</span>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {[
                ["What happened", r.whatHappened],
                ["What worked", r.whatWorked],
                ["Outcome", r.outcome],
                ["Lesson", r.lesson],
              ].map(([label, body]) => (
                <div key={label}>
                  <div className="label-caps">{label}</div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/85">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              {r.tags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
              <Link
                to="/lessons"
                className="ml-auto font-mono text-[10.5px] tracking-[0.12em] uppercase text-subtle transition-colors hover:text-foreground"
              >
                View lessons →
              </Link>
            </div>
          </article>
        ))}

        {filtered.length === 0 ? (
          <p className="panel px-6 py-10 text-center text-[13px] text-subtle">
            No retained experience matches that search.
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}

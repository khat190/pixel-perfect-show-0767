import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { api } from "@/services/api";
import { useIncidentSession } from "@/hooks/useIncidentSession";
import { AgentFeed } from "@/components/incidents/AgentFeed";
import { ContextRail } from "@/components/incidents/ContextRail";
import { SeverityTag, StatusTag } from "@/components/ui/badges";
import type { ExperienceRecord, Incident, PlaybookProposal } from "@/types/incident";

const workspaceQuery = (incidentId: string) =>
  queryOptions({
    queryKey: ["incident-workspace", incidentId],
    queryFn: async () => {
      const incident = await api.getIncident(incidentId);
      if (!incident) return null;
      const [playbook, experience, proposals] = await Promise.all([
        api.getPlaybook(incident.playbookId),
        api.getExperienceByIds(incident.relatedExperienceIds),
        api.listProposals(),
      ]);
      return { incident, playbook, experience, proposals };
    },
  });

export const Route = createFileRoute("/incidents/$incidentId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.incidentId} — Incident workspace · Aegis IR` },
      {
        name: "description",
        content:
          "Investigation workspace: evidence, organizational playbook, previous experience and the agent's response plan awaiting analyst authorization.",
      },
      { property: "og:title", content: `${params.incidentId} — Incident workspace · Aegis IR` },
      {
        property: "og:description",
        content: "The AI response agent investigates; the analyst authorizes every consequential action.",
      },
    ],
  }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(workspaceQuery(params.incidentId));
    if (!data) throw notFound();
  },
  component: IncidentWorkspace,
});

function IncidentWorkspace() {
  const { incidentId } = Route.useParams();
  const { data } = useSuspenseQuery(workspaceQuery(incidentId));
  if (!data) return null;
  return (
    <Workspace
      key={incidentId}
      incident={data.incident}
      playbook={data.playbook}
      experience={data.experience}
      proposals={data.proposals}
    />
  );
}

function Workspace({
  incident,
  playbook,
  experience,
  proposals,
}: {
  incident: Incident;
  playbook: Awaited<ReturnType<typeof api.getPlaybook>>;
  experience: ExperienceRecord[];
  proposals: PlaybookProposal[];
}) {
  const session = useIncidentSession(incident);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [session.feed]);

  const experienceById = Object.fromEntries(experience.map((r) => [r.id, r]));
  const proposalById = Object.fromEntries(proposals.map((p) => [p.id, p]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    session.sendMessage(text);
  };

  const suggestions = [
    "Was this IP seen before?",
    "What evidence supports containment?",
    "What does the current playbook require?",
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-8 py-4 lg:px-10">
          <Link
            to="/"
            className="font-mono text-[11px] tracking-[0.14em] uppercase text-subtle transition-colors hover:text-foreground"
          >
            ← Active
          </Link>
          <span className="h-4 w-px bg-border" aria-hidden />
          <span className="font-mono text-[12px] tracking-[0.14em] text-subtle">{incident.id}</span>
          <h1 className="text-[16px] font-semibold tracking-[-0.01em]">{incident.title}</h1>
          <SeverityTag severity={incident.severity} />
          <div className="ml-auto flex items-center gap-4">
            <span className="font-mono text-[11px] text-subtle">
              Detected {incident.detectedAt} · {incident.detectedAgo}
            </span>
            <StatusTag status={session.status} />
          </div>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex min-h-0 flex-col border-border xl:border-r">
          <div className="flex-1 px-8 py-8 lg:px-10">
            <div className="mx-auto max-w-[760px]">
              <div className="label-caps">Agent workspace</div>
              <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-subtle">
                One response agent, working this incident with you. It investigates and recommends;
                consequential actions wait for your authorization.
              </p>
              <div className="mt-7">
                <AgentFeed
                  feed={session.feed}
                  experienceById={experienceById}
                  proposalById={proposalById}
                  onApprove={session.approvePlan}
                  onPostpone={session.postponePlan}
                  onOpenProposal={session.openProposal}
                  onDeclineProposal={session.declineProposal}
                  onDecideProposal={session.decideProposal}
                />
                {session.agentBusy ? (
                  <div className="mt-5 flex items-center gap-2.5 font-mono text-[11px] tracking-[0.14em] uppercase text-subtle">
                    <span className="h-1.5 w-1.5 rounded-full bg-agent animate-pulse-dot" />
                    Agent working
                  </div>
                ) : null}
                <div ref={endRef} />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-border bg-background/95 px-8 py-5 backdrop-blur lg:px-10">
            <div className="mx-auto max-w-[760px]">
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => session.sendMessage(s)}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={submit}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 focus-within:border-border-strong"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask the response agent…"
                  className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-subtle"
                />
                <button
                  type="button"
                  aria-label="Voice input"
                  className="text-subtle transition-colors hover:text-foreground"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <rect x="9" y="2" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
                  </svg>
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-3.5 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </section>

        <aside className="min-w-0 bg-surface-sunken/60">
          <div className="border-b border-border px-5 py-4">
            <div className="label-caps">Incident context</div>
          </div>
          <ContextRail incident={incident} playbook={playbook} experience={experience} />
        </aside>
      </div>
    </div>
  );
}

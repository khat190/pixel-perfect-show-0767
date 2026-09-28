import type { ExperienceRecord, FeedItem, InvestigationStep, PlaybookProposal } from "@/types/incident";

function AgentAvatar() {
  return (
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-agent/35 bg-agent/10 font-mono text-[9.5px] tracking-[0.06em] text-agent">
      AI
    </span>
  );
}

function StepRow({ step }: { step: InvestigationStep }) {
  return (
    <li className="flex items-center gap-3 py-1.5">
      <span
        className={`font-mono text-[12px] ${
          step.state === "done"
            ? "text-success"
            : step.state === "running"
              ? "text-primary animate-pulse-dot"
              : "text-subtle"
        }`}
      >
        {step.state === "done" ? "✓" : step.state === "running" ? "◐" : "○"}
      </span>
      <span
        className={`text-[12.5px] ${step.state === "pending" ? "text-subtle" : "text-foreground/90"}`}
      >
        {step.label}
        {step.state === "running" ? "…" : ""}
      </span>
      <span className="ml-auto font-mono text-[10.5px] text-subtle">{step.tool}()</span>
    </li>
  );
}

function Panel({
  label,
  tone = "default",
  children,
}: {
  label: string;
  tone?: "default" | "plan" | "done";
  children: React.ReactNode;
}) {
  const border =
    tone === "plan" ? "border-primary/35" : tone === "done" ? "border-success/25" : "border-border";
  const bg = tone === "plan" ? "bg-primary/[0.04]" : "bg-surface";
  return (
    <div className={`animate-rise rounded-lg border ${border} ${bg} shadow-panel`}>
      <div className="flex items-center justify-between border-b border-inherit px-4 py-2.5">
        <span
          className={`font-mono text-[10.5px] tracking-[0.16em] uppercase ${
            tone === "plan" ? "text-primary" : tone === "done" ? "text-success" : "text-subtle"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

export function AgentFeed({
  feed,
  experienceById,
  proposalById,
  onApprove,
  onPostpone,
  onOpenProposal,
  onDeclineProposal,
  onDecideProposal,
}: {
  feed: FeedItem[];
  experienceById: Record<string, ExperienceRecord>;
  proposalById: Record<string, PlaybookProposal>;
  onApprove: (id: string) => void;
  onPostpone: (id: string) => void;
  onOpenProposal: (id: string) => void;
  onDeclineProposal: (id: string) => void;
  onDecideProposal: (id: string, decision: "approved" | "rejected") => void;
}) {
  return (
    <div className="space-y-5">
      {feed.map((item) => {
        switch (item.kind) {
          case "agent":
            return (
              <div key={item.id} className="animate-rise flex gap-3">
                <AgentAvatar />
                <div className="max-w-2xl space-y-3 text-[13.5px] leading-[1.65] text-foreground/90">
                  {item.text.split("\n\n").map((p, n) => (
                    <p key={n}>{p}</p>
                  ))}
                </div>
              </div>
            );

          case "analyst":
            return (
              <div key={item.id} className="animate-rise flex justify-end">
                <div className="max-w-xl rounded-lg rounded-br-sm border border-border-strong bg-surface-raised px-4 py-3 text-[13.5px] leading-relaxed">
                  {item.text}
                </div>
              </div>
            );

          case "investigation":
          case "execution":
            return (
              <Panel
                key={item.id}
                label={item.kind === "execution" ? "Executing approved action" : "Investigation"}
                tone={item.kind === "execution" ? "plan" : "default"}
              >
                <ul className="divide-y divide-border/60">
                  {item.steps.map((s) => (
                    <StepRow key={s.label} step={s} />
                  ))}
                </ul>
              </Panel>
            );

          case "experience": {
            const records = item.recordIds.map((id) => experienceById[id]).filter(Boolean);
            return (
              <Panel key={item.id} label={`Previous experience · ${records.length} similar`}>
                <div className="space-y-4">
                  {records.map((r) => (
                    <article key={r.id} className="border-l border-border-strong pl-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] tracking-[0.12em] text-subtle">
                          {r.incidentId}
                        </span>
                        <span className="text-[13px] font-medium">{r.title}</span>
                      </div>
                      <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                        <div>
                          <div className="label-caps">Outcome</div>
                          <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/85">
                            {r.outcome}
                          </p>
                        </div>
                        <div>
                          <div className="label-caps">Lesson</div>
                          <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/85">
                            {r.lesson}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>
            );
          }

          case "plan":
            return (
              <Panel key={item.id} label="Response plan" tone="plan">
                <p className="max-w-2xl text-[13.5px] leading-[1.65] text-foreground/90">
                  {item.recommendation}
                </p>

                <div className="mt-5">
                  <div className="label-caps">Why</div>
                  <ul className="mt-2 space-y-1.5">
                    {item.why.map((w) => (
                      <li key={w} className="flex gap-2.5 text-[12.5px] text-foreground/85">
                        <span className="text-subtle">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 rounded-md border border-border bg-surface-sunken px-4 py-3.5">
                  <div className="label-caps">Proposed action</div>
                  <div className="mt-1.5 text-[14px] font-medium">{item.action.name}</div>
                  <div className="mt-1 font-mono text-[11.5px] text-subtle">
                    {item.action.tool}() · target: {item.action.target}
                  </div>
                </div>

                {item.decision === "pending" ? (
                  <>
                    <div className="mt-4 font-mono text-[10.5px] tracking-[0.16em] uppercase text-primary">
                      Requires analyst approval
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      <button
                        onClick={() => onApprove(item.id)}
                        className="rounded-md bg-primary px-4 py-2 font-mono text-[11.5px] tracking-[0.12em] uppercase text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Approve &amp; execute
                      </button>
                      <button
                        onClick={() => onPostpone(item.id)}
                        className="rounded-md border border-border-strong px-4 py-2 font-mono text-[11.5px] tracking-[0.12em] uppercase text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Not yet
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    className={`mt-4 font-mono text-[10.5px] tracking-[0.16em] uppercase ${
                      item.decision === "approved" ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {item.decision === "approved"
                      ? "Authorized by M. Aren"
                      : "Postponed — nothing executed"}
                  </div>
                )}
              </Panel>
            );

          case "completed":
            return (
              <Panel key={item.id} label="Response completed" tone="done">
                <p className="max-w-2xl text-[13.5px] leading-[1.65] text-foreground/90">
                  {item.summary}
                </p>
                <div className="mt-4">
                  <div className="label-caps">Actions taken</div>
                  <ul className="mt-2 space-y-1.5">
                    {item.actions.map((a) => (
                      <li key={a} className="flex gap-2.5 text-[12.5px] text-foreground/85">
                        <span className="text-success">✓</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="label-caps">Incident status</span>
                  <span className="font-mono text-[11.5px] tracking-[0.14em] uppercase text-success">
                    Resolved
                  </span>
                </div>
              </Panel>
            );

          case "proposal-offer":
            return (
              <div key={item.id} className="animate-rise flex gap-3">
                <AgentAvatar />
                <div className="max-w-2xl">
                  <div className="space-y-3 text-[13.5px] leading-[1.65] text-foreground/90">
                    {item.text.split("\n\n").map((p, n) => (
                      <p key={n}>{p}</p>
                    ))}
                  </div>
                  {item.decision === "pending" ? (
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      <button
                        onClick={() => onOpenProposal(item.id)}
                        className="rounded-md border border-primary/45 bg-primary/10 px-4 py-2 font-mono text-[11.5px] tracking-[0.12em] uppercase text-primary transition-colors hover:bg-primary/15"
                      >
                        Review proposal
                      </button>
                      <button
                        onClick={() => onDeclineProposal(item.id)}
                        className="rounded-md border border-border-strong px-4 py-2 font-mono text-[11.5px] tracking-[0.12em] uppercase text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Not now
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );

          case "proposal": {
            const proposal = proposalById[item.proposalId];
            if (!proposal) return null;
            return (
              <Panel key={item.id} label="Playbook update proposal" tone="plan">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <div className="label-caps">Current</div>
                    <ol className="mt-2 space-y-1.5">
                      {proposal.current.map((s, n) => (
                        <li key={s} className="flex gap-3 text-[12.5px] text-muted-foreground">
                          <span className="font-mono text-[11px] text-subtle">
                            {String(n + 1).padStart(2, "0")}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <div className="label-caps">Proposed</div>
                    <ol className="mt-2 space-y-1.5">
                      {proposal.proposed.map((s, n) => (
                        <li
                          key={s}
                          className={`flex gap-3 text-[12.5px] ${
                            proposal.current.includes(s) ? "text-muted-foreground" : "text-primary"
                          }`}
                        >
                          <span className="font-mono text-[11px] text-subtle">
                            {String(n + 1).padStart(2, "0")}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="mt-5 border-t border-border pt-4">
                  <div className="label-caps">Reason</div>
                  <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-foreground/85">
                    {proposal.reason}
                  </p>
                </div>

                {item.status === "pending" ? (
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <button
                      onClick={() => onDecideProposal(item.id, "approved")}
                      className="rounded-md bg-primary px-4 py-2 font-mono text-[11.5px] tracking-[0.12em] uppercase text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Approve update
                    </button>
                    <button
                      onClick={() => onDecideProposal(item.id, "rejected")}
                      className="rounded-md border border-border-strong px-4 py-2 font-mono text-[11.5px] tracking-[0.12em] uppercase text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div
                    className={`mt-4 font-mono text-[10.5px] tracking-[0.16em] uppercase ${
                      item.status === "approved" ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {item.status === "approved"
                      ? "Recorded as pending version for playbook owner"
                      : "Rejected — playbook unchanged"}
                  </div>
                )}
              </Panel>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}

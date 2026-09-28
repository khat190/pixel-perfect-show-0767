import { Link } from "@tanstack/react-router";
import type { Incident } from "@/types/incident";
import { Chip, SeverityTag, StatusTag } from "@/components/ui/badges";

const stageCopy: Record<Incident["status"], string> = {
  detected: "Triage not started",
  investigating: "Agent investigating",
  awaiting_approval: "Response plan ready for authorization",
  executing: "Approved action running",
  resolved: "Closed and retained",
};

export function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <Link
      to="/incidents/$incidentId"
      params={{ incidentId: incident.id }}
      className="group relative block overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-border-strong hover:bg-surface-raised"
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-[2px] ${
          incident.severity === "critical"
            ? "bg-critical"
            : incident.severity === "high"
              ? "bg-high"
              : incident.severity === "medium"
                ? "bg-medium"
                : "bg-low"
        }`}
      />
      <div className="flex flex-wrap items-start justify-between gap-6 px-6 py-5 pl-7">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11.5px] tracking-[0.14em] text-subtle">
              {incident.id}
            </span>
            <SeverityTag severity={incident.severity} />
          </div>
          <h3 className="mt-2 text-[17px] font-semibold tracking-[-0.01em] text-foreground">
            {incident.title}
          </h3>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
            {incident.summary}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {incident.tags.map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2.5 text-right">
          <StatusTag status={incident.status} />
          <div className="font-mono text-[11px] text-subtle">Detected {incident.detectedAgo}</div>
          <div className="text-[12px] text-muted-foreground">{stageCopy[incident.status]}</div>
          <div className="font-mono text-[11px] text-subtle">Owner · {incident.assignee}</div>
        </div>
      </div>
    </Link>
  );
}

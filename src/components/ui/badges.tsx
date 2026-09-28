import type { IncidentStatus, Severity } from "@/types/incident";
import { cn } from "@/lib/utils";

const severityMeta: Record<Severity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "text-critical" },
  high: { label: "High", color: "text-high" },
  medium: { label: "Medium", color: "text-medium" },
  low: { label: "Low", color: "text-low" },
};

export function SeverityTag({ severity, className }: { severity: Severity; className?: string }) {
  const meta = severityMeta[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase",
        meta.color,
        className,
      )}
    >
      <span className="h-2.5 w-0.5 rounded-full bg-current" aria-hidden />
      {meta.label}
    </span>
  );
}

export function SeverityBar({ severity }: { severity: Severity }) {
  const meta = severityMeta[severity];
  return (
    <span
      aria-hidden
      className={cn("block w-px self-stretch bg-current opacity-80", meta.color)}
    />
  );
}

const statusMeta: Record<IncidentStatus, { label: string; tone: string; live?: boolean }> = {
  detected: { label: "Detected", tone: "text-foreground/85 border-border-strong" },
  investigating: {
    label: "Investigating",
    tone: "text-agent border-agent/35 bg-agent/8",
    live: true,
  },
  awaiting_approval: {
    label: "Awaiting approval",
    tone: "text-primary border-primary/40 bg-primary/10",
  },
  executing: { label: "Executing", tone: "text-primary border-primary/40 bg-primary/10", live: true },
  resolved: { label: "Resolved", tone: "text-success/90 border-success/25 bg-success/8" },
};

export function StatusTag({ status, className }: { status: IncidentStatus; className?: string }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10.5px] tracking-[0.14em] uppercase",
        meta.tone,
        className,
      )}
    >
      {meta.live ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" aria-hidden />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current/60" aria-hidden />
      )}
      {meta.label}
    </span>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-border bg-surface-sunken px-2 py-0.5 font-mono text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionLabel({
  children,
  className,
  right,
}: {
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <h2 className="label-caps">{children}</h2>
      {right}
    </div>
  );
}

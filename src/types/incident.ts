export type Severity = "critical" | "high" | "medium" | "low";

export type IncidentStatus =
  | "detected"
  | "investigating"
  | "awaiting_approval"
  | "executing"
  | "resolved";

export type IncidentCategory =
  | "Authentication anomaly"
  | "Phishing"
  | "Credential compromise"
  | "Malware"
  | "Data exfiltration"
  | "Unauthorized access";

export interface Indicator {
  type: "ip" | "domain" | "hash" | "url" | "account";
  value: string;
  note?: string;
  reputation?: "malicious" | "suspicious" | "unknown" | "clean";
}

export interface EvidenceItem {
  label: string;
  value: string;
}

export interface TimelineEntry {
  time: string;
  text: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  category: IncidentCategory;
  tags: string[];
  detectedAt: string;
  detectedAgo: string;
  summary: string;
  assignee: string;
  subject: { user: string; role: string; host: string; location: string };
  evidence: EvidenceItem[];
  indicators: Indicator[];
  timeline: TimelineEntry[];
  playbookId: string;
  relatedExperienceIds: string[];
}

export interface PlaybookStage {
  index: string;
  name: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  status: "approved" | "proposed_update" | "draft";
  version: string;
  lastReviewed: string;
  owner: string;
  stages: PlaybookStage[];
}

export interface ExperienceRecord {
  id: string;
  incidentId: string;
  title: string;
  category: IncidentCategory;
  occurredAt: string;
  whatHappened: string;
  whatWorked: string;
  outcome: string;
  lesson: string;
  tags: string[];
}

export interface ResponseAction {
  id: string;
  name: string;
  tool: string;
  incidentId: string;
  target: string;
  requestedBy: "Response Agent";
  approval: "pending" | "approved" | "declined";
  execution: "not_started" | "running" | "completed" | "failed";
  timestamp: string;
  approvedBy?: string;
}

export interface AuditEvent {
  id: string;
  incidentId: string;
  time: string;
  date: string;
  actor: "agent" | "analyst" | "system";
  text: string;
}

export interface PlaybookProposal {
  id: string;
  playbookId: string;
  incidentId: string;
  reason: string;
  current: string[];
  proposed: string[];
  status: "pending" | "approved" | "rejected";
}

/* ---- Agent workspace feed ---- */

export type ToolName =
  | "search_logs"
  | "get_user_activity"
  | "check_indicator"
  | "get_active_sessions"
  | "revoke_sessions"
  | "isolate_endpoint"
  | "block_indicator"
  | "create_incident_record";

export interface InvestigationStep {
  label: string;
  tool: ToolName;
  state: "pending" | "running" | "done";
  result?: string;
}

export type FeedItem =
  | { kind: "agent"; id: string; text: string }
  | { kind: "analyst"; id: string; text: string }
  | { kind: "investigation"; id: string; title: string; steps: InvestigationStep[] }
  | { kind: "experience"; id: string; recordIds: string[] }
  | {
      kind: "plan";
      id: string;
      recommendation: string;
      why: string[];
      action: { name: string; tool: ToolName; target: string };
      decision: "pending" | "approved" | "postponed";
    }
  | { kind: "execution"; id: string; steps: InvestigationStep[] }
  | { kind: "completed"; id: string; summary: string; actions: string[] }
  | { kind: "proposal-offer"; id: string; text: string; decision: "pending" | "opened" | "declined" }
  | { kind: "proposal"; id: string; proposalId: string; status: "pending" | "approved" | "rejected" };

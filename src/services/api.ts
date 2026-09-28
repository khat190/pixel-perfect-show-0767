/**
 * Frontend service layer.
 *
 * Every function here mirrors a future REST call against the Python/FastAPI
 * backend. UI components must only talk to this module — never to the mock
 * data directly — so the implementations below can be swapped for `fetch`
 * calls without touching components.
 */
import {
  auditEvents,
  experienceRecords,
  incidents,
  playbookProposals,
  playbooks,
  responseActions,
} from "@/data/mock-data";
import type {
  AuditEvent,
  ExperienceRecord,
  Incident,
  IncidentStatus,
  Playbook,
  PlaybookProposal,
  ResponseAction,
} from "@/types/incident";

const LATENCY = 180;

function respond<T>(payload: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(payload), ms));
}

const ACTIVE: IncidentStatus[] = ["detected", "investigating", "awaiting_approval", "executing"];

export const api = {
  /** GET /incidents?state=active */
  listActiveIncidents: () => respond(incidents.filter((i) => ACTIVE.includes(i.status))),

  /** GET /incidents?state=closed */
  listIncidentHistory: () => respond(incidents.filter((i) => i.status === "resolved")),

  /** GET /incidents */
  listIncidents: () => respond(incidents),

  /** GET /incidents/{id} */
  getIncident: (id: string) => respond(incidents.find((i) => i.id === id) ?? null),

  /** GET /playbooks */
  listPlaybooks: () => respond(playbooks),

  /** GET /playbooks/{id} */
  getPlaybook: (id: string) => respond(playbooks.find((p) => p.id === id) ?? null),

  /** GET /experience?incident={id} */
  listExperience: () => respond(experienceRecords),

  getExperienceByIds: (ids: string[]) =>
    respond(experienceRecords.filter((r) => ids.includes(r.id))),

  /** GET /actions */
  listActions: () => respond(responseActions),

  /** GET /audit */
  listAuditEvents: () => respond(auditEvents),

  /** GET /playbook-proposals */
  listProposals: () => respond(playbookProposals),

  getProposal: (id: string) => respond(playbookProposals.find((p) => p.id === id) ?? null),

  /** POST /incidents/{id}/actions/{actionId}/approve */
  approveAction: (incidentId: string, actionId: string) =>
    respond({ incidentId, actionId, approval: "approved" as const }, 320),

  /** POST /incidents/{id}/actions/{actionId}/postpone */
  postponeAction: (incidentId: string, actionId: string) =>
    respond({ incidentId, actionId, approval: "pending" as const }, 200),

  /** POST /playbook-proposals/{id}/decision */
  decideProposal: (proposalId: string, decision: "approved" | "rejected") =>
    respond({ proposalId, decision }, 320),
};

export type Api = typeof api;
export type { AuditEvent, ExperienceRecord, Incident, Playbook, PlaybookProposal, ResponseAction };

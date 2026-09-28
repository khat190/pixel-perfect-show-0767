import type { Incident, InvestigationStep, ToolName } from "@/types/incident";

export interface AgentScript {
  intro: string;
  investigationTitle: string;
  investigation: InvestigationStep[];
  experienceIntro: string;
  planRecommendation: string;
  planWhy: string[];
  planAction: { name: string; tool: ToolName; target: string };
  execution: InvestigationStep[];
  completedSummary: string;
  completedActions: string[];
  proposalOffer: string;
  proposalId: string;
}

const step = (label: string, tool: ToolName): InvestigationStep => ({
  label,
  tool,
  state: "pending",
});

const byPlaybook: Record<string, (i: Incident) => AgentScript> = {
  "pb-login": (i) => ({
    intro: `I've reviewed the available authentication evidence for ${i.id}. The account ${i.subject.user} authenticated successfully from ${i.subject.location} on a device fingerprint not seen before, and the activity that followed does not match this user's 30-day pattern.\n\nI'm checking session activity and whether this account has been involved in similar incidents before.`,
    investigationTitle: "Investigation",
    investigation: [
      step("Authentication logs checked", "search_logs"),
      step("User activity retrieved", "get_user_activity"),
      step("Indicator reputation checked", "check_indicator"),
      step("Active sessions enumerated", "get_active_sessions"),
    ],
    experienceIntro:
      "I found two previous incidents with similar access patterns. In both cases, collecting authentication evidence before containment preserved useful investigation context, and revoking sessions without also forcing re-authentication left a re-entry path.",
    planRecommendation:
      "Based on the investigation, I recommend revoking this user's active sessions and requiring re-authentication. Evidence has already been captured, so containment will not cost us investigative context.",
    planWhy: [
      "Suspicious privileged authentication confirmed from an unfamiliar hosting ASN",
      "Two active sessions identified, both still valid",
      "Current playbook requires containment once authentication is validated",
      "Two similar historical incidents support this sequence",
    ],
    planAction: {
      name: "Revoke active sessions",
      tool: "revoke_sessions",
      target: i.subject.user,
    },
    execution: [
      step("Authentication evidence collected", "search_logs"),
      step("Active sessions revoked", "revoke_sessions"),
      step("Re-authentication required", "revoke_sessions"),
      step("Containment verified", "get_active_sessions"),
      step("Incident record updated", "create_incident_record"),
    ],
    completedSummary:
      "Containment action completed successfully. Both sessions were terminated and re-authentication is now enforced for this account.",
    completedActions: [
      "Authentication evidence collected",
      "Active sessions revoked",
      "Re-authentication required",
      "Containment verified",
    ],
    proposalOffer:
      "I identified a potential gap in the current response procedure. Reviewing privileged activity between authentication validation and scope determination is what surfaced the delegation change attempt here, but that step is not in the approved playbook.\n\nWould you like me to prepare a proposed playbook update?",
    proposalId: "prop-07",
  }),
};

const generic = (i: Incident): AgentScript => ({
  intro: `I've reviewed the available evidence for ${i.id}. ${i.summary}\n\nI'm gathering the remaining context before proposing a response.`,
  investigationTitle: "Investigation",
  investigation: [
    step("Relevant logs searched", "search_logs"),
    step("Subject activity retrieved", "get_user_activity"),
    step("Indicator reputation checked", "check_indicator"),
  ],
  experienceIntro:
    "Previous incidents of this type in this organization show that confirming scope before containment produced a cleaner outcome and avoided repeat work.",
  planRecommendation:
    "Based on the investigation, I recommend containing the confirmed indicator and recording the evidence package against this incident.",
  planWhy: [
    "Detection corroborated by independent evidence",
    "Scope is bounded to the subject identified above",
    "Current playbook requires containment at this stage",
    "Comparable historical incidents support this sequence",
  ],
  planAction: {
    name: "Block indicator",
    tool: "block_indicator",
    target: i.indicators[0]?.value ?? i.subject.host,
  },
  execution: [
    step("Evidence collected", "search_logs"),
    step("Indicator blocked", "block_indicator"),
    step("Containment verified", "check_indicator"),
    step("Incident record updated", "create_incident_record"),
  ],
  completedSummary: "Containment action completed successfully and verified.",
  completedActions: ["Evidence collected", "Indicator blocked", "Containment verified"],
  proposalOffer:
    "I identified a potential gap in the current response procedure while handling this incident.\n\nWould you like me to prepare a proposed playbook update?",
  proposalId: "prop-07",
});

export function getAgentScript(incident: Incident): AgentScript {
  return (byPlaybook[incident.playbookId] ?? generic)(incident);
}

/** Canned analyst-question handling. A future backend replaces this with POST /incidents/{id}/messages */
export function answerAnalyst(question: string, incident: Incident): string {
  const q = question.toLowerCase();
  if (/do it now|go ahead|approve it|proceed/.test(q)) {
    return "__REPRESENT_PLAN__";
  }
  if (/ip|address|indicator|reputation/.test(q)) {
    const ip = incident.indicators.find((x) => x.type === "ip");
    return ip
      ? `${ip.value} has not authenticated against this tenant before. It resolves to a hosting provider used as a VPN exit and is currently rated ${ip.reputation}. It appeared in one prior incident in this organization, also involving a privileged account.`
      : "No network indicator is attached to this incident yet. The available evidence is identity and activity based.";
  }
  if (/playbook|procedure|require/.test(q)) {
    return "The current approved playbook requires authentication validation, scope determination, evidence collection, then containment — and containment may only run after you authorize it. We are at the containment decision now.";
  }
  if (/session/.test(q)) {
    return "Two sessions are live for this account: one from the original Stockholm device, one from the Warsaw source in question. Neither has been terminated, and both would survive a password reset on its own.";
  }
  if (/evidence|support|why/.test(q)) {
    return "Three things support containment: the authentication came from a source never seen for this account, privileged group enumeration followed within a minute, and a delegation change was attempted and blocked. The account baseline shows no activity outside Stockholm in 90 days.";
  }
  return "I can check authentication activity, user activity, indicator reputation or active sessions for this incident. I'll stop short of any consequential action until you authorize it.";
}

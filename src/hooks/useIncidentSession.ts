import { useCallback, useEffect, useRef, useState } from "react";
import { answerAnalyst, getAgentScript } from "@/data/agent-scripts";
import { api } from "@/services/api";
import type { FeedItem, Incident, IncidentStatus } from "@/types/incident";

let seq = 0;
const nextId = () => `f${++seq}`;

/**
 * Drives the agent conversation for one incident.
 * Every transition here maps to a future FastAPI call; the timers only stand in
 * for streamed backend events.
 */
export function useIncidentSession(incident: Incident) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [status, setStatus] = useState<IncidentStatus>(incident.status);
  const [agentBusy, setAgentBusy] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const script = useRef(getAgentScript(incident));

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const patch = useCallback((id: string, update: (item: FeedItem) => FeedItem) => {
    setFeed((prev) => prev.map((item) => (item.id === id ? update(item) : item)));
  }, []);

  /** Walks an investigation/execution block from pending -> running -> done. */
  const advance = useCallback(
    (blockId: string, count: number, startAt: number, per: number, onDone?: () => void) => {
      for (let idx = 0; idx < count; idx++) {
        later(startAt + idx * per, () =>
          patch(blockId, (item) =>
            item.kind === "investigation" || item.kind === "execution"
              ? {
                  ...item,
                  steps: item.steps.map((s, n) =>
                    n < idx ? { ...s, state: "done" } : n === idx ? { ...s, state: "running" } : s,
                  ),
                }
              : item,
          ),
        );
      }
      later(startAt + count * per, () => {
        patch(blockId, (item) =>
          item.kind === "investigation" || item.kind === "execution"
            ? { ...item, steps: item.steps.map((s) => ({ ...s, state: "done" as const })) }
            : item,
        );
        onDone?.();
      });
    },
    [later, patch],
  );

  const push = useCallback((item: FeedItem) => setFeed((prev) => [...prev, item]), []);

  const presentPlan = useCallback(() => {
    const s = script.current;
    const id = nextId();
    push({
      kind: "plan",
      id,
      recommendation: s.planRecommendation,
      why: s.planWhy,
      action: s.planAction,
      decision: "pending",
    });
    setStatus("awaiting_approval");
    setAgentBusy(false);
    return id;
  }, [push]);

  // Scripted opening investigation.
  useEffect(() => {
    const s = script.current;
    const introId = nextId();
    const invId = nextId();

    later(320, () => push({ kind: "agent", id: introId, text: s.intro }));
    later(1100, () => {
      push({
        kind: "investigation",
        id: invId,
        title: s.investigationTitle,
        steps: s.investigation,
      });
      setStatus("investigating");
    });
    advance(invId, s.investigation.length, 1500, 750, () => {
      push({ kind: "agent", id: nextId(), text: s.experienceIntro });
      later(500, () =>
        push({ kind: "experience", id: nextId(), recordIds: incident.relatedExperienceIds }),
      );
      later(1400, () => presentPlan());
    });

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      push({ kind: "analyst", id: nextId(), text });
      setAgentBusy(true);
      later(850, () => {
        const answer = answerAnalyst(text, incident);
        if (answer === "__REPRESENT_PLAN__") {
          push({
            kind: "agent",
            id: nextId(),
            text: "Understood. Here is the pending action again for your authorization.",
          });
          later(400, () => presentPlan());
          return;
        }
        push({ kind: "agent", id: nextId(), text: answer });
        setAgentBusy(false);
      });
    },
    [incident, later, presentPlan, push],
  );

  const approvePlan = useCallback(
    async (planId: string) => {
      const s = script.current;
      patch(planId, (item) => (item.kind === "plan" ? { ...item, decision: "approved" } : item));
      setStatus("executing");
      setAgentBusy(true);
      await api.approveAction(incident.id, s.planAction.tool);

      const execId = nextId();
      push({ kind: "execution", id: execId, steps: s.execution });
      advance(execId, s.execution.length, 400, 620, () => {
        push({
          kind: "completed",
          id: nextId(),
          summary: s.completedSummary,
          actions: s.completedActions,
        });
        setStatus("resolved");
        later(1300, () => {
          push({
            kind: "proposal-offer",
            id: nextId(),
            text: s.proposalOffer,
            decision: "pending",
          });
          setAgentBusy(false);
        });
      });
    },
    [advance, incident.id, later, patch, push],
  );

  const postponePlan = useCallback(
    async (planId: string) => {
      patch(planId, (item) => (item.kind === "plan" ? { ...item, decision: "postponed" } : item));
      await api.postponeAction(incident.id, script.current.planAction.tool);
      push({
        kind: "agent",
        id: nextId(),
        text: "Nothing has been executed. The proposed action stays pending and the incident remains in a waiting state. Tell me to do it now when you're ready, or ask me to keep investigating.",
      });
      setStatus("awaiting_approval");
    },
    [incident.id, patch, push],
  );

  const openProposal = useCallback(
    (offerId: string) => {
      patch(offerId, (item) =>
        item.kind === "proposal-offer" ? { ...item, decision: "opened" } : item,
      );
      push({
        kind: "proposal",
        id: nextId(),
        proposalId: script.current.proposalId,
        status: "pending",
      });
    },
    [patch, push],
  );

  const declineProposal = useCallback(
    (offerId: string) => {
      patch(offerId, (item) =>
        item.kind === "proposal-offer" ? { ...item, decision: "declined" } : item,
      );
      push({
        kind: "agent",
        id: nextId(),
        text: "Understood — the playbook is unchanged. I've retained the observation with this incident's experience record so it can be reviewed later.",
      });
    },
    [patch, push],
  );

  const decideProposal = useCallback(
    async (itemId: string, decision: "approved" | "rejected") => {
      await api.decideProposal(script.current.proposalId, decision);
      patch(itemId, (item) => (item.kind === "proposal" ? { ...item, status: decision } : item));
      push({
        kind: "agent",
        id: nextId(),
        text:
          decision === "approved"
            ? "The proposed revision is recorded against the playbook as a pending version for the playbook owner to publish. The organization's approved procedure is unchanged until they do."
            : "Proposal rejected. The approved playbook stays as it is, and I've noted your decision with the incident record.",
      });
    },
    [patch, push],
  );

  return {
    feed,
    status,
    agentBusy,
    sendMessage,
    approvePlan,
    postponePlan,
    openProposal,
    declineProposal,
    decideProposal,
  };
}

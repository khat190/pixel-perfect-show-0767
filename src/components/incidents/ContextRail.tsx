import type { ExperienceRecord, Incident, Playbook } from "@/types/incident";
import { Chip } from "@/components/ui/badges";

function Block({
  label,
  meta,
  children,
}: {
  label: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border px-5 py-5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="label-caps">{label}</h3>
        {meta ? <span className="font-mono text-[10.5px] text-subtle">{meta}</span> : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function ContextRail({
  incident,
  playbook,
  experience,
}: {
  incident: Incident;
  playbook: Playbook | null;
  experience: ExperienceRecord[];
}) {
  return (
    <div className="divide-border">
      <Block label="Subject">
        <dl className="space-y-2.5 text-[12.5px]">
          {[
            ["User", incident.subject.user],
            ["Role", incident.subject.role],
            ["Host", incident.subject.host],
            ["Location", incident.subject.location],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-subtle">{k}</dt>
              <dd className="text-right font-mono text-[11.5px] text-foreground/90">{v}</dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block label="Evidence" meta={`${incident.evidence.length} items`}>
        <ul className="space-y-3">
          {incident.evidence.map((e) => (
            <li key={e.label}>
              <div className="text-[11px] tracking-[0.06em] uppercase text-subtle">{e.label}</div>
              <div className="mt-0.5 text-[12.5px] leading-relaxed text-foreground/85">{e.value}</div>
            </li>
          ))}
        </ul>
      </Block>

      {incident.indicators.length > 0 && (
        <Block label="Indicators">
          <ul className="space-y-2.5">
            {incident.indicators.map((ind) => (
              <li key={ind.value} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-mono text-[11.5px] text-foreground/90">
                    {ind.value}
                  </div>
                  {ind.note ? (
                    <div className="mt-0.5 text-[11.5px] text-subtle">{ind.note}</div>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 font-mono text-[10px] tracking-[0.12em] uppercase ${
                    ind.reputation === "malicious"
                      ? "text-critical"
                      : ind.reputation === "suspicious"
                        ? "text-high"
                        : ind.reputation === "clean"
                          ? "text-success"
                          : "text-subtle"
                  }`}
                >
                  {ind.reputation}
                </span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block label="Timeline">
        <ol className="space-y-3">
          {incident.timeline.map((t) => (
            <li key={t.time + t.text} className="flex gap-3">
              <span className="font-mono text-[11px] text-subtle">{t.time}</span>
              <span className="text-[12.5px] leading-relaxed text-foreground/85">{t.text}</span>
            </li>
          ))}
        </ol>
      </Block>

      <Block
        label="Previous experience"
        meta={experience.length ? `${experience.length} similar` : "none matched"}
      >
        {experience.length === 0 ? (
          <p className="text-[12.5px] text-subtle">
            No comparable incident is retained for this pattern yet.
          </p>
        ) : (
          <div className="space-y-4">
            {experience.map((r) => (
              <article key={r.id} className="rounded-md border border-border bg-surface-sunken p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] tracking-[0.12em] text-subtle">
                    {r.incidentId}
                  </span>
                  <span className="font-mono text-[10.5px] text-subtle">{r.occurredAt}</span>
                </div>
                <h4 className="mt-1.5 text-[13px] font-medium">{r.title}</h4>
                <div className="mt-3 text-[11px] tracking-[0.06em] uppercase text-subtle">
                  Outcome
                </div>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-foreground/85">{r.outcome}</p>
                <div className="mt-3 text-[11px] tracking-[0.06em] uppercase text-subtle">Lesson</div>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-foreground/85">{r.lesson}</p>
              </article>
            ))}
            <p className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-subtle">
              Organizational experience · Hindsight
            </p>
          </div>
        )}
      </Block>

      {playbook && (
        <Block label="Current playbook" meta={`${playbook.version} · ${playbook.status === "approved" ? "approved" : "update proposed"}`}>
          <h4 className="text-[13px] font-medium">{playbook.name}</h4>
          <ol className="mt-3 space-y-1.5">
            {playbook.stages.map((s) => (
              <li key={s.index} className="flex gap-3 text-[12.5px]">
                <span className="font-mono text-[11px] text-subtle">{s.index}</span>
                <span className="text-foreground/85">{s.name}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip>Approved procedure</Chip>
            <Chip>Reviewed {playbook.lastReviewed}</Chip>
          </div>
        </Block>
      )}
    </div>
  );
}

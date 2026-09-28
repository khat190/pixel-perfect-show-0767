import { Link } from "@tanstack/react-router";

const groups: { label: string; items: { to: string; label: string }[] }[] = [
  {
    label: "Incidents",
    items: [
      { to: "/", label: "Active" },
      { to: "/history", label: "History" },
    ],
  },
  {
    label: "Response",
    items: [
      { to: "/playbooks", label: "Playbooks" },
      { to: "/actions", label: "Actions" },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { to: "/experience", label: "Experience" },
      { to: "/lessons", label: "Lessons" },
    ],
  },
  {
    label: "System",
    items: [{ to: "/audit", label: "Audit" }],
  },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-[232px] shrink-0 flex-col border-r border-border bg-surface-sunken">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex h-7 w-7 items-center justify-center rounded border border-primary/40 bg-primary/10 font-mono text-[11px] font-semibold text-primary">
          AI
        </span>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-[0.02em]">Aegis IR</div>
          <div className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-subtle">
            Response agent
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="label-caps px-2.5 pb-1.5">{group.label}</div>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.to === "/" }}
                    className="group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    activeProps={{
                      className: "bg-surface-raised text-foreground",
                    }}
                  >
                    <span className="h-3.5 w-px bg-current opacity-25 transition-opacity group-hover:opacity-60" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-5 py-4">
        <div className="label-caps">Analyst</div>
        <div className="mt-1 text-[13px]">M. Aren</div>
        <div className="mt-3 border-t border-border/70 pt-3 font-mono text-[9.5px] leading-relaxed tracking-[0.1em] uppercase text-subtle">
          Experience layer
          <br />
          powered by Hindsight
        </div>
      </div>
    </aside>
  );
}

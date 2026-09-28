import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1180px] px-8 py-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-7">
        <div className="max-w-2xl">
          <div className="label-caps">{eyebrow}</div>
          <h1 className="mt-2.5 text-[26px] font-semibold tracking-[-0.01em]">{title}</h1>
          {description ? (
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </header>
      <div className="pt-8">{children}</div>
    </div>
  );
}

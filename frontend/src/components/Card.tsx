import { ReactNode } from 'react';

interface Props {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Card({ title, children, actions }: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 shadow-lg shadow-black/30">
      <div className="mb-3 flex items-center justify-between gap-2">
        {title && <h3 className="text-sm font-semibold text-slate-200">{title}</h3>}
        {actions}
      </div>
      {children}
    </div>
  );
}

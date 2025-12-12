import { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

interface Props {
  children: ReactNode;
}

export function MainLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  );
}

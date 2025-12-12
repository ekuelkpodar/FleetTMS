import { FiBell, FiUser } from 'react-icons/fi';

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-3 backdrop-blur">
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-400">Current tenant</div>
        <div className="text-sm font-semibold">Acme Logistics</div>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-full bg-slate-800 p-2 text-slate-200 hover:bg-slate-700">
          <FiBell />
        </button>
        <div className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-sm">
          <FiUser />
          <span>alice@acme.test</span>
        </div>
      </div>
    </header>
  );
}

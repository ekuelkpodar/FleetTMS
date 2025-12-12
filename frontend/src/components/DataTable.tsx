import { ReactNode } from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
}

export function DataTable<T>({ data, columns }: Props<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-900 text-slate-400">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-2 text-left font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, idx) => (
            <tr key={idx} className="border-t border-slate-800 hover:bg-slate-900/70">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-2 text-slate-100">
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-500">
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

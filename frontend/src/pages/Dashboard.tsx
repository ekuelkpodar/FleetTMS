import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card } from '../components/Card';

export function DashboardPage() {
  const { data } = useQuery(['analytics'], async () => {
    const res = await api.get('/analytics/summary');
    return res.data;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Total loads (30d)">{data?.totalLoads ?? '—'}</Card>
        <Card title="Loads by status">
          <ul className="space-y-1 text-sm text-slate-300">
            {data?.loadsByStatus?.map((row: any) => (
              <li key={row.status} className="flex justify-between">
                <span>{row.status}</span>
                <span>{row._count}</span>
              </li>
            )) || '—'}
          </ul>
        </Card>
        <Card title="Monthly revenue">
          <div className="space-y-1 text-sm text-slate-300">
            {data?.revenueByMonth?.map((row: any) => (
              <div key={row.month} className="flex justify-between">
                <span>{row.month}</span>
                <span>${row.total.toLocaleString()}</span>
              </div>
            )) || '—'}
          </div>
        </Card>
        <Card title="Top customers">
          <ul className="space-y-1 text-sm text-slate-300">
            {data?.topCustomers?.map((row: any) => (
              <li key={row.id} className="flex justify-between">
                <span>{row.billedToCustomer?.name || 'Customer'}</span>
                <span>${Number(row.amount || 0).toLocaleString()}</span>
              </li>
            )) || '—'}
          </ul>
        </Card>
      </div>
    </div>
  );
}

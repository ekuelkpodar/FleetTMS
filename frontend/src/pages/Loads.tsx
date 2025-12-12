import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { DataTable } from '../components/DataTable';
import { Card } from '../components/Card';

export function LoadsPage() {
  const { data, refetch } = useQuery(['loads'], async () => {
    const res = await api.get('/loads');
    return res.data.data;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Loads</h1>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
        >
          Refresh
        </button>
      </div>
      <Card>
        <DataTable
          data={data || []}
          columns={[
            { key: 'referenceNumber', header: 'Reference' },
            {
              key: 'customer',
              header: 'Customer',
              render: (row) => row.customer?.name || '—',
            },
            { key: 'status', header: 'Status' },
            {
              key: 'stops',
              header: 'Route',
              render: (row) => `${row.stops?.[0]?.location?.city || ''} → ${row.stops?.[row.stops.length - 1]?.location?.city || ''}`,
            },
            { key: 'rateTotal', header: 'Total', render: (row) => `$${row.rateTotal || 0}` },
            {
              key: 'id',
              header: 'Actions',
              render: (row) => (
                <Link to={`/loads/${row.id}`} className="text-blue-400 hover:underline">
                  View
                </Link>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

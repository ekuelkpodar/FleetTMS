import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DataTable } from '../components/DataTable';
import { Card } from '../components/Card';

export function DispatchPage() {
  const { data } = useQuery(['dispatches'], async () => {
    const res = await api.get('/dispatches');
    return res.data.data;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dispatch Board</h1>
      <Card>
        <DataTable
          data={data || []}
          columns={[
            { key: 'status', header: 'Status' },
            { key: 'load', header: 'Load', render: (row) => row.load?.referenceNumber },
            { key: 'driver', header: 'Driver', render: (row) => row.driver?.name || '—' },
            { key: 'carrier', header: 'Carrier', render: (row) => row.carrier?.name || '—' },
          ]}
        />
      </Card>
    </div>
  );
}

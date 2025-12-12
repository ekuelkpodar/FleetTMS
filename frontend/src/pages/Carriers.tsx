import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DataTable } from '../components/DataTable';
import { Card } from '../components/Card';

export function CarriersPage() {
  const { data } = useQuery(['carriers'], async () => {
    const res = await api.get('/carriers');
    return res.data.data;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Carriers</h1>
      <Card>
        <DataTable
          data={data || []}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'mcNumber', header: 'MC' },
            { key: 'dotNumber', header: 'DOT' },
            { key: 'phone', header: 'Phone' },
          ]}
        />
      </Card>
    </div>
  );
}

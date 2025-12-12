import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DataTable } from '../components/DataTable';
import { Card } from '../components/Card';

export function DriversPage() {
  const { data } = useQuery(['drivers'], async () => {
    const res = await api.get('/drivers');
    return res.data.data;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Drivers</h1>
      <Card>
        <DataTable
          data={data || []}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'phone', header: 'Phone' },
            { key: 'status', header: 'Status' },
          ]}
        />
      </Card>
    </div>
  );
}

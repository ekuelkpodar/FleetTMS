import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DataTable } from '../components/DataTable';
import { Card } from '../components/Card';

export function CustomersPage() {
  const { data } = useQuery(['customers'], async () => {
    const res = await api.get('/customers');
    return res.data.data;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customers</h1>
      <Card>
        <DataTable
          data={data || []}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'contactName', header: 'Contact' },
            { key: 'phone', header: 'Phone' },
            { key: 'notes', header: 'Notes' },
          ]}
        />
      </Card>
    </div>
  );
}

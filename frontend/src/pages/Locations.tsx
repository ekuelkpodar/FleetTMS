import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DataTable } from '../components/DataTable';
import { Card } from '../components/Card';

export function LocationsPage() {
  const { data } = useQuery(['locations'], async () => {
    const res = await api.get('/locations');
    return res.data.data;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Locations</h1>
      <Card>
        <DataTable
          data={data || []}
          columns={[
            { key: 'name', header: 'Name' },
            {
              key: 'city',
              header: 'City',
              render: (row) => `${row.city}, ${row.state}`,
            },
            { key: 'postalCode', header: 'Postal' },
            { key: 'country', header: 'Country' },
          ]}
        />
      </Card>
    </div>
  );
}

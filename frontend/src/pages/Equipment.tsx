import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DataTable } from '../components/DataTable';
import { Card } from '../components/Card';

export function EquipmentPage() {
  const { data } = useQuery(['equipment'], async () => {
    const res = await api.get('/equipment');
    return res.data.data;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Equipment</h1>
      <Card>
        <DataTable
          data={data || []}
          columns={[
            { key: 'type', header: 'Type' },
            { key: 'trailerNumber', header: 'Trailer #'},
            { key: 'plateNumber', header: 'Plate'},
            { key: 'capacityWeight', header: 'Capacity (lbs)'},
          ]}
        />
      </Card>
    </div>
  );
}

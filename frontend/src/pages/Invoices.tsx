import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DataTable } from '../components/DataTable';
import { Card } from '../components/Card';

export function InvoicesPage() {
  const { data } = useQuery(['invoices'], async () => {
    const res = await api.get('/billing/invoices');
    return res.data.data;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <Card>
        <DataTable
          data={data || []}
          columns={[
            { key: 'invoiceNumber', header: 'Invoice #' },
            { key: 'status', header: 'Status' },
            { key: 'amount', header: 'Amount', render: (row) => `$${row.amount}` },
            { key: 'issuedAt', header: 'Issued', render: (row) => new Date(row.issuedAt).toLocaleDateString() },
          ]}
        />
      </Card>
    </div>
  );
}

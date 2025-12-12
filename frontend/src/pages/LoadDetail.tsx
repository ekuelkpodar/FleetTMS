import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card } from '../components/Card';

export function LoadDetailPage() {
  const { id } = useParams();
  const { data } = useQuery(['load', id], async () => {
    const res = await api.get(`/loads/${id}`);
    return res.data.data;
  });

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Load</div>
          <h1 className="text-2xl font-bold">{data.referenceNumber}</h1>
        </div>
        <span className="rounded-full bg-blue-600/30 px-3 py-1 text-sm text-blue-200">{data.status}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Route">
          <ol className="space-y-2 text-sm">
            {data.stops.map((stop: any) => (
              <li key={stop.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">{stop.stopType}</span>
                  <span className="text-xs text-slate-500">Seq {stop.sequenceNumber}</span>
                </div>
                <div className="text-slate-200">{stop.location?.name}</div>
                <div className="text-xs text-slate-400">{stop.location?.city}</div>
              </li>
            ))}
          </ol>
        </Card>
        <Card title="Items">
          <ul className="space-y-2 text-sm text-slate-300">
            {data.items?.map((item: any) => (
              <li key={item.id} className="flex justify-between rounded border border-slate-800 bg-slate-900/50 p-2">
                <span>{item.description}</span>
                <span>{item.weight || 0} lbs</span>
              </li>
            )) || '—'}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Tracking">
          <div className="space-y-2 text-sm text-slate-300">
            {data.trackingEvents?.map((event: any) => (
              <div key={event.id} className="rounded border border-slate-800 bg-slate-900/60 p-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{event.eventType}</span>
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
                <div>{event.notes}</div>
              </div>
            )) || '—'}
          </div>
        </Card>
        <Card title="Documents">
          <ul className="space-y-2 text-sm text-blue-200">
            {data.documents?.map((doc: any) => (
              <li key={doc.id} className="flex items-center justify-between rounded border border-slate-800 bg-slate-900/60 p-2">
                <span>
                  {doc.type} · {doc.fileName}
                </span>
                <button className="text-blue-400 hover:underline">Download</button>
              </li>
            )) || '—'}
          </ul>
        </Card>
      </div>
    </div>
  );
}

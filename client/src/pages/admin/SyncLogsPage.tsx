import { useEffect, useState } from 'react';
import { SyncLog } from '../../types';
import { syncApi } from '../../api/sync';

export function SyncLogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    syncApi.logs().then(setLogs).finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <div className="p-8 text-gray-500">Laden...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sync logs</h1>
          <p className="text-gray-500 mt-1">Overzicht van alle synchronisaties</p>
        </div>
        <button onClick={load} className="text-sm text-[#005eb8] hover:underline">Verversen</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gestart</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bron</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bericht</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log) => {
              const duration = log.finishedAt
                ? Math.round((new Date(log.finishedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
                : null;
              return (
                <tr key={log.id}>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(log.startedAt).toLocaleString('nl-NL')}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500 text-xs max-w-[120px] truncate">{log.source}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-[300px]">{log.message ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      log.status === 'success' ? 'bg-green-100 text-green-700' :
                      log.status === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {duration !== null ? `${duration}s` : '—'}
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Nog geen sync logs</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

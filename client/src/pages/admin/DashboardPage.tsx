import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Screen, SyncLog } from '../../types';
import { screensApi } from '../../api/screens';
import { syncApi } from '../../api/sync';

export function DashboardPage() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);

  useEffect(() => {
    screensApi.list().then(setScreens).catch(console.error);
    syncApi.logs().then((l) => setLogs(l.slice(0, 5))).catch(console.error);
  }, []);

  const activeScreens = screens.filter((s) => s.active);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overzicht van TV-schermen en recente activiteit</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-[#005eb8]">{activeScreens.length}</div>
          <div className="text-sm text-gray-600 mt-1">Actieve schermen</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-[#005eb8]">{screens.length}</div>
          <div className="text-sm text-gray-600 mt-1">Totaal schermen</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-[#e57200]">
            {logs.filter((l) => l.status === 'success').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Syncs (laatste 5)</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">TV-schermen</h2>
            <Link to="/admin/screens" className="text-sm text-[#005eb8] hover:underline">Alle schermen →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {screens.slice(0, 5).map((screen) => (
              <div key={screen.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{screen.name}</div>
                  <div className="text-xs text-gray-400">/screens/{screen.slug}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${screen.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {screen.active ? 'Actief' : 'Inactief'}
                </span>
              </div>
            ))}
            {screens.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">Nog geen schermen aangemaakt</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recente sync logs</h2>
            <Link to="/admin/sync-logs" className="text-sm text-[#005eb8] hover:underline">Alle logs →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">{new Date(log.startedAt).toLocaleString('nl-NL')}</div>
                  <div className="text-sm text-gray-600 mt-0.5 truncate max-w-[200px]">{log.message ?? log.source}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  log.status === 'success' ? 'bg-green-100 text-green-700' :
                  log.status === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">Nog geen sync logs</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

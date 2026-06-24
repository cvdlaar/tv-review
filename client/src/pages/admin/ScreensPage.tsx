import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Screen } from '../../types';
import { screensApi } from '../../api/screens';

export function ScreensPage() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    screensApi.list().then(setScreens).finally(() => setLoading(false));
  }, []);

  const copyScreenUrl = (screen: Screen) => {
    const url = `${window.location.origin}/screens/${screen.slug}?key=${screen.screenKey}`;
    navigator.clipboard.writeText(url);
    setCopiedId(screen.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const regenerateKey = async (screen: Screen) => {
    if (!confirm(`Weet je zeker dat je de screen key van "${screen.name}" wilt vernieuwen? De bestaande Yodeck-URL werkt dan niet meer.`)) return;
    const { screenKey } = await screensApi.regenerateKey(screen.id);
    setScreens((prev) => prev.map((s) => s.id === screen.id ? { ...s, screenKey } : s));
  };

  const toggleActive = async (screen: Screen) => {
    const updated = await screensApi.update(screen.id, { active: !screen.active });
    setScreens((prev) => prev.map((s) => s.id === screen.id ? { ...s, ...updated } : s));
  };

  if (loading) return <div className="p-8 text-gray-500">Laden...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TV-schermen</h1>
          <p className="text-gray-500 mt-1">Beheer de schermen die via Yodeck worden weergegeven</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Naam</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Merk</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Interval</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {screens.map((screen) => (
              <tr key={screen.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{screen.name}</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">/screens/{screen.slug}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{screen.type}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{screen.brand?.name ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {screen.slideDurationSeconds}s · {screen.refreshIntervalMinutes}min
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(screen)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer border-0 ${
                      screen.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {screen.active ? 'Actief' : 'Inactief'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <a
                      href={`/screens/${screen.slug}?key=${screen.screenKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#005eb8] hover:underline"
                    >
                      Bekijken
                    </a>
                    <Link
                      to={`/admin/screens/${screen.id}/edit`}
                      className="text-sm text-[#005eb8] hover:underline font-medium"
                    >
                      Bewerken
                    </Link>
                    <button onClick={() => copyScreenUrl(screen)} className="text-sm text-gray-500 hover:text-gray-800">
                      {copiedId === screen.id ? '✓ Gekopieerd' : 'URL kopiëren'}
                    </button>
                    <button onClick={() => regenerateKey(screen)} className="text-sm text-red-400 hover:text-red-600">
                      Key vernieuwen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {screens.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  Geen schermen gevonden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

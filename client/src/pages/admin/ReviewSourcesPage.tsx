import { useEffect, useState } from 'react';
import { ReviewSource } from '../../types';
import api from '../../api/client';
import { syncApi } from '../../api/sync';

interface EditForm {
  providerName: string;
  credentialKey: string;   // bijv. "LC" of "LD" — wordt prefix voor env vars
  channelRef: string;      // bijv. "chl-xxxxxxxx-..."
  active: boolean;
}

function parseApiKeyReference(raw: string | null): { credentialKey: string; channelRef: string } {
  if (!raw) return { credentialKey: '', channelRef: '' };
  const pipeIdx = raw.indexOf('|');
  if (pipeIdx === -1) return { credentialKey: '', channelRef: raw };
  return { credentialKey: raw.slice(0, pipeIdx), channelRef: raw.slice(pipeIdx + 1) };
}

function buildApiKeyReference(credentialKey: string, channelRef: string): string | null {
  if (!channelRef) return null;
  return credentialKey ? `${credentialKey.toUpperCase()}|${channelRef}` : channelRef;
}

function displayRef(raw: string | null): string {
  if (!raw) return '—';
  const { credentialKey, channelRef } = parseApiKeyReference(raw);
  return credentialKey ? `${credentialKey} · ${channelRef}` : channelRef;
}

export function ReviewSourcesPage() {
  const [sources, setSources] = useState<ReviewSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<ReviewSource | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ providerName: '', credentialKey: '', channelRef: '', active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<ReviewSource[]>('/review-sources').then((r) => setSources(r.data)).finally(() => setLoading(false));
  }, []);

  const runSync = async (source: ReviewSource) => {
    setSyncingId(source.id);
    try {
      await syncApi.run(source.id);
      alert('Synchronisatie voltooid!');
    } catch {
      alert('Synchronisatie mislukt. Bekijk de sync logs voor details.');
    } finally {
      setSyncingId(null);
    }
  };

  const openEdit = (source: ReviewSource) => {
    const { credentialKey, channelRef } = parseApiKeyReference(source.apiKeyReference);
    setEditForm({
      providerName: source.providerName,
      credentialKey,
      channelRef,
      active: source.active,
    });
    setEditingSource(source);
  };

  const saveEdit = async () => {
    if (!editingSource) return;
    setSaving(true);
    try {
      const updated = await api.put<ReviewSource>(`/review-sources/${editingSource.id}`, {
        providerName: editForm.providerName,
        apiKeyReference: buildApiKeyReference(editForm.credentialKey, editForm.channelRef),
        active: editForm.active,
      }).then((r) => r.data);
      setSources((prev) => prev.map((s) => s.id === editingSource.id ? { ...s, ...updated } : s));
      setEditingSource(null);
    } catch {
      alert('Opslaan mislukt.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Laden...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reviewbronnen</h1>
        <p className="text-gray-500 mt-1">Configureer en synchroniseer reviewbronnen per merk</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Merk</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sleutel · Channel Ref</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sources.map((source) => (
              <tr key={source.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{source.brand?.name ?? source.brandId}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{source.type.replace('_', ' ')}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    source.providerName === 'etrusted' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {source.providerName}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-gray-500 max-w-xs truncate">
                  {displayRef(source.apiKeyReference)}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${source.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {source.active ? 'Actief' : 'Inactief'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(source)} className="text-sm text-[#005eb8] hover:underline">
                      Bewerken
                    </button>
                    <button
                      onClick={() => runSync(source)}
                      disabled={syncingId === source.id}
                      className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-50"
                    >
                      {syncingId === source.id ? 'Sync...' : 'Nu sync'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sources.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Geen bronnen gevonden</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editingSource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Reviewbron bewerken</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {editingSource.brand?.name} · {editingSource.type.replace('_', ' ')}
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  value={editForm.providerName}
                  onChange={(e) => setEditForm((f) => ({ ...f, providerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="mock">mock (testdata)</option>
                  <option value="etrusted">etrusted (Trusted Shops)</option>
                </select>
              </div>

              {editForm.providerName === 'etrusted' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credential-sleutel</label>
                      <input
                        type="text"
                        value={editForm.credentialKey}
                        onChange={(e) => setEditForm((f) => ({ ...f, credentialKey: e.target.value.toUpperCase() }))}
                        placeholder="LC"
                        maxLength={10}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono uppercase"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Channel Ref</label>
                      <input
                        type="text"
                        value={editForm.channelRef}
                        onChange={(e) => setEditForm((f) => ({ ...f, channelRef: e.target.value }))}
                        placeholder="chl-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Combinatie preview */}
                  {editForm.channelRef && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs font-mono text-gray-600">
                      Opgeslagen als:{' '}
                      <span className="text-gray-900">
                        {buildApiKeyReference(editForm.credentialKey, editForm.channelRef)}
                      </span>
                    </div>
                  )}

                  {/* Uitleg env vars */}
                  <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800 space-y-1.5">
                    <div className="font-semibold">Vereiste variabelen in .env</div>
                    {editForm.credentialKey ? (
                      <>
                        <div className="font-mono">TRUSTED_SHOPS_{editForm.credentialKey}_CLIENT_ID=...</div>
                        <div className="font-mono">TRUSTED_SHOPS_{editForm.credentialKey}_CLIENT_SECRET=...</div>
                      </>
                    ) : (
                      <div className="text-blue-600">Vul eerst een credential-sleutel in (bijv. LC of LD)</div>
                    )}
                    <div className="text-blue-600 pt-0.5">Channel Ref is te vinden in het eTrusted portaal → Kanalen</div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active-toggle"
                  checked={editForm.active}
                  onChange={(e) => setEditForm((f) => ({ ...f, active: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="active-toggle" className="text-sm text-gray-700">Actief</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingSource(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Annuleren
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-5 py-2 bg-[#005eb8] text-white text-sm font-semibold rounded-lg hover:bg-[#004a93] transition-colors disabled:opacity-60"
              >
                {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { SlideTemplate } from '../../types';
import { templatesApi } from '../../api/templates';
import api from '../../api/client';

export function TemplatesPage() {
  const [templates, setTemplates] = useState<SlideTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    templatesApi.list().then(setTemplates).finally(() => setLoading(false));
  }, []);

  const duplicate = async (t: SlideTemplate) => {
    const copy = await templatesApi.duplicate(t.id);
    setTemplates((prev) => [...prev, copy]);
  };

  const toggleActive = async (t: SlideTemplate) => {
    const updated = await api.put<SlideTemplate>(`/templates/${t.id}`, { active: !t.active }).then(r => r.data);
    setTemplates((prev) => prev.map((x) => (x.id === t.id ? { ...x, active: updated.active } : x)));
  };

  if (loading) return <div className="p-8 text-gray-500">Laden...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="text-gray-500 mt-1">Slide-templates die TV-schermen gebruiken</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {templates.map((t) => (
          <div
            key={t.id}
            className={`bg-white rounded-xl p-6 shadow-sm border transition-opacity ${
              t.active ? 'border-gray-100 opacity-100' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900">{t.name}</div>
                <div className="text-sm text-gray-400 mt-0.5">Type: {t.type}</div>
              </div>
              <button
                onClick={() => toggleActive(t)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer border-0 ${
                  t.active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {t.active ? 'Actief' : 'Inactief'}
              </button>
            </div>

            <div className="text-xs text-gray-500 mb-1">Canvas: {t.canvasWidth}×{t.canvasHeight}px</div>
            <div className="text-xs text-gray-500 mb-1">Achtergrond: {(t.backgroundConfig as { type: string }).type}</div>
            <div className="text-xs text-gray-400 mb-4">{t.elements?.length ?? 0} elementen gedefinieerd</div>

            <div className="flex gap-4">
              <button
                onClick={() => duplicate(t)}
                className="text-sm text-[#005eb8] hover:underline"
              >
                Dupliceren
              </button>
              {t.active ? (
                <button
                  onClick={() => toggleActive(t)}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Zet inactief
                </button>
              ) : (
                <button
                  onClick={() => toggleActive(t)}
                  className="text-sm text-[#e57200] hover:underline"
                >
                  Zet actief
                </button>
              )}
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400">Geen templates gevonden</div>
        )}
      </div>
    </div>
  );
}

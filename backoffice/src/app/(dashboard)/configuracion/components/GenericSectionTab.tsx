'use client';

import { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import api from '@/lib/api';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

interface SectionConfig {
  key: string;
  label: string;
  description: string;
  fields: Array<{
    name: string;
    type: 'text' | 'textarea' | 'number' | 'checkbox';
    label: string;
    placeholder?: string;
  }>;
}

export default function GenericSectionTab({ sectionKey }: { sectionKey: string }) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [sectionKey]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/' + sectionKey);
      const data = res.data?.data ? res.data : res.data;
      setForm(data?.data || data || {});
    } catch {
      setForm({});
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/site-sections/' + sectionKey, { active: true, data: form });
      alert('Configuracion guardada');
    } catch {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          {sectionKey.replace(/_/g, ' ')}
        </h2>
        <div className="space-y-4">
          {Object.entries(form).map(([key, value]) => {
            if (typeof value === 'boolean') {
              return (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#C8FF00]"
                  />
                  <label className="text-sm text-gray-700">{key}</label>
                </div>
              );
            }
            if (typeof value === 'string' && value.length > 100) {
              return (
                <div key={key}>
                  <label className={labelClass}>{key}</label>
                  <textarea
                    value={value as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    rows={6}
                    className={inputClass}
                  />
                </div>
              );
            }
            if (typeof value === 'string') {
              return (
                <div key={key}>
                  <label className={labelClass}>{key}</label>
                  <input
                    type="text"
                    value={value as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className={inputClass}
                  />
                </div>
              );
            }
            if (typeof value === 'number') {
              return (
                <div key={key}>
                  <label className={labelClass}>{key}</label>
                  <input
                    type="number"
                    value={value as number}
                    onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50">
          <Save className="w-4 h-4 inline mr-2" />
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
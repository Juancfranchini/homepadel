'use client';

import { useState, useEffect } from 'react';
import { Save, LayoutDashboard } from 'lucide-react';
import api from '@/lib/api';

interface SectionItem {
  key: string;
  label: string;
  description: string;
}

const SECTIONS: SectionItem[] = [
  { key: 'hero', label: 'Hero (Carrusel principal)', description: 'Banner principal con slides' },
  { key: 'benefits', label: 'Beneficios', description: 'Barra de beneficios (envios, garantia, etc.)' },
  { key: 'promo_destacada', label: 'Promocion destacada', description: 'Promocion con countdown' },
  { key: 'categories', label: 'Categorias', description: 'Grid de categorias' },
  { key: 'featured_products', label: 'Productos destacados / Mas vendidos', description: 'Carrusel de productos' },
  { key: 'banners', label: 'Banners secundarios', description: 'Banners promocionales' },
  { key: 'about', label: 'Quienes somos', description: 'Seccion de informacion de la empresa' },
  { key: 'testimonials', label: 'Testimonios', description: 'Opiniones de clientes' },
  { key: 'brands', label: 'Marcas', description: 'Slider de marcas' },
  { key: 'instagram', label: 'Instagram', description: 'Feed de Instagram' },
  { key: 'final_message', label: 'Mensaje final / CTA', description: 'Cierre con llamado a la accion' },
];

export default function HomeSectionsTab() {
  const [sections, setSections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        SECTIONS.map(async (section) => {
          try {
            const res = await api.get('/site-sections/' + section.key);
            const data = res.data?.data ? res.data : res.data;
            return { key: section.key, active: data?.active !== false };
          } catch {
            return { key: section.key, active: true };
          }
        })
      );

      const state: Record<string, boolean> = {};
      results.forEach((r) => { state[r.key] = r.active; });
      setSections(state);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string, active: boolean) => {
    setSections((prev) => ({ ...prev, [key]: active }));
    try {
      const defaultData = SECTIONS.find((s) => s.key === key);
      await api.put('/site-sections/' + key, {
        active,
        data: defaultData ? {} : {},
      });
    } catch {
      setSections((prev) => ({ ...prev, [key]: !active }));
      alert('Error al actualizar la seccion');
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(
        SECTIONS.map((section) =>
          api.put('/site-sections/' + section.key, {
            active: sections[section.key] !== false,
            data: {},
          })
        )
      );
      alert('Configuracion de secciones guardada correctamente');
    } catch {
      alert('Error al guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-gray-400 text-sm">Cargando secciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-gray-500" />
          Secciones del Home
        </h2>
        <p className="text-xs text-gray-400 mb-5">
          Activa o desactiva las secciones que se muestran en la landing page. Los cambios se aplican al instante.
        </p>

        <div className="space-y-1">
          {SECTIONS.map((section) => {
            const isActive = sections[section.key] !== false;
            return (
              <div
                key={section.key}
                className={'flex items-start gap-4 p-4 rounded-lg transition-colors ' +
                  (isActive ? 'bg-gray-50' : 'bg-gray-100/50 opacity-60')}
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => handleToggle(section.key, e.target.checked)}
                    className="w-4 h-4 border border-gray-300 rounded-[1px] cursor-pointer accent-[#C8FF00]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{section.label}</p>
                    <p className="text-xs text-gray-400">{section.description}</p>
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className={'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ' +
            (!saving
              ? 'bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed')}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar todo'}
        </button>
      </div>
    </div>
  );
}

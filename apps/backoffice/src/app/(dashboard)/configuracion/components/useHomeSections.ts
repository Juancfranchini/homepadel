import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface SectionItem {
  key: string;
  label: string;
  description: string;
}

export const SECTIONS: SectionItem[] = [
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
  { key: 'newsletter', label: 'Newsletter', description: 'Formulario de suscripcion' },
  { key: 'final_message', label: 'Mensaje final / CTA', description: 'Cierre con llamado a la accion' },
  { key: 'trust_bottom', label: 'Confianza de productos', description: 'Badges de confianza en productos' },
  { key: 'politica_devolución', label: 'Politica de Devolucion', description: 'Pagina de politica de devolucion' },
  { key: 'terminos', label: 'Terminos y Condiciones', description: 'Pagina de terminos y condiciones' },
  { key: 'envíos', label: 'Envios', description: 'Pagina de informacion de envios' },
];

export function useHomeSections() {
  const [sections, setSections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSections = useCallback(async () => {
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
    } catch {
      alert('No se pudieron cargar las secciones del home');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSections(); }, [loadSections]);

  const handleToggle = async (key: string, active: boolean) => {
    setSections((prev) => ({ ...prev, [key]: active }));
    try {
      await api.put('/site-sections/' + key, { active, data: {} });
    } catch {
      setSections((prev) => ({ ...prev, [key]: !active }));
      alert('Error al actualizar la seccion');
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(
        SECTIONS.map((section) => api.put('/site-sections/' + section.key, { active: sections[section.key] !== false, data: {} }))
      );
      alert('Configuracion de secciones guardada correctamente');
    } catch {
      alert('Error al guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  return { sections, loading, saving, handleToggle, handleSaveAll };
}

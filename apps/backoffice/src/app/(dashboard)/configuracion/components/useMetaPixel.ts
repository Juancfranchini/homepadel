import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface MetaPixelForm {
  pixelId: string;
  accessToken: string;
  testEventCode: string;
  events: {
    pageView: boolean;
    viewContent: boolean;
    addToCart: boolean;
    initiateCheckout: boolean;
    purchase: boolean;
    contact: boolean;
  };
}

const DEFAULT_FORM: MetaPixelForm = {
  pixelId: '',
  accessToken: '',
  testEventCode: '',
  events: { pageView: true, viewContent: true, addToCart: true, initiateCheckout: true, purchase: true, contact: true },
};

export function useMetaPixel() {
  const [form, setForm] = useState<MetaPixelForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/meta_pixel');
      const section = res.data?.data ? res.data : res.data;
      const data = section?.data || section || {};
      setForm({
        pixelId: data.pixelId || '',
        accessToken: data.accessToken || '',
        testEventCode: data.testEventCode || '',
        events: {
          pageView: data.events?.pageView !== false,
          viewContent: data.events?.viewContent !== false,
          addToCart: data.events?.addToCart !== false,
          initiateCheckout: data.events?.initiateCheckout !== false,
          purchase: data.events?.purchase !== false,
          contact: data.events?.contact !== false,
        },
      });
    } catch {
      alert('No se pudo cargar la configuración de Meta Pixel');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/site-sections/meta_pixel', { active: true, data: form });
      alert('Configuracion de Meta Pixel guardada correctamente');
    } catch {
      alert('Error al guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  return { form, setForm, loading, saving, handleSave };
}

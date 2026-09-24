'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

/**
 * Estado y acciones de la pantalla de formatos de paleta: cargar lo guardado,
 * subir una imagen a Cloudinary y guardar las URLs. Vive aparte de la página
 * para que el componente no pase del límite de líneas y se lea de un vistazo.
 */
export function useFormatosPaleta() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const destino = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/site-sections/formatos_paleta');
      setValores((res.data?.data ?? res.data ?? {}) as Record<string, string>);
    } catch {
      toast('No se pudo cargar la configuración', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const setValor = (clave: string, url: string) =>
    setValores((actuales) => ({ ...actuales, [clave]: url }));

  const pedirArchivo = (clave: string) => {
    destino.current = clave;
    fileRef.current?.click();
  };

  const subirArchivo = async () => {
    const file = fileRef.current?.files?.[0];
    const clave = destino.current;
    if (!file || !clave) return;

    setSubiendo(clave);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/uploads/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data?.url || res.data?.imageUrl || '';
      if (url) setValor(clave, url);
      else toast('La imagen se subió pero no devolvió una dirección', 'error');
    } catch {
      toast('No se pudo subir la imagen', 'error');
    } finally {
      setSubiendo(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const guardar = async () => {
    setSaving(true);
    try {
      await api.put('/site-sections/formatos_paleta', { data: valores, active: true });
      toast('Formatos guardados', 'success');
    } catch {
      toast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return { loading, saving, subiendo, valores, fileRef, setValor, pedirArchivo, subirArchivo, guardar };
}

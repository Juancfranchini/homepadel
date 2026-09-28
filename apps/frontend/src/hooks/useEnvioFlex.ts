'use client';

import { useEffect, useState } from 'react';
import { EnvioFlexInfo } from '@/lib/envioFlex';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/** Zonas y precios del Envío Flex. Mientras carga (o si falla) Flex no se ofrece. */
export function useEnvioFlex(): EnvioFlexInfo {
  const [info, setInfo] = useState<EnvioFlexInfo>({ activo: false, zonas: [] });

  useEffect(() => {
    fetch(API_URL + '/envio-flex')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: EnvioFlexInfo | null) => {
        if (data && Array.isArray(data.zonas)) setInfo({ activo: data.activo === true, zonas: data.zonas });
      })
      .catch(() => {});
  }, []);

  return info;
}

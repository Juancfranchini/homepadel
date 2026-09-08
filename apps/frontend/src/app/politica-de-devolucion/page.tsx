'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSiteSection } from '@/lib/api';
import ReturnPolicyHero from './ReturnPolicyHero';
import { ReturnPolicyBenefits, ReturnPolicyConditionsOk, ReturnPolicySteps, ReturnPolicyConditionsNo, ReturnPolicyHelp } from './ReturnPolicySections';

export default function PoliticaDevoluciónPage() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSiteSection('politica_devolución');
        setData(res?.data || {});
      } catch {}
    };
    load();
  }, []);

  const hero = {
    chip: data.chip || 'DEVOLUCIONES Y CAMBIOS',
    title: data.title || 'Politica de Devolución',
    description: data.description || 'En Home Padel queremos que estes 100% satisfecho con tu compra.',
  };

  const benefits = data.benefits?.length > 0 ? data.benefits : [
    { icon: 'RefreshCw', title: '30 DIAS', desc: 'Tenes hasta 30 días corridos desde que recibis tu pedido.' },
    { icon: 'Package', title: 'PRODUCTO SIN USO', desc: 'El producto debe estar sin uso, con etiquetas y en su embalaje original.' },
    { icon: 'Shield', title: 'CAMBIO O REINTEGRO', desc: 'Podes elegir entre cambio por otro producto o reintegro del dinero.' },
    { icon: 'Check', title: 'COMPRA SEGURA', desc: 'Proceso simple, rapido y 100% seguro.' },
  ];

  const conditionsOk = data.conditionsOk?.length > 0 ? data.conditionsOk : [
    'El producto debe estar sin uso y en perfectas condiciones.',
    'Debe incluir su embalaje original, etiquetas, manuales y accesorios.',
    'La solicitud debe realizarse dentro de los 30 días corridos desde la recepcion.',
    'El producto no debe presentar signos de uso, desgaste o dano.',
    'En caso de devolución por falla o error nuestro, nos hacemos cargo del envío.',
    'En caso de devolución por arrepentimiento, el costo del envío corre por cuenta del cliente.',
  ];

  const conditionsNo = data.conditionsNo?.length > 0 ? data.conditionsNo : [
    'Productos usados o con signos de desgaste.',
    'Productos que no incluyan su embalaje original, etiquetas o accesorios.',
    'Productos en oferta o con descuento especial (salvo fallas de fabrica).',
    'Productos personalizados o a pedido.',
    'Productos que hayan sido alterados o modificados.',
    'Pelotas, grips, overgrips u otros accesorios que hayan sido abiertos.',
  ];

  const steps = data.steps?.length > 0 ? data.steps : [
    { title: 'CONTACTANOS', desc: 'Escribinos por WhatsApp, email o completa el formulario de contacto.' },
    { title: 'PREPARA EL PRODUCTO', desc: 'Te indicaremos como y a donde enviar el producto.' },
    { title: 'ENVIALO', desc: 'Despacha el producto segun las instrucciones que te dimos.' },
    { title: 'REVISION', desc: 'Una vez recibido, revisaremos el estado del producto.' },
    { title: 'CAMBIO O REINTEGRO', desc: 'Procesamos el cambio o el reintegro segun tu eleccion.' },
  ];

  const help = {
    title: data.helpTitle || 'Necesitas ayuda?',
    description: data.helpDescription || 'Nuestro equipo esta listo para ayudarte con tu devolución.',
    schedule: data.helpSchedule || 'Lunes a Viernes de 9 a 18 hs. | Sabados de 9 a 13 hs.',
    whatsapp: data.helpWhatsapp || '5491131813297',
    email: data.helpEmail || 'hola@homepadel.com.ar',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C0C0C] to-[#050606] text-[#F7F6F7]">
      <div className="border-b border-[#0D0F0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#8A8A85]">
          <Link href="/" className="hover:text-[#F7F6F7] transition-colors">Inicio</Link><span>/</span>
          <span className="text-[#F7F6F7]">Politica de Devolución</span>
        </div>
      </div>

      <ReturnPolicyHero hero={hero} />
      <ReturnPolicyBenefits benefits={benefits} />
      <ReturnPolicyConditionsOk conditions={conditionsOk} />
      <ReturnPolicySteps steps={steps} />
      <ReturnPolicyConditionsNo conditions={conditionsNo} />
      <ReturnPolicyHelp help={help} />
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Mail } from 'lucide-react';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import AbandonedCartRow, { AbandonedCart } from './AbandonedCartRow';
import AbandonedCartStats, { Stats } from './AbandonedCartStats';

/**
 * Carritos abandonados: gente que empezó el checkout, dejó su email y no
 * terminó comprando.
 *
 * Shopify y Tiendanube recuperan estos carritos con un email automático. Acá
 * el envío de correos no está en servicio, así que la recuperación es manual y
 * por WhatsApp, que además es el canal que usa la tienda.
 */
export default function CarritosAbandonadosPage() {
  const [carritos, setCarritos] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const cargar = useCallback(async () => {
    try {
      const [lista, resumen] = await Promise.all([
        api.get('/abandoned-carts').then((r) => r.data),
        api.get('/abandoned-carts/stats').then((r) => r.data),
      ]);
      setCarritos(Array.isArray(lista) ? lista : []);
      setStats(resumen);
    } catch {
      toast('No se pudieron cargar los carritos abandonados', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { cargar(); }, [cargar]);

  const alternarContactado = async (id: string) => {
    try {
      await api.patch(`/abandoned-carts/${id}/contacted`);
      cargar();
    } catch {
      toast('No se pudo actualizar', 'error');
    }
  };

  const eliminar = async (id: string) => {
    try {
      await api.delete(`/abandoned-carts/${id}`);
      setCarritos((actuales) => actuales.filter((c) => c.id !== id));
    } catch {
      toast('No se pudo eliminar', 'error');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-400" />
          Carritos abandonados
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Personas que empezaron la compra, dejaron su email y no la terminaron.
          Contactalas por WhatsApp para recuperar la venta.
        </p>
      </div>

      {stats && <AbandonedCartStats stats={stats} />}

      {carritos.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-14 text-center">
          <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">No hay carritos abandonados</p>
          <p className="text-xs text-gray-400 mt-1">
            Aparecen acá cuando alguien deja su email en el checkout y no termina la compra.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {carritos.map((carrito) => (
            <AbandonedCartRow
              key={carrito.id}
              carrito={carrito}
              onToggleContacted={() => alternarContactado(carrito.id)}
              onDelete={() => eliminar(carrito.id)}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <Mail className="w-3.5 h-3.5" />
        El envío automático de emails de recuperación necesita el servicio de correo, que hoy no está contratado.
      </p>
    </div>
  );
}

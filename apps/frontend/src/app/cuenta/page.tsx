'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getMyOrders } from '@/lib/api';
import { Order } from '@/types';
import CuentaDashboard from './CuentaDashboard';
import CuentaAuthForm from './CuentaAuthForm';
import { useGoogleAuthCallback } from './useGoogleAuthCallback';

export default function CuentaPage() {
  const { user, setAuth, logout, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const googleAuth = useGoogleAuthCallback();
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (authenticated) {
      setLoadingOrders(true);
      getMyOrders()
        .then((data) => setOrders(Array.isArray(data) ? data : data?.data ?? []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false));
    }
  }, [authenticated]);

  if (googleAuth.busy) {
    return <div className="min-h-screen bg-[#050606] flex items-center justify-center text-[#F7F6F7]">Completando inicio de sesión…</div>;
  }

  if (authenticated && user) {
    return <CuentaDashboard user={user} orders={orders} loadingOrders={loadingOrders} onLogout={logout} />;
  }

  return <CuentaAuthForm onAuth={setAuth} initialError={googleAuth.error} />;
}

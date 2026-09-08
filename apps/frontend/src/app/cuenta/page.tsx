'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getMyOrders } from '@/lib/api';
import { Order } from '@/types';
import CuentaDashboard from './CuentaDashboard';
import CuentaAuthForm from './CuentaAuthForm';

export default function CuentaPage() {
  const { user, setAuth, logout, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setLoadingOrders(true);
      getMyOrders()
        .then((data) => setOrders(Array.isArray(data) ? data : data?.data ?? []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false));
    }
  }, [isAuthenticated()]);

  if (isAuthenticated() && user) {
    return <CuentaDashboard user={user} orders={orders} loadingOrders={loadingOrders} onLogout={logout} />;
  }

  return <CuentaAuthForm onAuth={setAuth} />;
}

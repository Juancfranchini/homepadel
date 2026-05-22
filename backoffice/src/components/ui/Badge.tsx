// Reusable status badge component.
// Maps order statuses and boolean states to colored pill badges.

import React from 'react';

type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray' | 'lime';

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-800 border-green-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  lime: 'bg-lime-100 text-lime-800 border-lime-200',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Maps order status string to the appropriate Badge variant */
export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    PENDING: { label: 'Pendiente', variant: 'yellow' },
    PAID: { label: 'Pagado', variant: 'blue' },
    SHIPPED: { label: 'Enviado', variant: 'purple' },
    DELIVERED: { label: 'Entregado', variant: 'green' },
    CANCELLED: { label: 'Cancelado', variant: 'red' },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'gray' as BadgeVariant };
  return <Badge variant={variant}>{label}</Badge>;
}

/** Active/Inactive boolean badge */
export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'green' : 'gray'}>{active ? 'Activo' : 'Inactivo'}</Badge>
  );
}

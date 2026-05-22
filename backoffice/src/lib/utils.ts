// Utility functions shared across the BackOffice application.
// Includes price/date formatting and a className merging helper.

/**
 * Formats a number as Argentine Peso currency (ARS).
 * Example: 1500 → "$1.500"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Formats an ISO date string into DD/MM/YYYY (Argentine locale).
 * Example: "2024-03-15T00:00:00Z" → "15/03/2024"
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Merges Tailwind class names, filtering falsy values.
 * Equivalent to clsx without the extra dependency.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

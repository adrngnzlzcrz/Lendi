import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export function generateId(prefix: string, lastNumber: number) {
  const nextNumber = (lastNumber || 0) + 1;
  const padded = nextNumber.toString().padStart(3, '0');
  return `${prefix}-${padded}`;
}

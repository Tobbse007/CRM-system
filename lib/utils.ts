import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatiert ein Datum im deutschen Format
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd.MM.yyyy', { locale: de });
}

/**
 * Formatiert ein Datum mit Uhrzeit
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd.MM.yyyy HH:mm', { locale: de });
}

/**
 * Formatiert einen Geldbetrag in EUR
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Berechnet relative Zeitangaben (z.B. "vor 2 Tagen")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Heute';
  if (diffInDays === 1) return 'Gestern';
  if (diffInDays < 7) return `vor ${diffInDays} Tagen`;
  if (diffInDays < 30) return `vor ${Math.floor(diffInDays / 7)} Wochen`;
  if (diffInDays < 365) return `vor ${Math.floor(diffInDays / 30)} Monaten`;
  return `vor ${Math.floor(diffInDays / 365)} Jahren`;
}

/**
 * Prüft ob ein Datum in der Vergangenheit liegt
 */
export function isPast(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/**
 * Prüft ob ein Datum innerhalb der nächsten N Tage liegt
 */
export function isDueSoon(date: Date | string | null | undefined, days: number = 7): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = d.getTime() - now.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return diffInDays > 0 && diffInDays <= days;
}

/**
 * Truncate Text mit Ellipsis
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

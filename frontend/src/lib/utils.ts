import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(label: string): string {
  switch (label) {
    case 'LOW':
      return 'text-emerald-400';
    case 'MEDIUM':
      return 'text-amber-400';
    case 'HIGH':
      return 'text-orange-400';
    case 'CRITICAL':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
}

export function getRiskBg(label: string): string {
  switch (label) {
    case 'LOW':
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    case 'MEDIUM':
      return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    case 'HIGH':
      return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
    case 'CRITICAL':
      return 'bg-red-500/10 border-red-500/30 text-red-400';
    default:
      return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
  }
}

export function getRiskEmoji(label: string): string {
  switch (label) {
    case 'LOW':
      return 'OK';
    case 'MEDIUM':
      return '?';
    case 'HIGH':
      return '!';
    case 'CRITICAL':
      return '!!';
    default:
      return '-';
  }
}

export function getRiskGradient(score: number): string {
  if (score < 30) return 'from-emerald-500 to-teal-500';
  if (score < 60) return 'from-amber-500 to-yellow-500';
  if (score < 80) return 'from-orange-500 to-red-400';
  return 'from-red-500 to-rose-600';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

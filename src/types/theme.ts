import type { RiskLevel } from '@/data/mockData';

export const theme = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#2563EB',
  secondary: '#0EA5E9',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  text: '#1E293B',
  muted: '#64748B',
} as const;

export function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'CRITICAL':
    case 'HIGH':
      return theme.danger;
    case 'MEDIUM':
      return theme.warning;
    case 'LOW':
      return theme.success;
    default:
      return theme.muted;
  }
}

export function riskBgClass(level: RiskLevel): string {
  switch (level) {
    case 'CRITICAL':
    case 'HIGH':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'LOW':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function riskDotClass(level: RiskLevel): string {
  switch (level) {
    case 'CRITICAL':
    case 'HIGH':
      return 'bg-red-500';
    case 'MEDIUM':
      return 'bg-amber-500';
    case 'LOW':
      return 'bg-emerald-500';
    default:
      return 'bg-slate-400';
  }
}

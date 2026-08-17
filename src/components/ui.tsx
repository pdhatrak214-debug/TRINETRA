import type { ReactNode } from 'react';
import { riskBgClass, riskDotClass } from '@/types/theme';
import type { RiskLevel } from '@/data/mockData';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Card({ children, className = '', title, subtitle, action }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-800 tracking-wide uppercase">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={title ? 'p-5' : 'p-5'}>{children}</div>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  description: string;
  tone?: 'danger' | 'warning' | 'success' | 'primary' | 'secondary' | 'slate';
}

const toneClasses: Record<NonNullable<KpiCardProps['tone']>, { bg: string; text: string; ring: string }> = {
  danger: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  primary: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
  secondary: { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-100' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-100' },
};

export function KpiCard({ label, value, icon, description, tone = 'slate' }: KpiCardProps) {
  const t = toneClasses[tone];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-2 tabular-nums">{value}</p>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${t.bg} ${t.text} ring-1 ${t.ring}`}>{icon}</div>
      </div>
    </div>
  );
}

export function RiskBadge({ level, className = '' }: { level: RiskLevel; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${riskBgClass(level)} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${riskDotClass(level)}`} />
      {level}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: 'URGENT' | 'HIGH' | 'MONITOR' }) {
  const cls =
    priority === 'URGENT'
      ? 'bg-red-600 text-white'
      : priority === 'HIGH'
      ? 'bg-amber-500 text-white'
      : 'bg-slate-200 text-slate-700';
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${cls}`}>{priority}</span>;
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'outline' | 'success' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '' }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };
  return (
    <button className={`${base} ${sizes} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function MapLegend({ items }: { items: { label: string; color: string; shape?: 'circle' | 'square' }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 mt-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className={`inline-block ${item.shape === 'square' ? 'w-3 h-3 rounded-sm' : 'w-3 h-3 rounded-full'}`}
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs font-medium text-slate-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function SimulatedBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
      title="Prototype using simulated traffic and police data."
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      SIMULATED DATA
    </span>
  );
}

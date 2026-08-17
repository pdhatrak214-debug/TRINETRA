import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';

export function LoadingState({ label = 'Loading data…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle className="text-red-500" size={28} />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-800">Unable to load live database data.</p>
          <p className="text-sm text-slate-500 mt-1">{message}</p>
        </div>
        <Button variant="primary" onClick={onRetry}>
          <RefreshCw size={16} /> Retry
        </Button>
      </div>
    </div>
  );
}

export function RefreshButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
      aria-label="Refresh data"
    >
      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
      Refresh
    </button>
  );
}

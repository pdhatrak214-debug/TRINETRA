import { useState } from 'react';
import type { DeploymentRecommendation } from '@/data/mockData';
import { Card, Button, RiskBadge } from '@/components/ui';
import Modal from '@/components/Modal';
import { Check, X, Settings2, AlertTriangle, ArrowRight } from 'lucide-react';
import { acceptRecommendation, rejectRecommendation, modifyRecommendation } from '@/services/api';

interface RecommendationCardProps {
  recommendation: DeploymentRecommendation;
  index: number;
  onAction?: (action: 'accepted' | 'rejected' | 'modified', rec: DeploymentRecommendation) => void;
}

export default function RecommendationCard({ recommendation: rec, index, onAction }: RecommendationCardProps) {
  const [status, setStatus] = useState<'idle' | 'accepted' | 'rejected' | 'modified'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(rec.officer_id);
  const [selectedDestination, setSelectedDestination] = useState(rec.recommended_location);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await acceptRecommendation(rec.id);
      setStatus('accepted');
      onAction?.('accepted', rec);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      await rejectRecommendation(rec.id);
      setStatus('rejected');
      onAction?.('rejected', rec);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  const handleModify = async () => {
    setLoading(true);
    setError(null);
    try {
      await modifyRecommendation(rec.id, selectedOfficer, selectedDestination);
      setStatus('modified');
      setModalOpen(false);
      onAction?.('modified', { ...rec, officer_id: selectedOfficer, recommended_location: selectedDestination });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to modify');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommendation #{index}</span>
          <RiskBadge level={rec.priority} />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
            {rec.officer_id.replace('OFF-', '#')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">Officer {rec.officer_id.replace('OFF-', '#')}</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <span>{rec.current_location}</span>
              <ArrowRight size={12} className="text-blue-500" />
              <span className="font-semibold text-blue-600">{rec.recommended_location}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400 uppercase">Risk Score</p>
            <p className="text-lg font-bold text-slate-800 tabular-nums">{rec.risk_score}<span className="text-xs text-slate-400">/100</span></p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400 uppercase">Priority</p>
            <p className="text-lg font-bold text-slate-800">{rec.priority}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[10px] text-slate-400 uppercase mb-1.5">Reason</p>
          <div className="flex flex-wrap gap-1.5">
            {rec.reasons.length > 0 ? (
              rec.reasons.map((r) => (
                <span key={r} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-100">
                  <AlertTriangle size={10} /> {r}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">{rec.reason}</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs">{error}</div>
        )}

        {status === 'idle' ? (
          <div className="flex gap-2">
            <Button variant="success" size="sm" onClick={handleAccept} disabled={loading} className="flex-1">
              <Check size={14} /> Accept
            </Button>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(true)} disabled={loading}>
              <Settings2 size={14} /> Modify
            </Button>
            <Button variant="danger" size="sm" onClick={handleReject} disabled={loading} className="flex-1">
              <X size={14} /> Reject
            </Button>
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium animate-fade-in ${
              status === 'accepted'
                ? 'bg-emerald-50 text-emerald-700'
                : status === 'rejected'
                ? 'bg-red-50 text-red-700'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {status === 'accepted' && <Check size={16} />}
            {status === 'rejected' && <X size={16} />}
            {status === 'modified' && <Settings2 size={16} />}
            Recommendation {status}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Modify Recommendation">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Officer</label>
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {['OFF-12', 'OFF-07', 'OFF-03', 'OFF-05', 'OFF-09', 'OFF-11', 'OFF-15'].map((o) => (
                <option key={o} value={o}>
                  Officer #{o.replace('OFF-', '')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Destination</label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {['Sitabuldi', 'Wardha Road', 'Manish Nagar', 'Sadar', 'Hingna Road', 'Central Avenue'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" size="md" onClick={handleModify} disabled={loading} className="flex-1">
              Confirm Modification
            </Button>
            <Button variant="outline" size="md" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

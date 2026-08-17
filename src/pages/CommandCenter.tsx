import { useState, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  Activity,
  ShieldCheck,
  Users,
  MapPin,
  Flame,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { Card, KpiCard, Button, RiskBadge, PriorityBadge, MapLegend, SectionHeader } from '@/components/ui';
import Modal from '@/components/Modal';
import RiskMap from '@/components/RiskMap';
import { LoadingState, ErrorState, RefreshButton } from '@/components/States';
import { useTrinetraData } from '@/hooks/useTrinetraData';
import {
  acceptRecommendation,
  rejectRecommendation,
  modifyRecommendation,
} from '@/services/api';
import {
  type RiskLocation,
  type DeploymentRecommendation,
  getTopPriorityLocations,
  getPriorityLabel,
  timeAgo,
} from '@/data/mockData';
import { riskColor } from '@/types/theme';

const legendItems = [
  { label: 'HIGH RISK', color: '#DC2626' },
  { label: 'MEDIUM RISK', color: '#F59E0B' },
  { label: 'LOW RISK', color: '#16A34A' },
  { label: 'POLICE UNIT', color: '#2563EB', shape: 'square' as const },
  { label: 'ACTIVE INCIDENT', color: '#DC2626' },
];

export default function CommandCenter() {
  const { locations, incidents, police, recommendations, loading, error, refresh } = useTrinetraData();
  const [heatmap, setHeatmap] = useState(false);
  const [modifyOpen, setModifyOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('OFF-12');
  const [selectedDest, setSelectedDest] = useState('Sitabuldi');
  const [status, setStatus] = useState<'idle' | 'accepted' | 'rejected' | 'modified'>('idle');
  const [actionError, setActionError] = useState<string | null>(null);

  const kpi = useMemo(() => {
    const highRisk = locations.filter((l) => l.risk_level === 'CRITICAL' || l.risk_level === 'HIGH').length;
    const mediumRisk = locations.filter((l) => l.risk_level === 'MEDIUM').length;
    const lowRisk = locations.filter((l) => l.risk_level === 'LOW').length;
    const availableOfficers = police.filter((p) => p.status === 'AVAILABLE').length;
    const coverageGaps = locations.filter((l) => l.coverage_gap > 0).length;
    return { highRisk, mediumRisk, lowRisk, activeIncidents: incidents.length, availableOfficers, coverageGaps };
  }, [locations, incidents, police]);

  const topPriority = useMemo(() => getTopPriorityLocations(locations), [locations]);
  const primaryRec = recommendations[0];

  const handleAccept = useCallback(async () => {
    if (!primaryRec) return;
    setActionError(null);
    try {
      await acceptRecommendation(primaryRec.id);
      setStatus('accepted');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to accept recommendation');
    }
  }, [primaryRec]);

  const handleReject = useCallback(async () => {
    if (!primaryRec) return;
    setActionError(null);
    try {
      await rejectRecommendation(primaryRec.id);
      setStatus('rejected');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reject recommendation');
    }
  }, [primaryRec]);

  const handleModify = useCallback(async () => {
    if (!primaryRec) return;
    setActionError(null);
    try {
      await modifyRecommendation(primaryRec.id, selectedOfficer, selectedDest);
      setStatus('modified');
      setModifyOpen(false);
      refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to modify recommendation');
    }
  }, [primaryRec, selectedOfficer, selectedDest, refresh]);

  if (loading) return <LoadingState label="Loading command center…" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Command Center"
        subtitle="Real-time overview of traffic risk, incidents and police deployment"
        action={<RefreshButton onClick={refresh} />}
      />

      {actionError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {actionError}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="High-Risk" value={kpi.highRisk} icon={<Flame size={20} />} description="Critical + high locations" tone="danger" />
        <KpiCard label="Medium-Risk" value={kpi.mediumRisk} icon={<Activity size={20} />} description="Moderate risk locations" tone="warning" />
        <KpiCard label="Low-Risk" value={kpi.lowRisk} icon={<ShieldCheck size={20} />} description="Stable locations" tone="success" />
        <KpiCard label="Active Incidents" value={kpi.activeIncidents} icon={<AlertTriangle size={20} />} description="Reported incidents" tone="danger" />
        <KpiCard label="Available Officers" value={kpi.availableOfficers} icon={<Users size={20} />} description="Ready for deployment" tone="primary" />
        <KpiCard label="Coverage Gaps" value={kpi.coverageGaps} icon={<MapPin size={20} />} description="Under-resourced areas" tone="secondary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <div className="xl:col-span-2">
          <Card
            title="Nagpur Risk Map"
            subtitle="Interactive map of risk, incidents and police deployment"
            action={
              <button
                onClick={() => setHeatmap((v) => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  heatmap ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Flame size={14} />
                Heatmap {heatmap ? 'ON' : 'OFF'}
              </button>
            }
          >
            <RiskMap locations={locations} policeUnits={police} incidents={incidents} heatmap={heatmap} className="h-[440px] w-full" />
            <MapLegend items={legendItems} />
          </Card>
        </div>

        {/* AI Recommendation + Recent Incidents */}
        <div className="space-y-6">
          {primaryRec && (
            <Card title="AI Tactical Recommendation" subtitle="Simulated AI deployment suggestion">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {primaryRec.officer_id.replace('OFF-', '#')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Deploy Officer {primaryRec.officer_id.replace('OFF-', '#')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {primaryRec.current_location} → <span className="font-semibold text-blue-600">{primaryRec.recommended_location}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <Stat label="Risk Score" value={`${primaryRec.risk_score}/100`} />
                <Stat label="Police Required" value={`${primaryRec.priority === 'CRITICAL' ? 3 : 2}`} />
                <Stat label="Police Present" value="1" />
                <Stat label="Coverage Gap" value="2" tone="danger" />
              </div>

              <div className="mb-4">
                <p className="text-[10px] text-slate-400 uppercase mb-1.5">Reasons</p>
                <ul className="space-y-1">
                  {primaryRec.reasons.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-xs text-slate-600">
                      <ChevronRight size={12} className="text-blue-500 shrink-0" /> {r}
                    </li>
                  ))}
                </ul>
              </div>

              {status === 'idle' ? (
                <div className="flex gap-2">
                  <Button variant="success" size="sm" onClick={handleAccept} className="flex-1">Accept</Button>
                  <Button variant="outline" size="sm" onClick={() => setModifyOpen(true)}>Modify</Button>
                  <Button variant="danger" size="sm" onClick={handleReject} className="flex-1">Reject</Button>
                </div>
              ) : (
                <div
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium animate-fade-in ${
                    status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  Recommendation {status}
                </div>
              )}
            </Card>
          )}

          <Card title="Recent Incidents" subtitle="Latest reported events">
            <div className="space-y-2">
              {incidents.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No active incidents</p>}
              {incidents.map((inc) => {
                const icon =
                  inc.type === 'Accident' ? <AlertTriangle size={16} className="text-red-600" /> :
                  inc.type === 'Congestion' ? <Activity size={16} className="text-amber-600" /> :
                  inc.type === 'Road Obstruction' ? <MapPin size={16} className="text-amber-600" /> :
                  <TrendingUp size={16} className="text-sky-600" />;
                return (
                  <div key={inc.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{inc.type}</p>
                      <p className="text-xs text-slate-500 truncate">{inc.location_name}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(inc.timestamp)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Top Priority Locations */}
      <Card title="Top Priority Locations" subtitle="Ranked by risk score and coverage gap">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase px-3 py-2">#</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase px-3 py-2">Location</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase px-3 py-2">Risk</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase px-3 py-2">Level</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase px-3 py-2">Coverage</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase px-3 py-2">Gap</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase px-3 py-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {topPriority.map((loc, i) => (
                <tr key={loc.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 text-sm font-bold text-slate-400">{i + 1}</td>
                  <td className="px-3 py-3 text-sm font-medium text-slate-800">{loc.name}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${loc.risk_score}%`, backgroundColor: riskColor(loc.risk_level) }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 tabular-nums">{loc.risk_score}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3"><RiskBadge level={loc.risk_level} /></td>
                  <td className="px-3 py-3 text-sm text-slate-600 tabular-nums">
                    {loc.police_deployed}/{loc.police_required}
                    {loc.coverage_gap > 0 && <span className="ml-1 text-red-600 font-semibold">!</span>}
                  </td>
                  <td className="px-3 py-3">
                    {loc.coverage_gap > 0 ? (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{loc.coverage_gap}</span>
                    ) : (
                      <span className="text-xs text-emerald-600">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3"><PriorityBadge priority={getPriorityLabel(loc.risk_score)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modifyOpen} onClose={() => setModifyOpen(false)} title="Modify Recommendation">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Officer</label>
            <select value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['OFF-12', 'OFF-07', 'OFF-03', 'OFF-05', 'OFF-09'].map((o) => (
                <option key={o} value={o}>Officer #{o.replace('OFF-', '')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Destination</label>
            <select value={selectedDest} onChange={(e) => setSelectedDest(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['Sitabuldi', 'Wardha Road', 'Manish Nagar', 'Sadar', 'Hingna Road'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" className="flex-1" onClick={handleModify}>Confirm</Button>
            <Button variant="outline" onClick={() => setModifyOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'danger' }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${tone === 'danger' ? 'bg-red-50' : 'bg-slate-50'}`}>
      <p className="text-[10px] text-slate-400 uppercase">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${tone === 'danger' ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}

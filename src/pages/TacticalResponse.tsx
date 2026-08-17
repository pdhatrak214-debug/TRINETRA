import { useState, useMemo, useCallback } from 'react';
import { Users, ShieldCheck, UserPlus, AlertTriangle, MapPin, Zap, RotateCcw, Check, X, Settings2, ArrowRight } from 'lucide-react';
import { Card, KpiCard, Button, SectionHeader } from '@/components/ui';
import RecommendationCard from '@/components/RecommendationCard';
import Modal from '@/components/Modal';
import RiskMap from '@/components/RiskMap';
import { LoadingState, ErrorState, RefreshButton } from '@/components/States';
import { useTrinetraData } from '@/hooks/useTrinetraData';
import {
  simulateIncident,
  resetSimulation,
  acceptRecommendation,
  rejectRecommendation,
  modifyRecommendation,
} from '@/services/api';
import type { RiskLocation, Incident, DeploymentRecommendation } from '@/data/mockData';

const SITABULDI_ID = 'loc-001';
const SITABULDI_COORDS: [number, number] = [21.1458, 79.0882];

export default function TacticalResponse() {
  const { locations, incidents, police, recommendations, loading, error, refresh } = useTrinetraData();

  const [simulated, setSimulated] = useState(false);
  const [newIncidentAlert, setNewIncidentAlert] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [simBusy, setSimBusy] = useState(false);

  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideOfficer, setOverrideOfficer] = useState('OFF-12');
  const [overrideDest, setOverrideDest] = useState('Sitabuldi');
  const [decisionRecorded, setDecisionRecorded] = useState<string | null>(null);

  const kpi = useMemo(() => {
    const deployed = police.filter((p) => p.status === 'DEPLOYED').length;
    const available = police.filter((p) => p.status === 'AVAILABLE').length;
    const reserve = 3;
    const gaps = locations.filter((l) => l.coverage_gap > 0).length;
    return { total: 25, deployed, available, reserve, gaps };
  }, [police, locations]);

  const deploymentCompare = useMemo(() => {
    const findLoc = (name: string) => locations.find((l) => l.name === name);
    const targets = ['Sitabuldi', 'Wardha Road', 'Manish Nagar'];
    return targets.map((name) => {
      const loc = findLoc(name);
      return {
        location: name,
        current: loc?.police_deployed ?? 0,
        recommended: loc?.police_required ?? 0,
      };
    });
  }, [locations]);

  const handleSimulate = useCallback(async () => {
    setSimError(null);
    setSimBusy(true);
    try {
      await simulateIncident(SITABULDI_ID);
      setSimulated(true);
      setNewIncidentAlert(true);
      refresh();
      setTimeout(() => setNewIncidentAlert(false), 5000);
    } catch (err) {
      setSimError(err instanceof Error ? err.message : 'Failed to simulate incident');
    } finally {
      setSimBusy(false);
    }
  }, [refresh]);

  const handleReset = useCallback(async () => {
    setSimError(null);
    setSimBusy(true);
    try {
      await resetSimulation(SITABULDI_ID);
      setSimulated(false);
      setNewIncidentAlert(false);
      refresh();
    } catch (err) {
      setSimError(err instanceof Error ? err.message : 'Failed to reset simulation');
    } finally {
      setSimBusy(false);
    }
  }, [refresh]);

  const handleOverride = async (action: 'accept' | 'reject') => {
    const primaryRec = recommendations[0];
    if (!primaryRec) return;
    try {
      if (action === 'accept') {
        await acceptRecommendation(primaryRec.id);
        setDecisionRecorded('Recommendation accepted');
      } else {
        await rejectRecommendation(primaryRec.id);
        setDecisionRecorded('Recommendation rejected');
      }
      setOverrideOpen(false);
      refresh();
      setTimeout(() => setDecisionRecorded(null), 4000);
    } catch (err) {
      setDecisionRecorded(err instanceof Error ? err.message : 'Action failed');
      setTimeout(() => setDecisionRecorded(null), 4000);
    }
  };

  const handleOverrideModify = async () => {
    const primaryRec = recommendations[0];
    if (!primaryRec) return;
    try {
      await modifyRecommendation(primaryRec.id, overrideOfficer, overrideDest);
      setDecisionRecorded(`Modified: Officer ${overrideOfficer.replace('OFF-', '#')} → ${overrideDest}`);
      setOverrideOpen(false);
      refresh();
      setTimeout(() => setDecisionRecorded(null), 4000);
    } catch (err) {
      setDecisionRecorded(err instanceof Error ? err.message : 'Modification failed');
      setTimeout(() => setDecisionRecorded(null), 4000);
    }
  };

  if (loading) return <LoadingState label="Loading tactical response…" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Tactical Response"
        subtitle="AI-assisted police deployment and dynamic redeployment"
        action={<RefreshButton onClick={refresh} />}
      />

      {simError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {simError}
        </div>
      )}

      {/* Police Status KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Officers" value={kpi.total} icon={<Users size={20} />} description="All units" tone="primary" />
        <KpiCard label="Currently Deployed" value={kpi.deployed} icon={<ShieldCheck size={20} />} description="On active duty" tone="secondary" />
        <KpiCard label="Available" value={kpi.available} icon={<UserPlus size={20} />} description="Ready for dispatch" tone="success" />
        <KpiCard label="Emergency Reserve" value={kpi.reserve} icon={<AlertTriangle size={20} />} description="Strategic reserve" tone="warning" />
        <KpiCard label="Coverage Gaps" value={kpi.gaps} icon={<MapPin size={20} />} description="Under-resourced zones" tone="danger" />
      </div>

      {/* Deployment Map */}
      <Card title="Police Deployment Map" subtitle="Real-time unit positions and risk zones">
        <RiskMap locations={locations} policeUnits={police} incidents={incidents} className="h-[440px] w-full" />
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 mt-3">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs font-medium text-slate-600">HIGH RISK</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs font-medium text-slate-600">MEDIUM RISK</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs font-medium text-slate-600">LOW RISK</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-blue-600" /><span className="text-xs font-medium text-slate-600">POLICE UNIT</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600 border-2 border-white" /><span className="text-xs font-medium text-slate-600">ACTIVE INCIDENT</span></div>
        </div>
      </Card>

      {/* AI Deployment Recommendations */}
      <div>
        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4">AI Deployment Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.slice(0, 3).map((rec, i) => (
            <RecommendationCard key={rec.id} recommendation={rec} index={i + 1} onAction={() => refresh()} />
          ))}
        </div>
      </div>

      {/* Live Incident Simulator */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Zap className="text-amber-600" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Live Incident Simulator</h3>
              <p className="text-xs text-slate-500">Simulate an accident and watch the system respond</p>
            </div>
          </div>
          {simulated && (
            <Button variant="outline" size="sm" onClick={handleReset} disabled={simBusy}>
              <RotateCcw size={14} /> Reset Simulation
            </Button>
          )}
        </div>

        {newIncidentAlert && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 animate-slide-up">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <p className="text-sm font-bold text-red-700">NEW INCIDENT DETECTED — Sitabuldi</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Before / After */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Before</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Risk</span><span className="font-bold text-amber-600 tabular-nums">61</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Risk Level</span><span className="font-semibold text-amber-600">MEDIUM</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Coverage</span><span className="font-semibold text-slate-700">2/2</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Incident</span><span className="font-semibold text-slate-400">None</span></div>
              </div>
            </div>

            <div className={`rounded-xl border p-4 transition-all duration-300 ${simulated ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-white'}`}>
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">After</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Risk</span><span className={`font-bold tabular-nums ${simulated ? 'text-red-600' : 'text-slate-400'}`}>{simulated ? '94' : '—'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Risk Level</span><span className={`font-semibold ${simulated ? 'text-red-600' : 'text-slate-400'}`}>{simulated ? 'CRITICAL' : '—'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Coverage</span><span className={`font-semibold ${simulated ? 'text-red-600' : 'text-slate-400'}`}>{simulated ? '1/3' : '—'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Coverage Gap</span><span className={`font-semibold ${simulated ? 'text-red-600' : 'text-slate-400'}`}>{simulated ? '2' : '—'}</span></div>
              </div>
            </div>
          </div>

          {/* AI Action */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <p className="text-xs font-bold text-blue-600 uppercase mb-3">AI Action</p>
            {simulated ? (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">12</div>
                  <ArrowRight className="text-blue-500" size={16} />
                  <span className="text-sm font-semibold text-blue-700">Sitabuldi</span>
                </div>
                <p className="text-sm text-slate-700 font-medium">Deploy Officer #12 → Sitabuldi</p>
                <p className="text-xs text-slate-500 mt-2">Reason: Accident + congestion + insufficient coverage</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No incident detected. System monitoring.</p>
            )}
          </div>
        </div>

        {!simulated && (
          <div className="mt-5">
            <Button variant="danger" onClick={handleSimulate} disabled={simBusy} className="w-full sm:w-auto">
              <Zap size={16} /> Simulate Accident at Sitabuldi
            </Button>
          </div>
        )}
      </Card>

      {/* Commander Override + Current vs AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Commander Override" subtitle="Manual decision authority">
          {decisionRecorded ? (
            <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium animate-fade-in flex items-center gap-2">
              <Check size={16} /> {decisionRecorded} — Decision recorded by operator.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="success" size="sm" onClick={() => handleOverride('accept')}><Check size={14} /> Accept Recommendation</Button>
              <Button variant="outline" size="sm" onClick={() => setOverrideOpen(true)}><Settings2 size={14} /> Modify Recommendation</Button>
              <Button variant="danger" size="sm" onClick={() => handleOverride('reject')}><X size={14} /> Reject Recommendation</Button>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-3">SIMULATED DATA — No real police orders are issued.</p>
        </Card>

        <Card title="Current vs AI Deployment" subtitle="Comparison across high-risk zones">
          <div className="space-y-4">
            {deploymentCompare.map((d) => {
              const diff = d.recommended - d.current;
              return (
                <div key={d.location}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">{d.location}</span>
                    {diff > 0 && <span className="text-xs font-semibold text-red-600">+{diff} needed</span>}
                    {diff === 0 && <span className="text-xs font-semibold text-emerald-600">Optimal</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase mb-1">Current</p>
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className={`flex-1 h-6 rounded ${i < d.current ? 'bg-slate-400' : 'bg-slate-100'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 tabular-nums">{d.current} deployed</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-400 uppercase mb-1">AI Recommended</p>
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className={`flex-1 h-6 rounded ${i < d.recommended ? 'bg-blue-600' : 'bg-slate-100'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 mt-1 font-medium tabular-nums">{d.recommended} recommended</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Modal open={overrideOpen} onClose={() => setOverrideOpen(false)} title="Modify Recommendation">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Officer</label>
            <select value={overrideOfficer} onChange={(e) => setOverrideOfficer(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['OFF-12', 'OFF-07', 'OFF-03', 'OFF-05', 'OFF-09'].map((o) => (
                <option key={o} value={o}>Officer #{o.replace('OFF-', '')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Destination</label>
            <select value={overrideDest} onChange={(e) => setOverrideDest(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['Sitabuldi', 'Wardha Road', 'Manish Nagar', 'Sadar', 'Hingna Road'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" className="flex-1" onClick={handleOverrideModify}>Confirm</Button>
            <Button variant="outline" onClick={() => setOverrideOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

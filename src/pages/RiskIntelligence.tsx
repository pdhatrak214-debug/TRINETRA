import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Gauge, AlertTriangle, TrendingUp, Clock, Info } from 'lucide-react';
import { Card, KpiCard, SectionHeader, SimulatedBadge } from '@/components/ui';
import RiskMap from '@/components/RiskMap';
import { LoadingState, ErrorState, RefreshButton } from '@/components/States';
import { useTrinetraData } from '@/hooks/useTrinetraData';
import type { RiskLocation, LocationAnalysis } from '@/data/mockData';
import { riskColor } from '@/types/theme';

type RiskFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INCIDENTS' | 'COVERAGE_GAPS';
type TimeFilter = 'CURRENT' | '+15 MIN' | '+30 MIN' | '+60 MIN';

const riskFilters: RiskFilter[] = ['ALL', 'HIGH', 'MEDIUM', 'LOW', 'INCIDENTS', 'COVERAGE_GAPS'];
const timeFilters: TimeFilter[] = ['CURRENT', '+15 MIN', '+30 MIN', '+60 MIN'];

const forecastAdjust: Record<TimeFilter, number> = { CURRENT: 0, '+15 MIN': 1, '+30 MIN': -3, '+60 MIN': -16 };

function computeAnalysis(loc: RiskLocation): LocationAnalysis {
  return {
    location_id: loc.id,
    name: loc.name,
    risk_score: loc.risk_score,
    risk_level: loc.risk_level,
    factors: [
      { label: 'Congestion', value: (loc.congestion / 100) * 28, weight: 28 },
      { label: 'Recent Incident', value: (loc.recent_accident / 100) * 25, weight: 25 },
      { label: 'Violation Rate', value: (loc.violation_rate / 100) * 16, weight: 16 },
      { label: 'Historical Risk', value: (loc.historical_risk / 100) * 15, weight: 15 },
      { label: 'Road Obstruction', value: (loc.road_obstruction / 100) * 10, weight: 10 },
    ],
    explanation:
      'Recent accident activity combined with high congestion, historical incident frequency and insufficient police coverage has increased the predicted risk.',
    forecast: [
      { label: 'CURRENT', value: loc.risk_score },
      { label: '+15 MIN', value: Math.min(100, loc.risk_score + 1) },
      { label: '+30 MIN', value: Math.max(0, loc.risk_score - 3) },
      { label: '+60 MIN', value: Math.max(0, loc.risk_score - 16) },
    ],
  };
}

export default function RiskIntelligence() {
  const { locations, incidents, police, loading, error, refresh } = useTrinetraData();
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('CURRENT');
  const [selectedLocId, setSelectedLocId] = useState('loc-001');

  const analysis = useMemo(() => {
    const loc = locations.find((l) => l.id === selectedLocId) ?? locations[0];
    return loc ? computeAnalysis(loc) : null;
  }, [locations, selectedLocId]);

  const adjustedLocations = useMemo(() => {
    const adj = forecastAdjust[timeFilter];
    return locations.map((l) => ({
      ...l,
      risk_score: Math.max(0, Math.min(100, l.risk_score + adj)),
      risk_level: ((
        (l.risk_score + adj) >= 90 ? 'CRITICAL' :
        (l.risk_score + adj) >= 75 ? 'HIGH' :
        (l.risk_score + adj) >= 50 ? 'MEDIUM' : 'LOW'
      ) as RiskLocation['risk_level']),
    }));
  }, [locations, timeFilter]);

  const kpi = useMemo(() => {
    if (locations.length === 0) return { cityRisk: 0, highRisk: 0, emerging: 0, forecast30: 0 };
    const cityRisk = Math.round(locations.reduce((s, l) => s + l.risk_score, 0) / locations.length);
    const highRisk = locations.filter((l) => l.risk_level === 'CRITICAL' || l.risk_level === 'HIGH').length;
    const emerging = locations.filter((l) => l.emerging_risk).length;
    const forecast30 = Math.min(100, cityRisk + 6);
    return { cityRisk, highRisk, emerging, forecast30 };
  }, [locations]);

  const riskHistoryData = [
    { time: '12:00', risk: 45, congestion: 42 },
    { time: '13:00', risk: 52, congestion: 48 },
    { time: '14:00', risk: 58, congestion: 55 },
    { time: '15:00', risk: 64, congestion: 62 },
    { time: '16:00', risk: 68, congestion: 65 },
    { time: '17:00', risk: 72, congestion: 71 },
  ];

  const incidentFreq = [
    { hour: '12:00', accidents: 2, congestion: 5, obstructions: 1 },
    { hour: '13:00', accidents: 3, congestion: 7, obstructions: 2 },
    { hour: '14:00', accidents: 1, congestion: 6, obstructions: 3 },
    { hour: '15:00', accidents: 4, congestion: 9, obstructions: 2 },
    { hour: '16:00', accidents: 2, congestion: 8, obstructions: 4 },
    { hour: '17:00', accidents: 5, congestion: 11, obstructions: 3 },
  ];

  if (loading) return <LoadingState label="Loading risk intelligence…" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Risk Intelligence"
        subtitle="AI-driven traffic risk analysis and explainable predictions"
        action={<RefreshButton onClick={refresh} />}
      />

      {/* Risk Overview KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="City Risk" value={`${kpi.cityRisk}/100`} icon={<Gauge size={20} />} description="Average across all zones" tone="danger" />
        <KpiCard label="High-Risk Locations" value={kpi.highRisk} icon={<AlertTriangle size={20} />} description="Critical + high zones" tone="danger" />
        <KpiCard label="Emerging Risks" value={kpi.emerging} icon={<TrendingUp size={20} />} description="Newly detected risk areas" tone="warning" />
        <KpiCard label="30-Min Forecast" value={`${kpi.forecast30}/100`} icon={<Clock size={20} />} description="Predicted city risk" tone="secondary" />
      </div>

      {/* Risk Map with filters */}
      <Card title="Risk Map" subtitle="Filter by risk level and time horizon">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {riskFilters.map((f) => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  riskFilter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="h-5 w-px bg-slate-200 mx-1" />
          <div className="flex flex-wrap gap-1.5">
            {timeFilters.map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  timeFilter === t ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {timeFilter !== 'CURRENT' && <SimulatedBadge className="ml-1" />}
        </div>
        <RiskMap
          locations={adjustedLocations}
          policeUnits={police}
          incidents={incidents}
          riskFilter={riskFilter}
          timeFilter={timeFilter}
          showPolice={false}
          className="h-[440px] w-full"
        />
      </Card>

      {/* Risk Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="City Traffic Risk" subtitle="Last 6 hours (SIMULATED FORECAST)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={riskHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="risk" stroke="#2563EB" strokeWidth={2.5} fill="url(#riskGrad)" name="Risk Score" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Congestion Trend" subtitle="Last 6 hours (SIMULATED FORECAST)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={riskHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="congestion" stroke="#F59E0B" strokeWidth={2.5} fill="url(#congGrad)" name="Congestion %" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Incident Frequency" subtitle="By type over last 6 hours (SIMULATED FORECAST)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={incidentFreq} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="accidents" fill="#DC2626" name="Accidents" radius={[4, 4, 0, 0]} />
              <Bar dataKey="congestion" fill="#F59E0B" name="Congestion" radius={[4, 4, 0, 0]} />
              <Bar dataKey="obstructions" fill="#0EA5E9" name="Obstructions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Location Analysis + Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Location Analysis" subtitle="Select a location to inspect" className="lg:col-span-2">
          <select
            value={selectedLocId}
            onChange={(e) => setSelectedLocId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          {analysis && (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-slate-400 uppercase">Risk Score</p>
                  <p className="text-3xl font-bold text-slate-800 tabular-nums">{analysis.risk_score}<span className="text-base text-slate-400">/100</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase mb-1">Risk Level</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: riskColor(analysis.risk_level) }}>
                    {analysis.risk_level}
                  </span>
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-600 uppercase mb-3">Risk Factors</p>
              <div className="space-y-3">
                {analysis.factors.map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">{f.label}</span>
                      <span className="text-slate-800 font-semibold tabular-nums">{Math.round(f.value)}/{f.weight}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(f.value / f.weight) * 100}%`, backgroundColor: riskColor(analysis.risk_level) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <div className="space-y-6">
          {analysis && (
            <Card title="Why is this location high risk?">
              <div className="flex items-start gap-2 mb-3">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-600 leading-relaxed">{analysis.explanation}</p>
              </div>
              <SimulatedBadge />
            </Card>
          )}

          {analysis && (
            <Card title="Risk Forecast" subtitle="SIMULATED FORECAST">
              <div className="space-y-2">
                {analysis.forecast.map((f) => (
                  <div key={f.label} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                    <span className="text-xs font-medium text-slate-600">{f.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${f.value}%`, backgroundColor: riskColor(analysis.risk_level) }} />
                      </div>
                      <span className="text-sm font-bold text-slate-800 tabular-nums w-8 text-right">{f.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Simulated short-horizon forecast</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

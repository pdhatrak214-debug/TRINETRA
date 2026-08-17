// TRINETRA AI — Centralized Mock Data
// TODO: Replace mock implementation with FastAPI REST API

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_level: RiskLevel;
  congestion: number;
  traffic_volume: number;
  police_deployed: number;
  police_required: number;
  coverage_gap: number;
  active_incident: string | null;
  historical_risk: number;
  violation_rate: number;
  road_obstruction: number;
  recent_accident: number;
  emerging_risk: boolean;
}

export type IncidentType = 'Accident' | 'Congestion' | 'Road Obstruction' | 'Public Event';

export interface Incident {
  id: string;
  type: IncidentType;
  location_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export type OfficerStatus = 'DEPLOYED' | 'AVAILABLE' | 'EMERGENCY RESERVE';

export interface PoliceUnit {
  id: string;
  officer_id: string;
  location_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  status: OfficerStatus;
  current_assignment: string;
  recommended_assignment: string;
}

export interface DeploymentRecommendation {
  id: string;
  officer_id: string;
  current_location: string;
  recommended_location: string;
  risk_score: number;
  priority: RiskLevel;
  reason: string;
  reasons: string[];
  accepted?: boolean;
}

export interface RiskHistoryPoint {
  time: string;
  risk: number;
  congestion: number;
}

export interface IncidentFrequencyPoint {
  hour: string;
  accidents: number;
  congestion: number;
  obstructions: number;
}

export interface LocationAnalysis {
  location_id: string;
  name: string;
  risk_score: number;
  risk_level: RiskLevel;
  factors: { label: string; value: number; weight: number }[];
  explanation: string;
  forecast: { label: string; value: number }[];
}

const now = Date.now();

export const locations: RiskLocation[] = [
  {
    id: 'loc-001',
    name: 'Sitabuldi',
    latitude: 21.1458,
    longitude: 79.0882,
    risk_score: 94,
    risk_level: 'CRITICAL',
    congestion: 87,
    traffic_volume: 8420,
    police_deployed: 1,
    police_required: 3,
    coverage_gap: 2,
    active_incident: 'Accident',
    historical_risk: 15,
    violation_rate: 16,
    road_obstruction: 10,
    recent_accident: 25,
    emerging_risk: false,
  },
  {
    id: 'loc-002',
    name: 'Wardha Road',
    latitude: 21.127,
    longitude: 79.0685,
    risk_score: 89,
    risk_level: 'HIGH',
    congestion: 81,
    traffic_volume: 7210,
    police_deployed: 1,
    police_required: 2,
    coverage_gap: 1,
    active_incident: 'Congestion',
    historical_risk: 12,
    violation_rate: 14,
    road_obstruction: 8,
    recent_accident: 18,
    emerging_risk: false,
  },
  {
    id: 'loc-003',
    name: 'Manish Nagar',
    latitude: 21.1135,
    longitude: 79.0535,
    risk_score: 82,
    risk_level: 'HIGH',
    congestion: 76,
    traffic_volume: 5980,
    police_deployed: 0,
    police_required: 2,
    coverage_gap: 2,
    active_incident: 'Road Obstruction',
    historical_risk: 10,
    violation_rate: 12,
    road_obstruction: 14,
    recent_accident: 16,
    emerging_risk: true,
  },
  {
    id: 'loc-004',
    name: 'Sadar',
    latitude: 21.1558,
    longitude: 79.0842,
    risk_score: 76,
    risk_level: 'HIGH',
    congestion: 71,
    traffic_volume: 5420,
    police_deployed: 1,
    police_required: 2,
    coverage_gap: 1,
    active_incident: null,
    historical_risk: 11,
    violation_rate: 10,
    road_obstruction: 6,
    recent_accident: 12,
    emerging_risk: false,
  },
  {
    id: 'loc-005',
    name: 'Dharampeth',
    latitude: 21.1498,
    longitude: 79.0722,
    risk_score: 68,
    risk_level: 'MEDIUM',
    congestion: 62,
    traffic_volume: 4210,
    police_deployed: 2,
    police_required: 2,
    coverage_gap: 0,
    active_incident: null,
    historical_risk: 8,
    violation_rate: 8,
    road_obstruction: 4,
    recent_accident: 6,
    emerging_risk: false,
  },
  {
    id: 'loc-006',
    name: 'Civil Lines',
    latitude: 21.1612,
    longitude: 79.0932,
    risk_score: 54,
    risk_level: 'MEDIUM',
    congestion: 48,
    traffic_volume: 3640,
    police_deployed: 1,
    police_required: 1,
    coverage_gap: 0,
    active_incident: null,
    historical_risk: 7,
    violation_rate: 6,
    road_obstruction: 3,
    recent_accident: 4,
    emerging_risk: false,
  },
  {
    id: 'loc-007',
    name: 'Hingna Road',
    latitude: 21.1382,
    longitude: 79.0422,
    risk_score: 71,
    risk_level: 'HIGH',
    congestion: 66,
    traffic_volume: 4980,
    police_deployed: 1,
    police_required: 1,
    coverage_gap: 0,
    active_incident: null,
    historical_risk: 9,
    violation_rate: 11,
    road_obstruction: 7,
    recent_accident: 10,
    emerging_risk: true,
  },
  {
    id: 'loc-008',
    name: 'Airport Road',
    latitude: 21.0932,
    longitude: 79.0472,
    risk_score: 58,
    risk_level: 'MEDIUM',
    congestion: 52,
    traffic_volume: 3920,
    police_deployed: 1,
    police_required: 1,
    coverage_gap: 0,
    active_incident: null,
    historical_risk: 6,
    violation_rate: 7,
    road_obstruction: 5,
    recent_accident: 5,
    emerging_risk: false,
  },
  {
    id: 'loc-009',
    name: 'Kamptee Road',
    latitude: 21.1782,
    longitude: 79.1022,
    risk_score: 63,
    risk_level: 'MEDIUM',
    congestion: 57,
    traffic_volume: 4480,
    police_deployed: 1,
    police_required: 2,
    coverage_gap: 1,
    active_incident: null,
    historical_risk: 8,
    violation_rate: 9,
    road_obstruction: 4,
    recent_accident: 7,
    emerging_risk: false,
  },
  {
    id: 'loc-010',
    name: 'Central Avenue',
    latitude: 21.1525,
    longitude: 79.0785,
    risk_score: 65,
    risk_level: 'MEDIUM',
    congestion: 58,
    traffic_volume: 4720,
    police_deployed: 2,
    police_required: 2,
    coverage_gap: 0,
    active_incident: 'Public Event',
    historical_risk: 9,
    violation_rate: 10,
    road_obstruction: 6,
    recent_accident: 8,
    emerging_risk: false,
  },
  {
    id: 'loc-011',
    name: 'Medical Square',
    latitude: 21.1412,
    longitude: 79.0655,
    risk_score: 47,
    risk_level: 'LOW',
    congestion: 38,
    traffic_volume: 2940,
    police_deployed: 1,
    police_required: 1,
    coverage_gap: 0,
    active_incident: null,
    historical_risk: 5,
    violation_rate: 5,
    road_obstruction: 2,
    recent_accident: 3,
    emerging_risk: false,
  },
  {
    id: 'loc-012',
    name: 'Ajni',
    latitude: 21.1332,
    longitude: 79.0852,
    risk_score: 51,
    risk_level: 'LOW',
    congestion: 42,
    traffic_volume: 3280,
    police_deployed: 1,
    police_required: 1,
    coverage_gap: 0,
    active_incident: null,
    historical_risk: 6,
    violation_rate: 6,
    road_obstruction: 3,
    recent_accident: 4,
    emerging_risk: false,
  },
  {
    id: 'loc-013',
    name: 'Seminary Hills',
    latitude: 21.1685,
    longitude: 79.0585,
    risk_score: 34,
    risk_level: 'LOW',
    congestion: 28,
    traffic_volume: 2140,
    police_deployed: 1,
    police_required: 1,
    coverage_gap: 0,
    active_incident: null,
    historical_risk: 4,
    violation_rate: 3,
    road_obstruction: 1,
    recent_accident: 2,
    emerging_risk: false,
  },
  {
    id: 'loc-014',
    name: 'Cotton Market',
    latitude: 21.1568,
    longitude: 79.0712,
    risk_score: 42,
    risk_level: 'LOW',
    congestion: 34,
    traffic_volume: 2620,
    police_deployed: 1,
    police_required: 1,
    coverage_gap: 0,
    active_incident: null,
    historical_risk: 5,
    violation_rate: 4,
    road_obstruction: 2,
    recent_accident: 2,
    emerging_risk: false,
  },
  {
    id: 'loc-015',
    name: 'Manewada',
    latitude: 21.1212,
    longitude: 79.0822,
    risk_score: 58,
    risk_level: 'MEDIUM',
    congestion: 54,
    traffic_volume: 3820,
    police_deployed: 1,
    police_required: 2,
    coverage_gap: 1,
    active_incident: null,
    historical_risk: 7,
    violation_rate: 8,
    road_obstruction: 5,
    recent_accident: 6,
    emerging_risk: true,
  },
];

export const incidents: Incident[] = [
  {
    id: 'inc-001',
    type: 'Accident',
    location_id: 'loc-001',
    location_name: 'Sitabuldi',
    latitude: 21.1458,
    longitude: 79.0882,
    timestamp: now - 2 * 60 * 1000,
    severity: 'HIGH',
    description: 'Two-wheeler collision at main junction',
  },
  {
    id: 'inc-002',
    type: 'Congestion',
    location_id: 'loc-002',
    location_name: 'Wardha Road',
    latitude: 21.127,
    longitude: 79.0685,
    timestamp: now - 7 * 60 * 1000,
    severity: 'MEDIUM',
    description: 'Heavy congestion near overpass',
  },
  {
    id: 'inc-003',
    type: 'Road Obstruction',
    location_id: 'loc-003',
    location_name: 'Manish Nagar',
    latitude: 21.1135,
    longitude: 79.0535,
    timestamp: now - 12 * 60 * 1000,
    severity: 'MEDIUM',
    description: 'Construction debris blocking lane',
  },
  {
    id: 'inc-004',
    type: 'Public Event',
    location_id: 'loc-010',
    location_name: 'Central Avenue',
    latitude: 21.1525,
    longitude: 79.0785,
    timestamp: now - 18 * 60 * 1000,
    severity: 'LOW',
    description: 'Religious procession in progress',
  },
];

export const policeUnits: PoliceUnit[] = [
  {
    id: 'pol-001',
    officer_id: 'OFF-12',
    location_id: 'loc-005',
    location_name: 'Dharampeth',
    latitude: 21.1498,
    longitude: 79.0722,
    status: 'AVAILABLE',
    current_assignment: 'Patrolling Dharampeth',
    recommended_assignment: 'Deploy to Sitabuldi',
  },
  {
    id: 'pol-002',
    officer_id: 'OFF-07',
    location_id: 'loc-004',
    location_name: 'Sadar',
    latitude: 21.1558,
    longitude: 79.0842,
    status: 'DEPLOYED',
    current_assignment: 'Traffic control at Sadar',
    recommended_assignment: 'Redeploy to Wardha Road',
  },
  {
    id: 'pol-003',
    officer_id: 'OFF-03',
    location_id: 'loc-006',
    location_name: 'Civil Lines',
    latitude: 21.1612,
    longitude: 79.0932,
    status: 'AVAILABLE',
    current_assignment: 'Stationed at Civil Lines',
    recommended_assignment: 'Deploy to Manish Nagar',
  },
  {
    id: 'pol-004',
    officer_id: 'OFF-05',
    location_id: 'loc-001',
    location_name: 'Sitabuldi',
    latitude: 21.1458,
    longitude: 79.0882,
    status: 'DEPLOYED',
    current_assignment: 'Accident response',
    recommended_assignment: 'Maintain position',
  },
  {
    id: 'pol-005',
    officer_id: 'OFF-09',
    location_id: 'loc-002',
    location_name: 'Wardha Road',
    latitude: 21.127,
    longitude: 79.0685,
    status: 'DEPLOYED',
    current_assignment: 'Congestion management',
    recommended_assignment: 'Maintain position',
  },
  {
    id: 'pol-006',
    officer_id: 'OFF-11',
    location_id: 'loc-005',
    location_name: 'Dharampeth',
    latitude: 21.1498,
    longitude: 79.0722,
    status: 'DEPLOYED',
    current_assignment: 'Patrolling Dharampeth',
    recommended_assignment: 'Maintain position',
  },
  {
    id: 'pol-007',
    officer_id: 'OFF-15',
    location_id: 'loc-010',
    location_name: 'Central Avenue',
    latitude: 21.1525,
    longitude: 79.0785,
    status: 'DEPLOYED',
    current_assignment: 'Event crowd control',
    recommended_assignment: 'Maintain position',
  },
  {
    id: 'pol-008',
    officer_id: 'OFF-02',
    location_id: 'loc-006',
    location_name: 'Civil Lines',
    latitude: 21.1612,
    longitude: 79.0932,
    status: 'AVAILABLE',
    current_assignment: 'Stationed at Civil Lines',
    recommended_assignment: 'Standby',
  },
  {
    id: 'pol-009',
    officer_id: 'OFF-18',
    location_id: 'loc-011',
    location_name: 'Medical Square',
    latitude: 21.1412,
    longitude: 79.0655,
    status: 'DEPLOYED',
    current_assignment: 'Routine patrol',
    recommended_assignment: 'Maintain position',
  },
  {
    id: 'pol-010',
    officer_id: 'OFF-21',
    location_id: 'loc-008',
    location_name: 'Airport Road',
    latitude: 21.0932,
    longitude: 79.0472,
    status: 'DEPLOYED',
    current_assignment: 'Airport traffic',
    recommended_assignment: 'Maintain position',
  },
  {
    id: 'pol-011',
    officer_id: 'OFF-24',
    location_id: 'loc-009',
    location_name: 'Kamptee Road',
    latitude: 21.1782,
    longitude: 79.1022,
    status: 'DEPLOYED',
    current_assignment: 'Traffic management',
    recommended_assignment: 'Maintain position',
  },
  {
    id: 'pol-012',
    officer_id: 'OFF-27',
    location_id: 'loc-013',
    location_name: 'Seminary Hills',
    latitude: 21.1685,
    longitude: 79.0585,
    status: 'DEPLOYED',
    current_assignment: 'Routine patrol',
    recommended_assignment: 'Maintain position',
  },
  {
    id: 'pol-013',
    officer_id: 'OFF-30',
    location_id: 'loc-012',
    location_name: 'Ajni',
    latitude: 21.1332,
    longitude: 79.0852,
    status: 'DEPLOYED',
    current_assignment: 'Routine patrol',
    recommended_assignment: 'Maintain position',
  },
  {
    id: 'pol-014',
    officer_id: 'OFF-33',
    location_id: 'loc-014',
    location_name: 'Cotton Market',
    latitude: 21.1568,
    longitude: 79.0712,
    status: 'DEPLOYED',
    current_assignment: 'Market traffic',
    recommended_assignment: 'Maintain position',
  },
  {
    id: 'pol-015',
    officer_id: 'OFF-36',
    location_id: 'loc-015',
    location_name: 'Manewada',
    latitude: 21.1212,
    longitude: 79.0822,
    status: 'DEPLOYED',
    current_assignment: 'Traffic management',
    recommended_assignment: 'Maintain position',
  },
  {
    id: 'pol-016',
    officer_id: 'OFF-39',
    location_id: 'loc-007',
    location_name: 'Hingna Road',
    latitude: 21.1382,
    longitude: 79.0422,
    status: 'DEPLOYED',
    current_assignment: 'Traffic management',
    recommended_assignment: 'Maintain position',
  },
];

export const recommendations: DeploymentRecommendation[] = [
  {
    id: 'rec-001',
    officer_id: 'OFF-12',
    current_location: 'Dharampeth',
    recommended_location: 'Sitabuldi',
    risk_score: 94,
    priority: 'CRITICAL',
    reason: 'Accident + congestion + insufficient coverage',
    reasons: ['Accident detected', 'High congestion (87%)', 'Insufficient police coverage (1/3)', 'High historical risk'],
  },
  {
    id: 'rec-002',
    officer_id: 'OFF-07',
    current_location: 'Sadar',
    recommended_location: 'Wardha Road',
    risk_score: 89,
    priority: 'HIGH',
    reason: 'Congestion + coverage gap',
    reasons: ['Active congestion', 'Coverage gap (1/2)', 'High traffic volume'],
  },
  {
    id: 'rec-003',
    officer_id: 'OFF-03',
    current_location: 'Civil Lines',
    recommended_location: 'Manish Nagar',
    risk_score: 82,
    priority: 'HIGH',
    reason: 'Road obstruction + no coverage',
    reasons: ['Road obstruction reported', 'No police deployed (0/2)', 'Emerging risk location'],
  },
];

export const riskHistory: RiskHistoryPoint[] = [
  { time: '12:00', risk: 45, congestion: 42 },
  { time: '13:00', risk: 52, congestion: 48 },
  { time: '14:00', risk: 58, congestion: 55 },
  { time: '15:00', risk: 64, congestion: 62 },
  { time: '16:00', risk: 68, congestion: 65 },
  { time: '17:00', risk: 72, congestion: 71 },
];

export const incidentFrequency: IncidentFrequencyPoint[] = [
  { hour: '12:00', accidents: 2, congestion: 5, obstructions: 1 },
  { hour: '13:00', accidents: 3, congestion: 7, obstructions: 2 },
  { hour: '14:00', accidents: 1, congestion: 6, obstructions: 3 },
  { hour: '15:00', accidents: 4, congestion: 9, obstructions: 2 },
  { hour: '16:00', accidents: 2, congestion: 8, obstructions: 4 },
  { hour: '17:00', accidents: 5, congestion: 11, obstructions: 3 },
];

export const forecastData: { label: string; value: number }[] = [
  { label: 'CURRENT', value: 72 },
  { label: '+15 MIN', value: 75 },
  { label: '+30 MIN', value: 78 },
  { label: '+60 MIN', value: 74 },
];

export function getLocationAnalysis(locationId: string): LocationAnalysis {
  const loc = locations.find((l) => l.id === locationId) ?? locations[0];
  return {
    location_id: loc.id,
    name: loc.name,
    risk_score: loc.risk_score,
    risk_level: loc.risk_level,
    factors: [
      { label: 'Congestion', value: loc.congestion, weight: 28 },
      { label: 'Recent Accident', value: loc.recent_accident, weight: 25 },
      { label: 'Violation Rate', value: loc.violation_rate, weight: 16 },
      { label: 'Historical Risk', value: loc.historical_risk, weight: 15 },
      { label: 'Road Obstruction', value: loc.road_obstruction, weight: 10 },
    ].map((f) => ({ ...f, value: (f.value / 100) * f.weight })),
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

export function getKpiStats(locs: RiskLocation[] = locations, incs: Incident[] = incidents) {
  const highRisk = locs.filter((l) => l.risk_level === 'CRITICAL' || l.risk_level === 'HIGH').length;
  const mediumRisk = locs.filter((l) => l.risk_level === 'MEDIUM').length;
  const lowRisk = locs.filter((l) => l.risk_level === 'LOW').length;
  const activeIncidents = incs.length;
  const availableOfficers = policeUnits.filter((p) => p.status === 'AVAILABLE').length;
  const coverageGaps = locs.filter((l) => l.coverage_gap > 0).length;
  return { highRisk, mediumRisk, lowRisk, activeIncidents, availableOfficers, coverageGaps };
}

export function getTopPriorityLocations(locs: RiskLocation[] = locations): RiskLocation[] {
  return [...locs]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 5)
    .map((l) => ({
      ...l,
      risk_level: l.risk_score >= 90 ? 'CRITICAL' : l.risk_score >= 75 ? 'HIGH' : l.risk_score >= 50 ? 'MEDIUM' : 'LOW',
    }));
}

export function getPriorityLabel(score: number): 'URGENT' | 'HIGH' | 'MONITOR' {
  if (score >= 90) return 'URGENT';
  if (score >= 70) return 'HIGH';
  return 'MONITOR';
}

export function timeAgo(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const min = Math.floor(diff / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  return `${hr} hr ago`;
}

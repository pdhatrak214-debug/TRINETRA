// TRINETRA AI — API Service Layer
// Queries Supabase for live data. Adapts DB rows to the UI-facing types
// so the React components don't need to change.
//
// Future: Supabase can be replaced/augmented with a Python/FastAPI AI service.
// The UI calls only these functions, so the swap is transparent to components.

import { supabase } from '@/lib/supabase';
import type {
  RiskLocationRow,
  IncidentRow,
  PoliceUnitRow,
  RecommendationRow,
} from '@/types/db';
import type {
  RiskLocation,
  Incident,
  PoliceUnit,
  DeploymentRecommendation,
  RiskLevel,
} from '@/data/mockData';

// ============================================================
// Adapters — map DB rows to UI types
// ============================================================

function adaptRiskLocation(row: RiskLocationRow, activeIncidentType: string | null): RiskLocation {
  return {
    id: row.id,
    name: row.name,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    risk_score: row.risk_score,
    risk_level: row.risk_level,
    congestion: row.congestion,
    traffic_volume: row.traffic_volume,
    police_deployed: row.police_deployed,
    police_required: row.police_required,
    coverage_gap: row.coverage_gap,
    active_incident: activeIncidentType,
    historical_risk: row.historical_risk,
    violation_rate: row.violation_rate,
    road_obstruction: 0,
    recent_accident: row.recent_incidents,
    emerging_risk: row.risk_level === 'HIGH' || row.risk_level === 'CRITICAL',
  };
}

function adaptIncident(
  row: IncidentRow,
  locations: RiskLocation[]
): Incident {
  const loc = locations.find((l) => l.id === row.location_id);
  return {
    id: row.id,
    type: row.type as Incident['type'],
    location_id: row.location_id,
    location_name: loc?.name ?? 'Unknown',
    latitude: loc?.latitude ?? 0,
    longitude: loc?.longitude ?? 0,
    timestamp: new Date(row.occurred_at).getTime(),
    severity: row.severity,
    description: row.description ?? '',
  };
}

function adaptPoliceUnit(row: PoliceUnitRow): PoliceUnit {
  return {
    id: row.id,
    officer_id: row.officer_code,
    location_id: '',
    location_name: row.current_location,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    status: row.status as PoliceUnit['status'],
    current_assignment: row.assignment ?? 'On duty',
    recommended_assignment: 'Maintain position',
  };
}

function adaptRecommendation(row: RecommendationRow): DeploymentRecommendation {
  return {
    id: row.id,
    officer_id: row.officer_code,
    current_location: row.current_location,
    recommended_location: row.recommended_location,
    risk_score: row.risk_score,
    priority: row.priority,
    reason: row.reason ?? '',
    reasons: row.reason ? row.reason.split('+').map((s) => s.trim()).filter(Boolean) : [],
  };
}

// ============================================================
// Data fetchers
// ============================================================

export async function getRiskLocations(): Promise<RiskLocation[]> {
  const { data: locRows, error } = await supabase
    .from('risk_locations')
    .select('*')
    .order('risk_score', { ascending: false });

  if (error) throw new Error(`Failed to load risk locations: ${error.message}`);
  if (!locRows) return [];

  const { data: incRows } = await supabase
    .from('incidents')
    .select('location_id, type')
    .eq('status', 'ACTIVE');

  const activeIncidentByLoc = new Map<string, string>();
  for (const inc of incRows ?? []) {
    if (!activeIncidentByLoc.has(inc.location_id)) {
      activeIncidentByLoc.set(inc.location_id, inc.type);
    }
  }

  return locRows.map((row) => adaptRiskLocation(row as RiskLocationRow, activeIncidentByLoc.get(row.id) ?? null));
}

export async function getIncidents(): Promise<Incident[]> {
  const { data: incRows, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('occurred_at', { ascending: false });

  if (error) throw new Error(`Failed to load incidents: ${error.message}`);
  if (!incRows) return [];

  const { data: locRows } = await supabase.from('risk_locations').select('*');
  const locations = (locRows ?? []).map((r) => adaptRiskLocation(r as RiskLocationRow, null));

  return (incRows as IncidentRow[]).map((row) => adaptIncident(row, locations));
}

export async function getPoliceUnits(): Promise<PoliceUnit[]> {
  const { data, error } = await supabase
    .from('police_units')
    .select('*')
    .order('officer_code', { ascending: true });

  if (error) throw new Error(`Failed to load police units: ${error.message}`);
  if (!data) return [];

  return (data as PoliceUnitRow[]).map(adaptPoliceUnit);
}

export async function getRecommendations(): Promise<DeploymentRecommendation[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .order('risk_score', { ascending: false });

  if (error) throw new Error(`Failed to load recommendations: ${error.message}`);
  if (!data) return [];

  return (data as RecommendationRow[]).map(adaptRecommendation);
}

// ============================================================
// Recommendation actions — update status in Supabase
// ============================================================

export async function acceptRecommendation(
  recId: string
): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('recommendations')
    .update({ status: 'ACCEPTED' })
    .eq('id', recId);

  if (error) throw new Error(`Failed to accept recommendation: ${error.message}`);
  return { success: true, message: 'Recommendation accepted' };
}

export async function rejectRecommendation(
  recId: string
): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('recommendations')
    .update({ status: 'REJECTED' })
    .eq('id', recId);

  if (error) throw new Error(`Failed to reject recommendation: ${error.message}`);
  return { success: true, message: 'Recommendation rejected' };
}

export async function modifyRecommendation(
  recId: string,
  officerCode: string,
  destination: string
): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('recommendations')
    .update({
      officer_code: officerCode,
      recommended_location: destination,
      status: 'MODIFIED',
    })
    .eq('id', recId);

  if (error) throw new Error(`Failed to modify recommendation: ${error.message}`);
  return { success: true, message: 'Recommendation modified' };
}

// ============================================================
// Incident simulator — inserts a new incident + updates risk
// ============================================================

export async function simulateIncident(
  locationId: string
): Promise<{ success: boolean; message: string; incidentId: string }> {
  // Insert a new incident row
  const incidentId = `inc-sim-${Date.now()}`;
  const { error: incError } = await supabase.from('incidents').insert({
    id: incidentId,
    location_id: locationId,
    type: 'Accident',
    severity: 'HIGH',
    description: 'Simulated accident — live incident simulator',
    status: 'ACTIVE',
    occurred_at: new Date().toISOString(),
  });

  if (incError) throw new Error(`Failed to create incident: ${incError.message}`);

  // Update the risk_location to reflect the incident
  const { error: locError } = await supabase
    .from('risk_locations')
    .update({
      risk_score: 94,
      risk_level: 'CRITICAL',
      congestion: 87,
      recent_incidents: 25,
      coverage_gap: 2,
      police_required: 3,
    })
    .eq('id', locationId);

  if (locError) throw new Error(`Failed to update risk location: ${locError.message}`);

  // Insert a new recommendation for this incident
  const recId = `rec-sim-${Date.now()}`;
  const { error: recError } = await supabase.from('recommendations').insert({
    id: recId,
    officer_code: 'OFF-12',
    current_location: 'Dharampeth',
    recommended_location: 'Sitabuldi',
    risk_score: 94,
    priority: 'CRITICAL',
    reason: 'Accident + congestion + insufficient coverage',
    status: 'PENDING',
  });

  if (recError) throw new Error(`Failed to create recommendation: ${recError.message}`);

  return { success: true, message: 'Incident simulated', incidentId };
}

// ============================================================
// Reset simulation — restores original demo state
// ============================================================

export async function resetSimulation(
  locationId: string
): Promise<{ success: boolean; message: string }> {
  // Delete simulated incidents
  const { error: delIncError } = await supabase
    .from('incidents')
    .delete()
    .like('id', 'inc-sim-%');

  if (delIncError) throw new Error(`Failed to delete simulated incidents: ${delIncError.message}`);

  // Delete simulated recommendations
  const { error: delRecError } = await supabase
    .from('recommendations')
    .delete()
    .like('id', 'rec-sim-%');

  if (delRecError) throw new Error(`Failed to delete simulated recommendations: ${delRecError.message}`);

  // Restore risk_location to demo baseline
  const { error: locError } = await supabase
    .from('risk_locations')
    .update({
      risk_score: 61,
      risk_level: 'MEDIUM',
      congestion: 55,
      recent_incidents: 10,
      coverage_gap: 0,
      police_required: 2,
    })
    .eq('id', locationId);

  if (locError) throw new Error(`Failed to reset risk location: ${locError.message}`);

  return { success: true, message: 'Simulation reset' };
}

// ============================================================
// Fetch all data in one call (for page loads)
// ============================================================

export async function fetchAllData(): Promise<{
  locations: RiskLocation[];
  incidents: Incident[];
  police: PoliceUnit[];
  recommendations: DeploymentRecommendation[];
}> {
  const [locations, incidents, police, recommendations] = await Promise.all([
    getRiskLocations(),
    getIncidents(),
    getPoliceUnits(),
    getRecommendations(),
  ]);

  return { locations, incidents, police, recommendations };
}

// Re-export types for convenience
export type { RiskLocation, Incident, PoliceUnit, DeploymentRecommendation, RiskLevel };

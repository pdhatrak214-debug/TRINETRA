// TRINETRA AI — Database row types (match Supabase table columns exactly)

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskLocationRow {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_level: RiskLevel;
  traffic_volume: number;
  congestion: number;
  recent_incidents: number;
  historical_risk: number;
  violation_rate: number;
  police_deployed: number;
  police_required: number;
  coverage_gap: number;
  created_at: string;
}

export interface IncidentRow {
  id: string;
  location_id: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string | null;
  status: string;
  occurred_at: string;
}

export interface PoliceUnitRow {
  id: string;
  officer_code: string;
  current_location: string;
  status: string;
  assignment: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface RecommendationRow {
  id: string;
  officer_code: string;
  current_location: string;
  recommended_location: string;
  risk_score: number;
  priority: RiskLevel;
  reason: string | null;
  status: string;
  created_at: string;
}

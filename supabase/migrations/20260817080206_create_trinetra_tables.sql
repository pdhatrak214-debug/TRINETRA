/*
# TRINETRA AI — Create core tables and seed data

## Overview
Creates the 4 core tables for the TRINETRA AI traffic command center:
risk_locations, incidents, police_units, recommendations.
This is a single-tenant prototype with NO authentication, so all tables
allow anon + authenticated CRUD access (the data is intentionally shared/simulated).

## Tables

### 1. risk_locations
Stores traffic risk data for 15 Nagpur zones.
Columns: id, name, latitude, longitude, risk_score, risk_level,
traffic_volume, congestion, recent_incidents, historical_risk,
violation_rate, police_deployed, police_required, coverage_gap, created_at

### 2. incidents
Stores reported traffic incidents.
Columns: id, location_id (FK -> risk_locations), type, severity,
description, status, occurred_at

### 3. police_units
Stores police officer unit positions and assignments.
Columns: id, officer_code, current_location, status, assignment,
latitude, longitude, created_at

### 4. recommendations
Stores AI deployment recommendations.
Columns: id, officer_code, current_location, recommended_location,
risk_score, priority, reason, status, created_at

## Security
- RLS enabled on all 4 tables.
- Policies allow anon + authenticated full CRUD (single-tenant, no auth, simulated data).

## Seed Data
- 15 risk_locations (Sitabuldi, Wardha Road, Manish Nagar, etc.)
- 4 incidents
- 16 police_units
- 3 recommendations
*/

-- ============================================================
-- risk_locations
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_locations (
  id text PRIMARY KEY,
  name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  risk_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'LOW',
  traffic_volume integer NOT NULL DEFAULT 0,
  congestion integer NOT NULL DEFAULT 0,
  recent_incidents integer NOT NULL DEFAULT 0,
  historical_risk integer NOT NULL DEFAULT 0,
  violation_rate integer NOT NULL DEFAULT 0,
  police_deployed integer NOT NULL DEFAULT 0,
  police_required integer NOT NULL DEFAULT 0,
  coverage_gap integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE risk_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_risk_locations" ON risk_locations;
CREATE POLICY "anon_select_risk_locations" ON risk_locations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_risk_locations" ON risk_locations;
CREATE POLICY "anon_insert_risk_locations" ON risk_locations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_risk_locations" ON risk_locations;
CREATE POLICY "anon_update_risk_locations" ON risk_locations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_risk_locations" ON risk_locations;
CREATE POLICY "anon_delete_risk_locations" ON risk_locations FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- incidents
-- ============================================================
CREATE TABLE IF NOT EXISTS incidents (
  id text PRIMARY KEY,
  location_id text REFERENCES risk_locations(id) ON DELETE CASCADE,
  type text NOT NULL,
  severity text NOT NULL DEFAULT 'MEDIUM',
  description text,
  status text NOT NULL DEFAULT 'ACTIVE',
  occurred_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_incidents" ON incidents;
CREATE POLICY "anon_select_incidents" ON incidents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_incidents" ON incidents;
CREATE POLICY "anon_insert_incidents" ON incidents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_incidents" ON incidents;
CREATE POLICY "anon_update_incidents" ON incidents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_incidents" ON incidents;
CREATE POLICY "anon_delete_incidents" ON incidents FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- police_units
-- ============================================================
CREATE TABLE IF NOT EXISTS police_units (
  id text PRIMARY KEY,
  officer_code text NOT NULL,
  current_location text NOT NULL,
  status text NOT NULL DEFAULT 'DEPLOYED',
  assignment text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE police_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_police_units" ON police_units;
CREATE POLICY "anon_select_police_units" ON police_units FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_police_units" ON police_units;
CREATE POLICY "anon_insert_police_units" ON police_units FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_police_units" ON police_units;
CREATE POLICY "anon_update_police_units" ON police_units FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_police_units" ON police_units;
CREATE POLICY "anon_delete_police_units" ON police_units FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- recommendations
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id text PRIMARY KEY,
  officer_code text NOT NULL,
  current_location text NOT NULL,
  recommended_location text NOT NULL,
  risk_score integer NOT NULL DEFAULT 0,
  priority text NOT NULL DEFAULT 'HIGH',
  reason text,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recommendations" ON recommendations;
CREATE POLICY "anon_select_recommendations" ON recommendations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_recommendations" ON recommendations;
CREATE POLICY "anon_insert_recommendations" ON recommendations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_recommendations" ON recommendations;
CREATE POLICY "anon_update_recommendations" ON recommendations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_recommendations" ON recommendations;
CREATE POLICY "anon_delete_recommendations" ON recommendations FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- Seed: risk_locations (15 Nagpur zones)
-- ============================================================
INSERT INTO risk_locations (id, name, latitude, longitude, risk_score, risk_level, traffic_volume, congestion, recent_incidents, historical_risk, violation_rate, police_deployed, police_required, coverage_gap) VALUES
('loc-001', 'Sitabuldi', 21.1458, 79.0882, 94, 'CRITICAL', 8420, 87, 25, 15, 16, 1, 3, 2),
('loc-002', 'Wardha Road', 21.1270, 79.0685, 89, 'HIGH', 7210, 81, 18, 12, 14, 1, 2, 1),
('loc-003', 'Manish Nagar', 21.1135, 79.0535, 82, 'HIGH', 5980, 76, 16, 10, 12, 0, 2, 2),
('loc-004', 'Sadar', 21.1558, 79.0842, 76, 'HIGH', 5420, 71, 12, 11, 10, 1, 2, 1),
('loc-005', 'Dharampeth', 21.1498, 79.0722, 68, 'MEDIUM', 4210, 62, 6, 8, 8, 2, 2, 0),
('loc-006', 'Civil Lines', 21.1612, 79.0932, 54, 'MEDIUM', 3640, 48, 4, 7, 6, 1, 1, 0),
('loc-007', 'Hingna Road', 21.1382, 79.0422, 71, 'HIGH', 4980, 66, 10, 9, 11, 1, 1, 0),
('loc-008', 'Airport Road', 21.0932, 79.0472, 58, 'MEDIUM', 3920, 52, 5, 6, 7, 1, 1, 0),
('loc-009', 'Kamptee Road', 21.1782, 79.1022, 63, 'MEDIUM', 4480, 57, 7, 8, 9, 1, 2, 1),
('loc-010', 'Central Avenue', 21.1525, 79.0785, 65, 'MEDIUM', 4720, 58, 8, 9, 10, 2, 2, 0),
('loc-011', 'Medical Square', 21.1412, 79.0655, 47, 'LOW', 2940, 38, 3, 5, 5, 1, 1, 0),
('loc-012', 'Ajni', 21.1332, 79.0852, 51, 'LOW', 3280, 42, 4, 6, 6, 1, 1, 0),
('loc-013', 'Seminary Hills', 21.1685, 79.0585, 34, 'LOW', 2140, 28, 2, 4, 3, 1, 1, 0),
('loc-014', 'Cotton Market', 21.1568, 79.0712, 42, 'LOW', 2620, 34, 2, 5, 4, 1, 1, 0),
('loc-015', 'Manewada', 21.1212, 79.0822, 58, 'MEDIUM', 3820, 54, 6, 7, 8, 1, 2, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Seed: incidents (4 initial)
-- ============================================================
INSERT INTO incidents (id, location_id, type, severity, description, status, occurred_at) VALUES
('inc-001', 'loc-001', 'Accident', 'HIGH', 'Two-wheeler collision at main junction', 'ACTIVE', now() - interval '2 minutes'),
('inc-002', 'loc-002', 'Congestion', 'MEDIUM', 'Heavy congestion near overpass', 'ACTIVE', now() - interval '7 minutes'),
('inc-003', 'loc-003', 'Road Obstruction', 'MEDIUM', 'Construction debris blocking lane', 'ACTIVE', now() - interval '12 minutes'),
('inc-004', 'loc-010', 'Public Event', 'LOW', 'Religious procession in progress', 'ACTIVE', now() - interval '18 minutes')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Seed: police_units (16)
-- ============================================================
INSERT INTO police_units (id, officer_code, current_location, status, assignment, latitude, longitude) VALUES
('pol-001', 'OFF-12', 'Dharampeth', 'AVAILABLE', 'Patrolling Dharampeth', 21.1498, 79.0722),
('pol-002', 'OFF-07', 'Sadar', 'DEPLOYED', 'Traffic control at Sadar', 21.1558, 79.0842),
('pol-003', 'OFF-03', 'Civil Lines', 'AVAILABLE', 'Stationed at Civil Lines', 21.1612, 79.0932),
('pol-004', 'OFF-05', 'Sitabuldi', 'DEPLOYED', 'Accident response', 21.1458, 79.0882),
('pol-005', 'OFF-09', 'Wardha Road', 'DEPLOYED', 'Congestion management', 21.1270, 79.0685),
('pol-006', 'OFF-11', 'Dharampeth', 'DEPLOYED', 'Patrolling Dharampeth', 21.1498, 79.0722),
('pol-007', 'OFF-15', 'Central Avenue', 'DEPLOYED', 'Event crowd control', 21.1525, 79.0785),
('pol-008', 'OFF-02', 'Civil Lines', 'AVAILABLE', 'Stationed at Civil Lines', 21.1612, 79.0932),
('pol-009', 'OFF-18', 'Medical Square', 'DEPLOYED', 'Routine patrol', 21.1412, 79.0655),
('pol-010', 'OFF-21', 'Airport Road', 'DEPLOYED', 'Airport traffic', 21.0932, 79.0472),
('pol-011', 'OFF-24', 'Kamptee Road', 'DEPLOYED', 'Traffic management', 21.1782, 79.1022),
('pol-012', 'OFF-27', 'Seminary Hills', 'DEPLOYED', 'Routine patrol', 21.1685, 79.0585),
('pol-013', 'OFF-30', 'Ajni', 'DEPLOYED', 'Routine patrol', 21.1332, 79.0852),
('pol-014', 'OFF-33', 'Cotton Market', 'DEPLOYED', 'Market traffic', 21.1568, 79.0712),
('pol-015', 'OFF-36', 'Manewada', 'DEPLOYED', 'Traffic management', 21.1212, 79.0822),
('pol-016', 'OFF-39', 'Hingna Road', 'DEPLOYED', 'Traffic management', 21.1382, 79.0422)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Seed: recommendations (3)
-- ============================================================
INSERT INTO recommendations (id, officer_code, current_location, recommended_location, risk_score, priority, reason, status) VALUES
('rec-001', 'OFF-12', 'Dharampeth', 'Sitabuldi', 94, 'CRITICAL', 'Accident + congestion + insufficient coverage', 'PENDING'),
('rec-002', 'OFF-07', 'Sadar', 'Wardha Road', 89, 'HIGH', 'Congestion + coverage gap', 'PENDING'),
('rec-003', 'OFF-03', 'Civil Lines', 'Manish Nagar', 82, 'HIGH', 'Road obstruction + no coverage', 'PENDING')
ON CONFLICT (id) DO NOTHING;

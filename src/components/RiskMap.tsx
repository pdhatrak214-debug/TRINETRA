import type { RiskLocation, PoliceUnit, Incident } from '@/data/mockData';
import { riskColor } from '@/types/theme';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, Marker } from 'react-leaflet';
import L from 'leaflet';
import { divIcon } from 'leaflet';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

type RiskFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INCIDENTS' | 'COVERAGE_GAPS';
type TimeFilter = 'CURRENT' | '+15 MIN' | '+30 MIN' | '+60 MIN';

interface RiskMapProps {
  locations: RiskLocation[];
  policeUnits: PoliceUnit[];
  incidents?: Incident[];
  heatmap?: boolean;
  riskFilter?: RiskFilter;
  timeFilter?: TimeFilter;
  showPolice?: boolean;
  showIncidents?: boolean;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const NAGPUR_CENTER: [number, number] = [21.1458, 79.0882];

function incidentIcon() {
  return divIcon({
    className: 'trinetra-incident-icon',
    html: `<div style="display:flex;align-items:center;justify-content:center;">
      <div style="background:#DC2626;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(220,38,38,0.55);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      </div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function policeIcon(status: string) {
  const color = status === 'AVAILABLE' ? '#2563EB' : '#0EA5E9';
  return divIcon({
    className: 'trinetra-police-icon',
    html: `<div style="display:flex;align-items:center;justify-content:center;">
      <div style="background:${color};width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(37,99,235,0.5);color:#fff;font-size:13px;font-weight:700;letter-spacing:0.5px;">P</div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function RiskMap({
  locations,
  policeUnits,
  incidents = [],
  heatmap = false,
  riskFilter = 'ALL',
  timeFilter = 'CURRENT',
  showPolice = true,
  showIncidents = true,
  center = NAGPUR_CENTER,
  zoom = 12,
  className = 'h-[480px]',
}: RiskMapProps) {
  const filterLoc = (loc: RiskLocation) => {
    if (riskFilter === 'ALL') return true;
    if (riskFilter === 'HIGH') return loc.risk_level === 'CRITICAL' || loc.risk_level === 'HIGH';
    if (riskFilter === 'MEDIUM') return loc.risk_level === 'MEDIUM';
    if (riskFilter === 'LOW') return loc.risk_level === 'LOW';
    if (riskFilter === 'INCIDENTS') return loc.active_incident !== null;
    if (riskFilter === 'COVERAGE_GAPS') return loc.coverage_gap > 0;
    return true;
  };

  const visible = locations.filter(filterLoc);

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom className={className} style={{ borderRadius: 12 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {heatmap &&
        visible.map((loc) => {
          const color = riskColor(loc.risk_level);
          const intensity = loc.risk_score / 100;
          return (
            <Circle
              key={`heat-${loc.id}`}
              center={[loc.latitude, loc.longitude]}
              radius={600 + intensity * 400}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.18 + intensity * 0.12,
                stroke: false,
              }}
            />
          );
        })}

      {visible.map((loc) => {
        const color = riskColor(loc.risk_level);
        const radius = 8 + (loc.risk_score / 100) * 6;
        return (
          <CircleMarker
            key={loc.id}
            center={[loc.latitude, loc.longitude]}
            radius={radius}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: color,
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div style={{ minWidth: 220 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1E293B', marginBottom: 4 }}>
                  {loc.name.toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color, fontWeight: 600, marginBottom: 8 }}>
                  {timeFilter !== 'CURRENT' ? `SIMULATED FORECAST · ${timeFilter}` : loc.risk_level}
                </div>
                <Row label="Risk Score" value={`${loc.risk_score} / 100`} />
                <Row label="Risk Level" value={loc.risk_level} />
                <Row label="Traffic Volume" value={`${loc.traffic_volume.toLocaleString()} vehicles/hr`} />
                <Row label="Congestion" value={`${loc.congestion}%`} />
                <Row label="Police" value={`${loc.police_deployed} / ${loc.police_required}`} />
                <Row label="Coverage Gap" value={`${loc.coverage_gap}`} />
                <Row label="Incident" value={loc.active_incident ?? 'None'} />
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {showPolice &&
        policeUnits.map((unit) => (
          <Marker key={unit.id} position={[unit.latitude, unit.longitude]} icon={policeIcon(unit.status)}>
            <Popup>
              <div style={{ minWidth: 220 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>OFFICER {unit.officer_id}</div>
                <div style={{ fontSize: 12, color: '#2563EB', fontWeight: 600, marginBottom: 8 }}>{unit.status}</div>
                <Row label="Current Location" value={unit.location_name} />
                <Row label="Current Assignment" value={unit.current_assignment} />
                <Row label="Recommended Assignment" value={unit.recommended_assignment} />
              </div>
            </Popup>
          </Marker>
        ))}

      {showIncidents &&
        incidents.map((inc) => (
          <Marker key={inc.id} position={[inc.latitude, inc.longitude]} icon={incidentIcon()}>
            <Popup>
              <div style={{ minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#DC2626' }}>{inc.type}</div>
                <Row label="Location" value={inc.location_name} />
                <Row label="Severity" value={inc.severity} />
                <Row label="Description" value={inc.description} />
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      <span style={{ color: '#1E293B', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

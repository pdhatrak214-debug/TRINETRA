import { useState, useEffect, useCallback } from 'react';
import { fetchAllData } from '@/services/api';
import type { RiskLocation, Incident, PoliceUnit, DeploymentRecommendation } from '@/data/mockData';

interface TrinetraData {
  locations: RiskLocation[];
  incidents: Incident[];
  police: PoliceUnit[];
  recommendations: DeploymentRecommendation[];
}

export function useTrinetraData() {
  const [data, setData] = useState<TrinetraData>({
    locations: [],
    incidents: [],
    police: [],
    recommendations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchAllData()
      .then((result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load live database data.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return { ...data, loading, error, refresh };
}

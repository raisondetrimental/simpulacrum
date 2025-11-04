import { useState, useEffect } from 'react';
import { DashboardData } from '../types/dashboard';
import { apiUrl } from '../config';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = apiUrl('/api/dashboard-data');
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
        }

        const dashboardData: DashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching dashboard data:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refresh = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdated: data?.metadata?.last_updated
  };

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(apiUrl('/api/dashboard-data'));

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const dashboardData: DashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }
};
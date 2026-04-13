import { useEffect, useState } from 'react';
import { getTasks } from '../services/api';
import {
  buildAnalytics,
  filterTasksByDateRange,
  getDefaultDateRange,
} from '../utils/analytics';

const DEFAULT_FILTERS = {
  startDate: '',
  endDate: '',
  priority: 'all',
};

async function fetchAllTasks(token, priority) {
  const params = {
    page: 1,
    limit: 100,
    priority: priority === 'all' ? undefined : priority,
    sort: 'createdAt',
    direction: 'desc',
  };
  const initialResponse = await getTasks({ token, params });
  const tasks = [...initialResponse.data];
  const totalPages = initialResponse.meta?.pages ?? 1;

  if (totalPages > 1) {
    const requests = [];

    for (let page = 2; page <= totalPages; page += 1) {
      requests.push(
        getTasks({
          token,
          params: {
            ...params,
            page,
          },
        })
      );
    }

    const pages = await Promise.all(requests);
    pages.forEach((response) => tasks.push(...response.data));
  }

  return tasks;
}

export function useDashboardData(token) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [rawTasks, setRawTasks] = useState([]);
  const [analytics, setAnalytics] = useState(() => buildAnalytics([]));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const tasks = await fetchAllTasks(token, filters.priority);
        if (!active) {
          return;
        }

        const defaultRange = getDefaultDateRange(tasks);
        const effectiveFilters = {
          ...filters,
          startDate: filters.startDate || defaultRange.startDate,
          endDate: filters.endDate || defaultRange.endDate,
        };

        setFilters(effectiveFilters);
        setRawTasks(tasks);
        setAnalytics(
          buildAnalytics(
            filterTasksByDateRange(
              tasks,
              effectiveFilters.startDate,
              effectiveFilters.endDate
            )
          )
        );
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Failed to load dashboard data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [token, filters.priority]);

  useEffect(() => {
    setAnalytics(
      buildAnalytics(
        filterTasksByDateRange(rawTasks, filters.startDate, filters.endDate)
      )
    );
  }, [filters.endDate, filters.startDate, rawTasks]);

  async function refresh() {
    setRefreshing(true);
    setError('');

    try {
      const tasks = await fetchAllTasks(token, filters.priority);
      setRawTasks(tasks);
      setAnalytics(
        buildAnalytics(
          filterTasksByDateRange(tasks, filters.startDate, filters.endDate)
        )
      );
    } catch (refreshError) {
      setError(refreshError.message || 'Failed to refresh dashboard data.');
    } finally {
      setRefreshing(false);
    }
  }

  return {
    analytics,
    error,
    filters,
    loading,
    rawTasks,
    refreshing,
    refresh,
    setFilters,
  };
}

import { useEffect, useState } from 'react';
import {
  getCommercialAnalytics,
  getProjects,
  getTasks,
  getTimeEntries,
} from '../services/api';
import {
  buildAnalytics,
  filterTasksByCommercial,
  filterTasksByDateRange,
  filterTasksByProject,
  getDefaultDateRange,
} from '../utils/analytics';

const DEFAULT_FILTERS = {
  startDate: '',
  endDate: '',
  projectId: 'all',
  clientId: 'all',
  billingModel: 'all',
  priority: 'all',
};

async function fetchAllTasks(token, priority, projectId) {
  const params = {
    page: 1,
    limit: 100,
    priority: priority === 'all' ? undefined : priority,
    projectId: projectId === 'all' ? undefined : projectId,
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

export function useDashboardData(token, userEmail, onUnauthorized) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [projects, setProjects] = useState([]);
  const [rawTasks, setRawTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [commercialData, setCommercialData] = useState({
    projects: [],
    clients: [],
    summary: {},
  });
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
        const [projectList, tasks, entries, commercial] = await Promise.all([
          getProjects({ token }),
          fetchAllTasks(token, filters.priority, filters.projectId),
          getTimeEntries({ token }),
          getCommercialAnalytics({ email: userEmail }),
        ]);
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
        setProjects(projectList);
        setRawTasks(tasks);
        setTimeEntries(entries);
        setCommercialData(commercial);
        setAnalytics(
          buildAnalytics(
            filterTasksByCommercial(
              filterTasksByProject(
                filterTasksByDateRange(
                  tasks,
                  effectiveFilters.startDate,
                  effectiveFilters.endDate
                ),
                effectiveFilters.projectId
              ),
              commercial,
              effectiveFilters
            ),
            projectList,
            commercial,
            entries
          )
        );
      } catch (loadError) {
        if (active) {
          if (loadError.status === 401) {
            onUnauthorized?.();
            return;
          }

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
  }, [token, filters.priority, filters.projectId, userEmail]);

  useEffect(() => {
    setAnalytics(
      buildAnalytics(
        filterTasksByCommercial(
          filterTasksByProject(
            filterTasksByDateRange(rawTasks, filters.startDate, filters.endDate),
            filters.projectId
          ),
          commercialData,
          filters
        ),
        projects,
        commercialData,
        timeEntries
      )
    );
  }, [
    commercialData,
    filters.billingModel,
    filters.clientId,
    filters.endDate,
    filters.projectId,
    filters.startDate,
    projects,
    rawTasks,
    timeEntries,
  ]);

  async function refresh() {
    setRefreshing(true);
    setError('');

    try {
      const [projectList, tasks, entries, commercial] = await Promise.all([
        getProjects({ token }),
        fetchAllTasks(token, filters.priority, filters.projectId),
        getTimeEntries({ token }),
        getCommercialAnalytics({ email: userEmail }),
      ]);
      setProjects(projectList);
      setRawTasks(tasks);
      setTimeEntries(entries);
      setCommercialData(commercial);
      setAnalytics(
        buildAnalytics(
          filterTasksByCommercial(
            filterTasksByProject(
              filterTasksByDateRange(tasks, filters.startDate, filters.endDate),
              filters.projectId
            ),
            commercial,
            filters
          ),
          projectList,
          commercial,
          entries
        )
      );
    } catch (refreshError) {
      if (refreshError.status === 401) {
        onUnauthorized?.();
        return;
      }

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
    projects,
    rawTasks,
    commercialData,
    refreshing,
    refresh,
    setFilters,
  };
}

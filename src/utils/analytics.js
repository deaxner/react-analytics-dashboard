function toDateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function hoursBetween(start, end) {
  if (!start || !end) {
    return null;
  }

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime) || endTime < startTime) {
    return null;
  }

  return (endTime - startTime) / 36e5;
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatHours(value) {
  return `${value.toFixed(1)}h`;
}

function formatMoney(value) {
  return `€ ${value.toFixed(2)}`;
}

function normalizeCommercialProjectMap(commercialData) {
  return Object.fromEntries(
    (commercialData?.projects ?? []).map((project) => [project.code, project])
  );
}

function normalizeTimeEntriesByTask(timeEntries = []) {
  return timeEntries.reduce((map, entry) => {
    const taskId = entry?.taskId;

    if (!taskId) {
      return map;
    }

    if (!map[taskId]) {
      map[taskId] = [];
    }

    map[taskId].push(entry);

    return map;
  }, {});
}

export function getDefaultDateRange(tasks) {
  if (!tasks.length) {
    const today = new Date().toISOString().slice(0, 10);
    return { startDate: today, endDate: today };
  }

  const timestamps = tasks.map((task) => new Date(task.createdAt).getTime());
  const latestTimestamp = Math.max(...timestamps);
  const oldestTimestamp = Math.min(...timestamps);
  const oneYearBeforeLatest = new Date(latestTimestamp);
  oneYearBeforeLatest.setFullYear(oneYearBeforeLatest.getFullYear() - 1);
  const startTimestamp = Math.max(oldestTimestamp, oneYearBeforeLatest.getTime());

  return {
    startDate: new Date(startTimestamp).toISOString().slice(0, 10),
    endDate: new Date(latestTimestamp).toISOString().slice(0, 10),
  };
}

export function filterTasksByDateRange(tasks, startDate, endDate) {
  return tasks.filter((task) => {
    const createdDate = toDateKey(task.createdAt);

    if (startDate && createdDate < startDate) {
      return false;
    }

    if (endDate && createdDate > endDate) {
      return false;
    }

    return true;
  });
}

export function filterTasksByProject(tasks, projectId) {
  if (!projectId || projectId === 'all') {
    return tasks;
  }

  return tasks.filter((task) => String(task.project?.id) === String(projectId));
}

export function filterTasksByCommercial(tasks, commercialData, filters) {
  const commercialProjectMap = normalizeCommercialProjectMap(commercialData);

  return tasks.filter((task) => {
    const commercialProject =
      commercialProjectMap[task.project?.externalProjectKey] ?? null;

    if (
      filters.clientId &&
      filters.clientId !== 'all' &&
      String(commercialProject?.client?.id) !== String(filters.clientId)
    ) {
      return false;
    }

    if (
      filters.billingModel &&
      filters.billingModel !== 'all' &&
      commercialProject?.billingModel !== filters.billingModel
    ) {
      return false;
    }

    return true;
  });
}

export function buildAnalytics(
  tasks,
  projects = [],
  commercialData = {},
  timeEntries = []
) {
  const totalTasks = tasks.length;
  const now = Date.now();
  const groupedByDate = {};
  const groupedByCompletedDate = {};
  const groupedByProject = {};
  const cycleByPriority = {
    low: [],
    medium: [],
    high: [],
  };
  const leadByPriority = {
    low: [],
    medium: [],
    high: [],
  };
  const economicsByPriority = {
    low: { revenue: [], cost: [] },
    medium: { revenue: [], cost: [] },
    high: { revenue: [], cost: [] },
  };
  const projectEconomics = {};
  const clientProfitability = {};
  const commercialProjectMap = normalizeCommercialProjectMap(commercialData);
  const timeEntriesByTask = normalizeTimeEntriesByTask(timeEntries);

  tasks.forEach((task) => {
    const dateKey = toDateKey(task.createdAt);
    groupedByDate[dateKey] = (groupedByDate[dateKey] ?? 0) + 1;

    if (task.completedAt) {
      const completedDateKey = toDateKey(task.completedAt);
      groupedByCompletedDate[completedDateKey] =
        (groupedByCompletedDate[completedDateKey] ?? 0) + 1;
    }

    const projectName = task.project?.name ?? 'Unassigned';
    groupedByProject[projectName] = (groupedByProject[projectName] ?? 0) + 1;

    const commercialProject =
      commercialProjectMap[task.project?.externalProjectKey] ?? null;
    const taskEntries = timeEntriesByTask[task.id] ?? [];
    const taskHoursFromEntries = taskEntries.reduce(
      (sum, entry) => sum + Number(entry.minutes ?? 0) / 60,
      0
    );
    const billableHoursFromEntries = taskEntries.reduce((sum, entry) => {
      if (!entry.billable) {
        return sum;
      }

      return sum + Number(entry.minutes ?? 0) / 60;
    }, 0);
    const hours =
      taskEntries.length > 0 ? taskHoursFromEntries : (task.totalLoggedMinutes ?? 0) / 60;
    const billableHours =
      taskEntries.length > 0
        ? billableHoursFromEntries
        : (task.billableMinutes ?? 0) / 60;
    const defaultCostRate = Number(commercialProject?.internalCostRateDefault ?? 0);
    const hourlyRate = Number(commercialProject?.hourlyRate ?? 0);
    const billingModel = commercialProject?.billingModel ?? 'hourly';
    const cost =
      taskEntries.length > 0
        ? taskEntries.reduce((sum, entry) => {
            const minutes = Number(entry.minutes ?? 0);
            const snapshotRate = Number(
              entry.costRateSnapshot ?? commercialProject?.internalCostRateDefault ?? 0
            );

            return sum + (minutes / 60) * snapshotRate;
          }, 0)
        : hours * defaultCostRate;
    let revenue = 0;

    if (billingModel === 'hourly') {
      revenue = billableHours * hourlyRate;
    } else if (billingModel === 'sla') {
      const includedHours = Number(commercialProject?.monthlyHoursIncluded ?? 0);
      const fee = Number(commercialProject?.slaMonthlyFee ?? 0);
      revenue = includedHours > 0 ? billableHours * (fee / includedHours) : 0;
    } else if (billingModel === 'fixed_retainer') {
      const retainer = Number(commercialProject?.fixedMonthlyRetainer ?? 0);
      revenue = billableHours * (retainer / Math.max(billableHours || 1, 160));
    }

    const margin = revenue - cost;
    projectEconomics[projectName] = {
      name: projectName,
      color: task.project?.color ?? '#57b6ff',
      revenue: (projectEconomics[projectName]?.revenue ?? 0) + revenue,
      cost: (projectEconomics[projectName]?.cost ?? 0) + cost,
      margin: (projectEconomics[projectName]?.margin ?? 0) + margin,
      hours: (projectEconomics[projectName]?.hours ?? 0) + hours,
      billableHours:
        (projectEconomics[projectName]?.billableHours ?? 0) + billableHours,
    };

    const clientName = commercialProject?.client?.company ?? 'Unassigned';
    clientProfitability[clientName] = {
      name: clientName,
      margin: (clientProfitability[clientName]?.margin ?? 0) + margin,
      unpaidExposure:
        Number(
          (commercialData.clients ?? []).find((client) => client.name === clientName)
            ?.unpaidExposure ?? 0
        ) || 0,
    };

    if (revenue > 0 || cost > 0) {
      economicsByPriority[task.priority]?.revenue.push(revenue);
      economicsByPriority[task.priority]?.cost.push(cost);
    }

    const cycleHours = hoursBetween(task.startedAt, task.completedAt);
    if (cycleHours !== null) {
      cycleByPriority[task.priority] = [
        ...(cycleByPriority[task.priority] ?? []),
        cycleHours,
      ];
    }

    const leadHours = hoursBetween(task.createdAt, task.completedAt);
    if (leadHours !== null) {
      leadByPriority[task.priority] = [
        ...(leadByPriority[task.priority] ?? []),
        leadHours,
      ];
    }
  });

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === 'done') {
      return false;
    }

    return new Date(task.dueDate).getTime() < now;
  }).length;
  const totalRevenue = Object.values(projectEconomics).reduce(
    (sum, project) => sum + project.revenue,
    0
  );
  const totalCost = Object.values(projectEconomics).reduce(
    (sum, project) => sum + project.cost,
    0
  );
  const grossMargin = totalRevenue - totalCost;
  const averageCycleHours = average(
    Object.values(cycleByPriority).flatMap((values) => values)
  );
  const averageLeadHours = average(
    Object.values(leadByPriority).flatMap((values) => values)
  );
  const marginPct = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
  const timelineKeys = Array.from(
    new Set([...Object.keys(groupedByDate), ...Object.keys(groupedByCompletedDate)])
  ).sort((left, right) => left.localeCompare(right));
  const availableProjects = projects.length
    ? projects
    : Object.entries(groupedByProject).map(([name], index) => ({
        id: index + 1,
        name,
      }));

  return {
    totalTasks,
    summary: [
      { label: 'Revenue', value: formatMoney(totalRevenue), accent: 'blue' },
      { label: 'Labor cost', value: formatMoney(totalCost), accent: 'amber' },
      { label: 'Gross margin', value: formatMoney(grossMargin), accent: 'green' },
      { label: 'Tickets', value: totalTasks, accent: 'slate' },
      { label: 'Margin %', value: `${marginPct.toFixed(1)}%`, accent: 'violet' },
      { label: 'Avg cycle', value: formatHours(averageCycleHours), accent: 'cyan' },
      { label: 'Avg lead', value: formatHours(averageLeadHours), accent: 'teal' },
      { label: 'Overdue', value: overdueTasks, accent: 'rose' },
    ],
    timelineFlow: timelineKeys.map((date) => ({
      date,
      created: groupedByDate[date] ?? 0,
      completed: groupedByCompletedDate[date] ?? 0,
    })),
    tasksByProject: availableProjects.map((project) => ({
      name: project.name,
      color: project.color,
      value: groupedByProject[project.name] ?? 0,
    })),
    marginByProject: Object.values(projectEconomics)
      .sort((left, right) => right.margin - left.margin)
      .map((project) => ({
        name: project.name,
        color: project.color,
        revenue: Number(project.revenue.toFixed(2)),
        cost: Number(project.cost.toFixed(2)),
        margin: Number(project.margin.toFixed(2)),
      })),
    cycleTimeByPriority: [
      { name: 'Low', value: average(cycleByPriority.low ?? []) },
      { name: 'Medium', value: average(cycleByPriority.medium ?? []) },
      { name: 'High', value: average(cycleByPriority.high ?? []) },
    ],
    revenueCostByPriority: [
      {
        name: 'Low',
        revenue: Number(average(economicsByPriority.low.revenue).toFixed(2)),
        cost: Number(average(economicsByPriority.low.cost).toFixed(2)),
      },
      {
        name: 'Medium',
        revenue: Number(average(economicsByPriority.medium.revenue).toFixed(2)),
        cost: Number(average(economicsByPriority.medium.cost).toFixed(2)),
      },
      {
        name: 'High',
        revenue: Number(average(economicsByPriority.high.revenue).toFixed(2)),
        cost: Number(average(economicsByPriority.high.cost).toFixed(2)),
      },
    ],
    clientProfitability: Object.values(clientProfitability).sort(
      (left, right) => right.margin - left.margin
    ),
    recentTasks: [...tasks]
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      )
      .slice(0, 6),
    projects: availableProjects,
    clients: commercialData.clients ?? [],
    billingModels: ['hourly', 'sla', 'fixed_retainer'],
  };
}

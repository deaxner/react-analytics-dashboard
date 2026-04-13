function toDateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

export function getDefaultDateRange(tasks) {
  if (!tasks.length) {
    const today = new Date().toISOString().slice(0, 10);
    return { startDate: today, endDate: today };
  }

  const timestamps = tasks.map((task) => new Date(task.createdAt).getTime());

  return {
    startDate: new Date(Math.min(...timestamps)).toISOString().slice(0, 10),
    endDate: new Date(Math.max(...timestamps)).toISOString().slice(0, 10),
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

export function buildAnalytics(tasks) {
  const now = Date.now();
  const groupedByDate = {};
  const groupedByStatus = {
    todo: 0,
    in_progress: 0,
    done: 0,
  };
  const groupedByPriority = {
    low: 0,
    medium: 0,
    high: 0,
  };

  tasks.forEach((task) => {
    const dateKey = toDateKey(task.createdAt);
    groupedByDate[dateKey] = (groupedByDate[dateKey] ?? 0) + 1;
    groupedByStatus[task.status] = (groupedByStatus[task.status] ?? 0) + 1;
    groupedByPriority[task.priority] =
      (groupedByPriority[task.priority] ?? 0) + 1;
  });

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === 'done') {
      return false;
    }

    return new Date(task.dueDate).getTime() < now;
  }).length;

  return {
    summary: [
      { label: 'Total tasks', value: tasks.length, accent: 'blue' },
      { label: 'Completed', value: groupedByStatus.done ?? 0, accent: 'green' },
      {
        label: 'In progress',
        value: groupedByStatus.in_progress ?? 0,
        accent: 'amber',
      },
      { label: 'Overdue', value: overdueTasks, accent: 'rose' },
    ],
    tasksByDate: Object.entries(groupedByDate)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, count]) => ({ date, count })),
    tasksByStatus: [
      { name: 'To do', value: groupedByStatus.todo ?? 0 },
      { name: 'In progress', value: groupedByStatus.in_progress ?? 0 },
      { name: 'Done', value: groupedByStatus.done ?? 0 },
    ],
    tasksByPriority: [
      { name: 'Low', value: groupedByPriority.low ?? 0 },
      { name: 'Medium', value: groupedByPriority.medium ?? 0 },
      { name: 'High', value: groupedByPriority.high ?? 0 },
    ],
    recentTasks: [...tasks]
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      )
      .slice(0, 6),
  };
}

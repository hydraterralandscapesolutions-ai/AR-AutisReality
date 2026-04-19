const dashboardState = {
  widgets: [],
  filters: {
    dateRange: '7d',
    userRole: 'all',
  },
  loading: false,
  lastUpdatedAt: null,
};

export function getDashboardState() {
  return { ...dashboardState, filters: { ...dashboardState.filters } };
}

export function setDashboardLoading(isLoading) {
  dashboardState.loading = Boolean(isLoading);
}

export function setDashboardFilters(nextFilters = {}) {
  dashboardState.filters = {
    ...dashboardState.filters,
    ...nextFilters,
  };
}

export function setDashboardWidgets(widgets = []) {
  dashboardState.widgets = Array.isArray(widgets) ? widgets : [];
  dashboardState.lastUpdatedAt = new Date().toISOString();
}

export async function refreshDashboard(fetchWidgets) {
  if (typeof fetchWidgets !== 'function') {
    throw new Error('refreshDashboard requires a fetchWidgets function.');
  }

  setDashboardLoading(true);

  try {
    const widgets = await fetchWidgets({ ...dashboardState.filters });
    setDashboardWidgets(widgets);
    return getDashboardState();
  } finally {
    setDashboardLoading(false);
  }
}

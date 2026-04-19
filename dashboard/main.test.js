import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDashboardState,
  refreshDashboard,
  setDashboardFilters,
  setDashboardLoading,
  setDashboardWidgets,
} from './main';

describe('dashboard state', () => {
  beforeEach(() => {
    setDashboardLoading(false);
    setDashboardFilters({ dateRange: '7d', userRole: 'all' });
    setDashboardWidgets([]);
  });

  it('returns a defensive copy from getDashboardState', () => {
    const state = getDashboardState();
    state.filters.dateRange = '30d';

    expect(getDashboardState().filters.dateRange).toBe('7d');
  });

  it('merges dashboard filters', () => {
    setDashboardFilters({ dateRange: '30d' });
    expect(getDashboardState().filters).toEqual({ dateRange: '30d', userRole: 'all' });
  });

  it('normalizes invalid widget input to an empty list and updates timestamp', () => {
    setDashboardWidgets(null);
    const state = getDashboardState();

    expect(state.widgets).toEqual([]);
    expect(state.lastUpdatedAt).toBeTypeOf('string');
  });

  it('refreshDashboard updates widgets and toggles loading', async () => {
    const fetchWidgets = vi.fn(async (filters) => [{ id: 'a', filters }]);
    setDashboardFilters({ dateRange: '14d' });

    const state = await refreshDashboard(fetchWidgets);

    expect(fetchWidgets).toHaveBeenCalledWith({ dateRange: '14d', userRole: 'all' });
    expect(state.loading).toBe(true);
    expect(state.widgets).toEqual([{ id: 'a', filters: { dateRange: '14d', userRole: 'all' } }]);
    expect(getDashboardState().loading).toBe(false);
  });

  it('refreshDashboard resets loading when the fetcher throws', async () => {
    const fetchWidgets = vi.fn(async () => {
      throw new Error('boom');
    });

    await expect(refreshDashboard(fetchWidgets)).rejects.toThrow('boom');
    expect(getDashboardState().loading).toBe(false);
  });

  it('throws when refreshDashboard is called without a function', async () => {
    await expect(refreshDashboard()).rejects.toThrow('refreshDashboard requires a fetchWidgets function.');
  });
});

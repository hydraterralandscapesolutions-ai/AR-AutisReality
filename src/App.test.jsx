import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  deriveRole,
  formatLastFired,
  getNotificationPermission,
  isInDndWindow,
  isUserEmailVerified,
  normalizeChildren,
  normalizeClaimedBadges,
  normalizeCompletionHistory,
  normalizeGameProgress,
  normalizeGameProgressByChild,
  normalizeRegulationIndex,
  normalizeRegulationIndexByChild,
  normalizeReminderPreferences,
  normalizeReminderPreferencesByChild,
  normalizeReminders,
  normalizeRewardMessageByChild,
  normalizeRewardPointsByChild,
  normalizeTasks,
  parseRangeDays,
} from './App';

describe('App utility functions', () => {
  afterEach(() => {
    vi.useRealTimers();
    if ('window' in globalThis) {
      delete globalThis.window;
    }
  });

  it('derives role and email verification safely', () => {
    expect(deriveRole({ user_metadata: { role: 'admin' } })).toBe('admin');
    expect(deriveRole({ user_metadata: { role: 'parent' } })).toBe('parent');
    expect(isUserEmailVerified({ email_confirmed_at: '2025-01-01' })).toBe(true);
    expect(isUserEmailVerified({})).toBe(false);
  });

  it('normalizes tasks and ignores malformed entries', () => {
    const result = normalizeTasks([
      { id: 7, label: 'Valid', done: 1, childId: 'c1' },
      { label: 'Auto id' },
      { id: 'bad', done: true },
      null,
    ]);

    expect(result).toEqual([
      { id: 7, label: 'Valid', done: true, childId: 'c1' },
      { id: 2, label: 'Auto id', done: false, childId: undefined },
    ]);
  });

  it('normalizes regulation index and per-child maps', () => {
    expect(normalizeRegulationIndex(2)).toBe(2);
    expect(normalizeRegulationIndex(50)).toBe(0);
    expect(normalizeRegulationIndexByChild({ c1: 1, c2: 99, bad: 'x' })).toEqual({ c1: 1, c2: 0 });
  });

  it('normalizes reward maps', () => {
    expect(normalizeRewardPointsByChild({ c1: 12, c2: -1, c3: '4' })).toEqual({ c1: 12 });
    expect(normalizeRewardMessageByChild({ c1: 'Nice', c2: 5 })).toEqual({ c1: 'Nice' });
  });

  it('normalizes completion history and sorts by date', () => {
    const result = normalizeCompletionHistory([
      { date: '2025-02-02', completionRate: 40, completed: 2, total: 5, childId: 'c1' },
      { date: '2025-01-01', completionRate: 'bad' },
      { completed: 1 },
    ]);

    expect(result).toEqual([
      { date: '2025-01-01', completionRate: 0, completed: 0, total: 0, childId: undefined },
      { date: '2025-02-02', completionRate: 40, completed: 2, total: 5, childId: 'c1' },
    ]);
  });

  it('normalizes reminders and reminder preferences', () => {
    const reminders = normalizeReminders([
      { id: 9, label: 'Evening', time: '20:00', enabled: 1, days: [1, 2], childId: 'c1', lastFired: 'x' },
      { label: 'Fallback', days: [9] },
    ]);

    expect(reminders).toEqual([
      { id: 9, label: 'Evening', time: '20:00', enabled: true, days: [1, 2], childId: 'c1', lastFired: 'x' },
      { id: 2, label: 'Fallback', time: '08:00', enabled: false, days: [0, 1, 2, 3, 4, 5, 6], childId: undefined, lastFired: null },
    ]);

    expect(normalizeReminderPreferences({ soundEnabled: false, snoozeDuration: 15 })).toEqual({
      soundEnabled: false,
      vibrationEnabled: false,
      dndEnabled: false,
      dndStart: '22:00',
      dndEnd: '07:00',
      snoozeDuration: 15,
    });

    expect(normalizeReminderPreferencesByChild({ c1: { vibrationEnabled: true }, c2: null })).toEqual({
      c1: {
        soundEnabled: true,
        vibrationEnabled: true,
        dndEnabled: false,
        dndStart: '22:00',
        dndEnd: '07:00',
        snoozeDuration: 10,
      },
      c2: {
        soundEnabled: true,
        vibrationEnabled: false,
        dndEnabled: false,
        dndStart: '22:00',
        dndEnd: '07:00',
        snoozeDuration: 10,
      },
    });
  });

  it('normalizes children and claimed badges', () => {
    expect(normalizeChildren([{ id: 'c1', name: '  Ava  ', color: '#abc' }, { id: 2, name: 'Bad' }])).toEqual([
      { id: 'c1', name: 'Ava', color: '#abc' },
    ]);
    expect(normalizeClaimedBadges(['a', 2, 'b'])).toEqual(['a', 'b']);
  });

  it('normalizes game progress arrays', () => {
    expect(
      normalizeGameProgress([
        { game_name: 'Emotion Match', sessions: 2, high_score: 8, last_played_at: '2025-01-01T00:00:00Z' },
      ])
    ).toEqual([
      { gameName: 'Emotion Match', sessions: 2, highScore: 8, lastPlayedAt: '2025-01-01T00:00:00Z' },
      { gameName: 'Focus Garden', sessions: 0, highScore: 0, lastPlayedAt: null },
      { gameName: 'Routine Quest', sessions: 0, highScore: 0, lastPlayedAt: null },
    ]);

    expect(
      normalizeGameProgressByChild({
        c1: [{ gameName: 'Routine Quest', sessions: 3, highScore: 10, lastPlayedAt: '2025-02-01T00:00:00Z' }],
      }).c1
    ).toEqual([
      { gameName: 'Emotion Match', sessions: 0, highScore: 0, lastPlayedAt: null },
      { gameName: 'Focus Garden', sessions: 0, highScore: 0, lastPlayedAt: null },
      { gameName: 'Routine Quest', sessions: 3, highScore: 10, lastPlayedAt: '2025-02-01T00:00:00Z' },
    ]);
  });

  it('parses range days with fallback', () => {
    expect(parseRangeDays('30d')).toBe(30);
    expect(parseRangeDays('bad')).toBe(7);
  });

  it('resolves notification permission based on browser support', () => {
    expect(getNotificationPermission()).toBe('unsupported');

    globalThis.window = { Notification: { permission: 'granted' } };
    expect(getNotificationPermission()).toBe('granted');
  });

  it('computes DND windows for same-day and overnight ranges', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T23:30:00'));
    expect(isInDndWindow('22:00', '07:00')).toBe(true);
    expect(isInDndWindow('12:00', '13:00')).toBe(false);

    vi.setSystemTime(new Date('2025-01-01T12:30:00'));
    expect(isInDndWindow('12:00', '13:00')).toBe(true);
  });

  it('formats last fired labels', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-10T12:00:00'));
    expect(formatLastFired('2025-01-10T10:00:00')).toContain('Today at');
    expect(formatLastFired('2025-01-09T10:00:00')).toContain('Yesterday at');
    expect(formatLastFired('2025-01-05T10:00:00')).toContain('Jan');
    expect(formatLastFired(null)).toBeNull();
  });
});

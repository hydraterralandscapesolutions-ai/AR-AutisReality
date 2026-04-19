import { afterEach, describe, expect, it, vi } from 'vitest';

const createClientMock = vi.fn((url, key) => ({ url, key, mocked: true }));

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));

describe('supabaseClient', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    createClientMock.mockClear();
  });

  it('creates a client when required env vars exist', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'public-key');

    const module = await import('./supabaseClient');

    expect(module.hasSupabaseConfig).toBe(true);
    expect(createClientMock).toHaveBeenCalledWith('https://example.supabase.co', 'public-key');
    expect(module.supabase).toEqual({
      url: 'https://example.supabase.co',
      key: 'public-key',
      mocked: true,
    });
  });

  it('does not create a client when env vars are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const module = await import('./supabaseClient');

    expect(module.hasSupabaseConfig).toBe(false);
    expect(module.supabase).toBeNull();
    expect(createClientMock).not.toHaveBeenCalled();
  });
});

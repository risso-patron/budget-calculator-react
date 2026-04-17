
import { renderHook, waitFor } from '@testing-library/react';

const {
  mockSelect,
  mockFrom,
  mockGetSession,
} = vi.hoisted(() => {
  const select = vi.fn();
  const eq = vi.fn(() => ({ single: select }));
  const from = vi.fn(() => ({
    select: vi.fn(() => ({ eq })),
  }));
  const getSession = vi.fn();

  return {
    mockSelect: select,
    mockEq: eq,
    mockFrom: from,
    mockGetSession: getSession,
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
    },
    from: mockFrom,
  },
}));

import { useSubscription } from '../hooks/useSubscription';

describe('useSubscription security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockResolvedValue({ data: { user_id: 'user-123', plan_type: 'free', status: 'active' }, error: null });
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'token-123' } } });
  });

  it('bloquea upgrade directo desde cliente', async () => {
    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const response = await result.current.updateSubscription('pro_monthly');

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/solo pueden procesarse desde backend seguro/i);
  });
});

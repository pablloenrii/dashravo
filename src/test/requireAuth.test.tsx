/**
 * RAVO OS — Testes do guard de rota RequireAuth (src/components/RequireAuth.tsx)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth } from '@/components/RequireAuth';
import { sb } from '@/services/supabase';

vi.mock('@/services/supabase', () => ({
  sb: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    rpc: vi.fn(),
  },
  setAuthToken: vi.fn(),
}));

const mockedSb = {
  auth: {
    getSession: sb.auth.getSession as unknown as ReturnType<typeof vi.fn>,
    onAuthStateChange: sb.auth.onAuthStateChange as unknown as ReturnType<typeof vi.fn>,
  },
};

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<RequireAuth><div>conteúdo protegido</div></RequireAuth>} />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedSb.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

describe('RequireAuth', () => {
  it('mostra o conteúdo quando há sessão', async () => {
    mockedSb.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null });
    renderRoute();
    expect(await screen.findByText('conteúdo protegido')).toBeTruthy();
  });

  it('redireciona para /login quando não há sessão', async () => {
    mockedSb.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    renderRoute();
    expect(await screen.findByText('login page')).toBeTruthy();
    expect(screen.queryByText('conteúdo protegido')).toBeNull();
  });
});

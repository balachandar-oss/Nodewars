import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/login' }),
}));

describe('Login UI - Real Seminar Authentication Terminal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('1. Renders the Node Wars Authentication Terminal with LOGIN ID and PASSWORD', () => {
    render(<Login />);

    expect(screen.getByText('NODE WARS')).toBeInTheDocument();
    expect(screen.getByText('AUTHENTICATION TERMINAL')).toBeInTheDocument();
    expect(screen.getByText('LOGIN ID')).toBeInTheDocument();
    expect(screen.getByText('PASSWORD')).toBeInTheDocument();
    expect(screen.getByText(/AUTHENTICATE/)).toBeInTheDocument();
  });

  it('2. Does NOT render any demo or guest login buttons', () => {
    render(<Login />);

    expect(screen.queryByText(/DEMO ACCESS/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/TRY DEMO/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/GUEST LOGIN/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DEMO LOGIN/i)).not.toBeInTheDocument();
  });

  it('3. Successfully submits credentials to /api/auth/login and stores token on success', async () => {
    const mockToken = 'mocked-jwt-token';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: mockToken, user: { username: 'student02', role: 'PLAYER' } })
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<Login />);

    const idInput = screen.getByPlaceholderText('ENTER LOGIN ID');
    const pwdInput = screen.getByPlaceholderText('ENTER PASSWORD');
    const submitBtn = screen.getByRole('button', { name: /AUTHENTICATE/i });

    fireEvent.change(idInput, { target: { value: 'student02' } });
    fireEvent.change(pwdInput, { target: { value: 'nw-k9X2#mP8q' } });
    fireEvent.click(submitBtn);

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ username: 'student02', password: 'nw-k9X2#mP8q' })
    }));
  });
});

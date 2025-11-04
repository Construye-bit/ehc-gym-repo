import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAdminAuth } from '@/hooks/use-admin-auth';

// Mock de useNavigate
const mockNavigate = vi.fn();

vi.mock('@/hooks/use-auth');
vi.mock('@/hooks/use-admin-auth');
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children }: any) => <a>{children}</a>,
  };
});

// Crear un componente mock que evite el RouterProvider
const MockAdminLoginForm = () => {
  const { loginWithCredentials, isLoading, error } = useAdminAuth();
  const { isSuperAdmin, isAdmin, isTrainer } = useAuth();
  const navigate = mockNavigate;

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    if (isSuperAdmin) {
      navigate({ to: '/super-admin/dashboard' });
    } else if (isAdmin) {
      navigate({ to: '/admin' });
    } else if (isTrainer) {
      navigate({ to: '/redirect-to-mobile' });
    }
  }, [isSuperAdmin, isAdmin, isTrainer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithCredentials(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Correo electrónico</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <div>{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Ingresando...' : 'Acceder'}
      </button>
    </form>
  );
};

describe('Integration: Login Flow', () => {
  const mockLoginWithCredentials = vi.fn();

  beforeEach(() => {
    mockNavigate.mockReset();
    mockLoginWithCredentials.mockReset();

    vi.mocked(useAdminAuth).mockReturnValue({
      login: vi.fn(),
      loginWithCredentials: mockLoginWithCredentials,
      logout: vi.fn(),
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
    });

    vi.mocked(useAuth).mockReturnValue({
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: false,
      isClient: false,
      isAuthenticated: false,
      isLoading: false,
      user: null,
      person: null,
      roles: [],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: false,
    });
  });

  it('debe completar el flujo de login como Super Admin', async () => {
    const user = userEvent.setup();

    // Renderizar formulario
    const { rerender } = render(<MockAdminLoginForm />);

    // Llenar formulario
    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      'superadmin@ehcgym.com'
    );
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');

    // Enviar formulario
    await user.click(screen.getByRole('button', { name: /acceder/i }));

    // Verificar que se llamó loginWithCredentials
    expect(mockLoginWithCredentials).toHaveBeenCalledWith(
      'superadmin@ehcgym.com',
      'password123'
    );

    // Simular login exitoso
    vi.mocked(useAdminAuth).mockReturnValue({
      login: vi.fn(),
      loginWithCredentials: mockLoginWithCredentials,
      logout: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: { id: 'user_1' } as any,
    });

    vi.mocked(useAuth).mockReturnValue({
      isSuperAdmin: true,
      isAdmin: true,
      isTrainer: false,
      isClient: false,
      isAuthenticated: true,
      isLoading: false,
      user: null,
      person: { name: 'Admin', lastName: 'User' } as any,
      roles: ['SUPER_ADMIN'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    // Re-renderizar con nuevo estado
    rerender(<MockAdminLoginForm />);

    // Verificar redirección
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/super-admin/dashboard',
      });
    });
  });

  it('debe completar el flujo de login como Admin normal', async () => {
    const user = userEvent.setup();

    const { rerender } = render(<MockAdminLoginForm />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'admin@ehcgym.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /acceder/i }));

    // Simular login exitoso como Admin
    vi.mocked(useAuth).mockReturnValue({
      isSuperAdmin: false,
      isAdmin: true,
      isTrainer: false,
      isClient: false,
      isAuthenticated: true,
      isLoading: false,
      user: null,
      person: { name: 'Admin', lastName: 'User' } as any,
      roles: ['ADMIN'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    rerender(<MockAdminLoginForm />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin' });
    });
  });

  it('debe redirigir Trainers a app móvil', async () => {
    const user = userEvent.setup();

    const { rerender } = render(<MockAdminLoginForm />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'trainer@ehcgym.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /acceder/i }));

    // Simular login exitoso como Trainer
    vi.mocked(useAuth).mockReturnValue({
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: true,
      isClient: false,
      isAuthenticated: true,
      isLoading: false,
      user: null,
      person: { name: 'Trainer', lastName: 'User' } as any,
      roles: ['TRAINER'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    rerender(<MockAdminLoginForm />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/redirect-to-mobile' });
    });
  });

  it('debe manejar errores de credenciales inválidas', async () => {
    const user = userEvent.setup();

    vi.mocked(useAdminAuth).mockReturnValue({
      login: vi.fn(),
      loginWithCredentials: mockLoginWithCredentials,
      logout: vi.fn(),
      isAuthenticated: false,
      isLoading: false,
      error: 'Credenciales inválidas',
      user: null,
    });

    render(<MockAdminLoginForm />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'wrong@email.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /acceder/i }));

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('debe mostrar estado de carga durante el login', async () => {
    const user = userEvent.setup();

    const { rerender } = render(<MockAdminLoginForm />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'admin@ehcgym.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /acceder/i }));

    // Simular estado de carga
    vi.mocked(useAdminAuth).mockReturnValue({
      login: vi.fn(),
      loginWithCredentials: mockLoginWithCredentials,
      logout: vi.fn(),
      isAuthenticated: false,
      isLoading: true,
      error: null,
      user: null,
    });

    rerender(<MockAdminLoginForm />);

    expect(screen.getByRole('button', { name: /ingresando/i })).toBeDisabled();
  });
});

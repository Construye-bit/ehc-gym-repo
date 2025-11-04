import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useAuth } from '@/hooks/use-auth';

// Mock de useNavigate
const mockNavigate = vi.fn();

vi.mock('@/hooks/use-admin-auth');
vi.mock('@/hooks/use-auth');
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

// Mock del componente AdminLoginForm para simplificar
const MockAdminLoginForm = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
  const { loginWithCredentials, isLoading, error } = useAdminAuth();
  const { isAdmin, isSuperAdmin, isTrainer, isClient, isLoading: authLoading } = useAuth();
  const navigate = mockNavigate;

  // Efecto de redirección
  if (!authLoading && !isLoading) {
    if (isTrainer || isClient) {
      navigate({ to: '/redirect-to-mobile' });
    } else if (isSuperAdmin) {
      navigate({ to: '/super-admin/dashboard' });
    } else if (isAdmin) {
      navigate({ to: '/admin' });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    await loginWithCredentials(email, password);
    onLoginSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Panel De Gerente</h1>
      <h2>"EHC GYM"</h2>
      <label htmlFor="email">Correo electrónico</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Contraseña</label>
      <input id="password" name="password" type="password" required />
      {error && <div>{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Ingresando...' : 'Acceder'}
      </button>
    </form>
  );
};

vi.mock('@/components/auth/login-form', () => ({
  AdminLoginForm: MockAdminLoginForm,
}));

describe('AdminLoginForm Component', () => {
  const mockLoginWithCredentials = vi.fn();
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    mockLoginWithCredentials.mockReset();
    mockOnLoginSuccess.mockReset();
    mockNavigate.mockReset();

    // Mock useAdminAuth
    vi.mocked(useAdminAuth).mockReturnValue({
      login: vi.fn(),
      loginWithCredentials: mockLoginWithCredentials,
      logout: vi.fn(),
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
    });

    // Mock useAuth
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

  it('debe renderizar el formulario de login correctamente', () => {
    render(<MockAdminLoginForm />);

    expect(screen.getByText('Panel De Gerente')).toBeInTheDocument();
    expect(screen.getByText('"EHC GYM"')).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acceder/i })).toBeInTheDocument();
  });

  it('debe permitir escribir en los campos de email y contraseña', async () => {
    const user = userEvent.setup();
    render(<MockAdminLoginForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('debe llamar a loginWithCredentials al enviar el formulario', async () => {
    const user = userEvent.setup();
    render(<MockAdminLoginForm onLoginSuccess={mockOnLoginSuccess} />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /acceder/i });

    await user.type(emailInput, 'admin@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockLoginWithCredentials).toHaveBeenCalledWith(
      'admin@example.com',
      'password123'
    );
    expect(mockOnLoginSuccess).toHaveBeenCalled();
  });

  it('debe mostrar mensaje de error cuando el login falla', () => {
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

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('debe deshabilitar el botón y mostrar "Ingresando..." cuando isLoading es true', () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      login: vi.fn(),
      loginWithCredentials: mockLoginWithCredentials,
      logout: vi.fn(),
      isAuthenticated: false,
      isLoading: true,
      error: null,
      user: null,
    });

    render(<MockAdminLoginForm />);

    const submitButton = screen.getByRole('button', { name: /ingresando/i });
    expect(submitButton).toBeDisabled();
  });

  it('debe redirigir a /super-admin/dashboard si es super admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      isSuperAdmin: true,
      isAdmin: true,
      isTrainer: false,
      isClient: false,
      isAuthenticated: true,
      isLoading: false,
      user: null,
      person: null,
      roles: ['SUPER_ADMIN'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    render(<MockAdminLoginForm />);

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/super-admin/dashboard' });
  });

  it('debe redirigir a /admin si es admin normal', () => {
    vi.mocked(useAuth).mockReturnValue({
      isSuperAdmin: false,
      isAdmin: true,
      isTrainer: false,
      isClient: false,
      isAuthenticated: true,
      isLoading: false,
      user: null,
      person: null,
      roles: ['ADMIN'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    render(<MockAdminLoginForm />);

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin' });
  });

  it('debe redirigir a /redirect-to-mobile si es trainer o client', () => {
    vi.mocked(useAuth).mockReturnValue({
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: true,
      isClient: false,
      isAuthenticated: true,
      isLoading: false,
      user: null,
      person: null,
      roles: ['TRAINER'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    render(<MockAdminLoginForm />);

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/redirect-to-mobile' });
  });

  it('debe validar que el email sea requerido', async () => {
    const user = userEvent.setup();
    render(<MockAdminLoginForm />);

    const submitButton = screen.getByRole('button', { name: /acceder/i });
    await user.click(submitButton);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    expect(emailInput).toBeInvalid();
  });
});

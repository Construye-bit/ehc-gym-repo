import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouteGuard } from '@/components/shared/route-guard';
import { useAuth } from '@/hooks/use-auth';

// Mock de useNavigate
const mockNavigate = vi.fn();

vi.mock('@/hooks/use-auth');
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

describe('RouteGuard Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('debe mostrar loading mientras verifica autenticación', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: false,
      isClient: false,
      user: null,
      person: null,
      roles: [],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: false,
    });

    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    expect(screen.getByText(/verificando acceso/i)).toBeInTheDocument();
  });

  it('debe redirigir a /auth/login si no está autenticado', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: false,
      isClient: false,
      user: null,
      person: null,
      roles: [],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: false,
    });

    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/auth/login' });
    });
  });

  it('debe mostrar contenido si el usuario es Super Admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isSuperAdmin: true,
      isAdmin: true,
      isTrainer: false,
      isClient: false,
      user: null,
      person: null,
      roles: ['SUPER_ADMIN'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    render(
      <RouteGuard requireSuperAdmin={true}>
        <div>Super Admin Content</div>
      </RouteGuard>
    );

    expect(screen.getByText('Super Admin Content')).toBeInTheDocument();
  });

  it('debe redirigir Admin normal si requireSuperAdmin es true', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isSuperAdmin: false,
      isAdmin: true,
      isTrainer: false,
      isClient: false,
      user: null,
      person: null,
      roles: ['ADMIN'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    render(
      <RouteGuard requireSuperAdmin={true}>
        <div>Super Admin Content</div>
      </RouteGuard>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin' });
    });
  });

  it('debe mostrar contenido si el usuario tiene rol permitido', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isSuperAdmin: false,
      isAdmin: true,
      isTrainer: false,
      isClient: false,
      user: null,
      person: null,
      roles: ['ADMIN'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    render(
      <RouteGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
        <div>Admin Content</div>
      </RouteGuard>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('debe redirigir si el usuario no tiene rol permitido', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: true,
      isClient: false,
      user: null,
      person: null,
      roles: ['TRAINER'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    render(
      <RouteGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
        <div>Admin Content</div>
      </RouteGuard>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/redirect-to-mobile' });
    });
  });

  it('debe redirigir Trainers y Clients a /redirect-to-mobile', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: false,
      isClient: true,
      user: null,
      person: null,
      roles: ['CLIENT'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/redirect-to-mobile' });
    });
  });

  it('debe usar redirectTo personalizado cuando se proporciona', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: false,
      isClient: false,
      user: null,
      person: null,
      roles: [],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: false,
    });

    render(
      <RouteGuard redirectTo="/custom-redirect">
        <div>Protected Content</div>
      </RouteGuard>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/custom-redirect' });
    });
  });

  it('debe permitir acceso a cualquier admin por defecto', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isSuperAdmin: false,
      isAdmin: true,
      isTrainer: false,
      isClient: false,
      user: null,
      person: null,
      roles: ['ADMIN'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    render(
      <RouteGuard>
        <div>Admin Content</div>
      </RouteGuard>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('debe permitir acceso a trainers cuando está en allowedRoles', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: true,
      isClient: false,
      user: null,
      person: null,
      roles: ['TRAINER'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    render(
      <RouteGuard allowedRoles={['TRAINER']}>
        <div>Trainer Content</div>
      </RouteGuard>
    );

    expect(screen.getByText('Trainer Content')).toBeInTheDocument();
  });

  it('debe permitir acceso a clientes cuando está en allowedRoles', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: false,
      isClient: true,
      user: null,
      person: null,
      roles: ['CLIENT'],
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      isSignedIn: true,
    });

    render(
      <RouteGuard allowedRoles={['CLIENT']}>
        <div>Client Content</div>
      </RouteGuard>
    );

    expect(screen.getByText('Client Content')).toBeInTheDocument();
  });
});

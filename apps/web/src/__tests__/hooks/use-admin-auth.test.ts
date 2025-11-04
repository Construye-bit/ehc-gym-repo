import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock de useNavigate
const mockNavigate = vi.fn();

// Mocks de Clerk
const mockUseUser = vi.fn();
const mockUseClerk = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@clerk/clerk-react', () => ({
  useClerk: mockUseClerk,
  useUser: mockUseUser,
}));

// Importar después de los mocks
const { useAdminAuth } = await import('@/hooks/use-admin-auth');

describe('useAdminAuth Hook', () => {
  const mockSignOut = vi.fn();
  const mockOpenSignIn = vi.fn();
  const mockSignInCreate = vi.fn();

  beforeEach(() => {
    mockNavigate.mockReset();
    mockSignOut.mockReset();
    mockOpenSignIn.mockReset();
    mockSignInCreate.mockReset();
    mockUseUser.mockReset();
    mockUseClerk.mockReset();

    // Configuración por defecto de useClerk
    mockUseClerk.mockReturnValue({
      signOut: mockSignOut,
      openSignIn: mockOpenSignIn,
      client: {
        signIn: {
          create: mockSignInCreate,
        },
      },
    });

    // Usuario no autenticado por defecto
    mockUseUser.mockReturnValue({
      isSignedIn: false,
      user: null,
      isLoaded: true,
    });
  });

  it('debe retornar el estado inicial correctamente', () => {
    const { result } = renderHook(() => useAdminAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('debe retornar usuario autenticado', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      },
      isLoaded: true,
    });

    const { result } = renderHook(() => useAdminAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });

  it('debe hacer login con credenciales exitosamente', async () => {
    mockSignInCreate.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'session_123',
    });

    // Mock de window.Clerk
    const mockSetActive = vi.fn();
    (window as any).Clerk = {
      setActive: mockSetActive,
      client: {
        signIn: {
          create: mockSignInCreate,
        },
      },
    };

    const { result } = renderHook(() => useAdminAuth());

    await act(async () => {
      await result.current.loginWithCredentials(
        'test@example.com',
        'password123',
        '/admin'
      );
    });

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: 'test@example.com',
        password: 'password123',
      });
      expect(mockSetActive).toHaveBeenCalledWith({
        session: 'session_123',
      });
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin' });
      expect(result.current.error).toBeNull();
    });
  });

  it('debe manejar errores de login', async () => {
    const errorMessage = 'Credenciales inválidas';
    mockSignInCreate.mockRejectedValue({
      errors: [{ message: errorMessage }],
    });

    (window as any).Clerk = {
      client: {
        signIn: {
          create: mockSignInCreate,
        },
      },
    };

    const { result } = renderHook(() => useAdminAuth());

    await act(async () => {
      await result.current.loginWithCredentials('test@example.com', 'wrong');
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('debe hacer logout exitosamente', async () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: { id: 'user_123' },
      isLoaded: true,
    });
    mockSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAdminAuth());

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/auth/login' });
    });
  });

  it('debe abrir el UI de login de Clerk', async () => {
    mockOpenSignIn.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAdminAuth());

    await act(async () => {
      await result.current.login('/admin');
    });

    await waitFor(() => {
      expect(mockOpenSignIn).toHaveBeenCalledWith({
        redirectUrl: '/admin',
      });
    });
  });

  it('debe usar URL por defecto si no se proporciona redirectUrl en login', async () => {
    mockOpenSignIn.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAdminAuth());

    await act(async () => {
      await result.current.login();
    });

    await waitFor(() => {
      expect(mockOpenSignIn).toHaveBeenCalledWith({
        redirectUrl: '/admin',
      });
    });
  });

  it('no debe redirigir si no se proporciona redirectUrl en loginWithCredentials', async () => {
    mockSignInCreate.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'session_123',
    });

    (window as any).Clerk = {
      setActive: vi.fn(),
      client: {
        signIn: {
          create: mockSignInCreate,
        },
      },
    };

    const { result } = renderHook(() => useAdminAuth());

    await act(async () => {
      await result.current.loginWithCredentials('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('debe establecer error cuando falla el logout', async () => {
    mockSignOut.mockRejectedValue(new Error('Logout failed'));

    const { result } = renderHook(() => useAdminAuth());

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Error during sign out');
    });
  });
});

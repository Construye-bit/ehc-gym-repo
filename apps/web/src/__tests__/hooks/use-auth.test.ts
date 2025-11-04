import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mocks de Clerk
const mockUseUser = vi.fn();

// Mocks de Convex
const mockUseQuery = vi.fn();

vi.mock('@clerk/clerk-react', () => ({
  useUser: mockUseUser,
}));

vi.mock('convex/react', () => ({
  useQuery: mockUseQuery,
}));

// Importar después de los mocks
const { useAuth } = await import('@/hooks/use-auth');

// Mock data
const mockUserWithRoles = {
  superAdmin: {
    user: {
      _id: 'user_123' as any,
      _creationTime: Date.now(),
      clerkUserId: 'user_123',
      email: 'superadmin@example.com',
    },
    person: {
      _id: 'person_1' as any,
      _creationTime: Date.now(),
      clerkUserId: 'user_123',
      name: 'Super Admin',
      lastName: 'User',
      documentType: 'CC' as const,
      documentNumber: '1234567890',
      dateOfBirth: '1990-01-01',
      gender: 'Masculino' as const,
    },
    roles: ['SUPER_ADMIN', 'ADMIN'] as any[],
  },
  admin: {
    user: {
      _id: 'user_456' as any,
      _creationTime: Date.now(),
      clerkUserId: 'user_456',
      email: 'admin@example.com',
    },
    person: {
      _id: 'person_2' as any,
      _creationTime: Date.now(),
      clerkUserId: 'user_456',
      name: 'Admin',
      lastName: 'User',
      documentType: 'CC' as const,
      documentNumber: '9876543210',
      dateOfBirth: '1992-01-01',
      gender: 'Femenino' as const,
    },
    roles: ['ADMIN'] as any[],
  },
  trainer: {
    user: {
      _id: 'user_789' as any,
      _creationTime: Date.now(),
      clerkUserId: 'user_789',
      email: 'trainer@example.com',
    },
    person: {
      _id: 'person_3' as any,
      _creationTime: Date.now(),
      clerkUserId: 'user_789',
      name: 'Trainer',
      lastName: 'User',
      documentType: 'CC' as const,
      documentNumber: '1122334455',
      dateOfBirth: '1995-01-01',
      gender: 'Masculino' as const,
    },
    roles: ['TRAINER'] as any[],
  },
  client: {
    user: {
      _id: 'user_101' as any,
      _creationTime: Date.now(),
      clerkUserId: 'user_101',
      email: 'client@example.com',
    },
    person: {
      _id: 'person_4' as any,
      _creationTime: Date.now(),
      clerkUserId: 'user_101',
      name: 'Client',
      lastName: 'User',
      documentType: 'CC' as const,
      documentNumber: '5566778899',
      dateOfBirth: '2000-01-01',
      gender: 'Femenino' as const,
    },
    roles: ['CLIENT'] as any[],
  },
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    mockUseUser.mockReset();
    mockUseQuery.mockReset();

    // Usuario no autenticado por defecto
    mockUseUser.mockReturnValue({
      isSignedIn: false,
      user: null,
      isLoaded: true,
    });

    mockUseQuery.mockReturnValue(undefined);
  });

  it('debe retornar estado de carga cuando Clerk está cargando', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: false,
      user: null,
      isLoaded: false,
    });
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('debe retornar estado no autenticado cuando el usuario no está autenticado', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isSignedIn).toBe(false);
  });

  it('debe retornar datos del usuario autenticado con rol de SUPER_ADMIN', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: { id: 'user_123' },
      isLoaded: true,
    });
    mockUseQuery.mockReturnValue(mockUserWithRoles.superAdmin);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isSuperAdmin).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isTrainer).toBe(false);
    expect(result.current.isClient).toBe(false);
    expect(result.current.person).toBeDefined();
    expect(result.current.roles).toContain('SUPER_ADMIN');
  });

  it('debe retornar datos del usuario autenticado con rol de ADMIN', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: { id: 'user_456' },
      isLoaded: true,
    });
    mockUseQuery.mockReturnValue(mockUserWithRoles.admin);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isTrainer).toBe(false);
    expect(result.current.isClient).toBe(false);
    expect(result.current.roles).toContain('ADMIN');
  });

  it('debe retornar datos del usuario autenticado con rol de TRAINER', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: { id: 'user_789' },
      isLoaded: true,
    });
    mockUseQuery.mockReturnValue(mockUserWithRoles.trainer);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isTrainer).toBe(true);
    expect(result.current.isClient).toBe(false);
    expect(result.current.roles).toContain('TRAINER');
  });

  it('debe retornar datos del usuario autenticado con rol de CLIENT', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: { id: 'user_101' },
      isLoaded: true,
    });
    mockUseQuery.mockReturnValue(mockUserWithRoles.client);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isTrainer).toBe(false);
    expect(result.current.isClient).toBe(true);
    expect(result.current.roles).toContain('CLIENT');
  });

  it('hasRole debe verificar correctamente un rol específico', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: { id: 'user_456' },
      isLoaded: true,
    });
    mockUseQuery.mockReturnValue(mockUserWithRoles.admin);

    const { result } = renderHook(() => useAuth());

    expect(result.current.hasRole('ADMIN')).toBe(true);
    expect(result.current.hasRole('SUPER_ADMIN')).toBe(false);
    expect(result.current.hasRole('TRAINER')).toBe(false);
    expect(result.current.hasRole('CLIENT')).toBe(false);
  });

  it('hasAnyRole debe verificar correctamente si tiene al menos uno de los roles', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: { id: 'user_456' },
      isLoaded: true,
    });
    mockUseQuery.mockReturnValue(mockUserWithRoles.admin);

    const { result } = renderHook(() => useAuth());

    expect(result.current.hasAnyRole(['ADMIN', 'SUPER_ADMIN'])).toBe(true);
    expect(result.current.hasAnyRole(['TRAINER', 'CLIENT'])).toBe(false);
    expect(result.current.hasAnyRole(['ADMIN'])).toBe(true);
  });

  it('hasAllRoles debe verificar correctamente si tiene todos los roles', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: { id: 'user_456' },
      isLoaded: true,
    });
    mockUseQuery.mockReturnValue({
      user: mockUserWithRoles.admin.user,
      person: mockUserWithRoles.admin.person,
      roles: ['ADMIN', 'TRAINER'] as any[],
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.hasAllRoles(['ADMIN', 'TRAINER'])).toBe(true);
    expect(result.current.hasAllRoles(['ADMIN', 'SUPER_ADMIN'])).toBe(false);
    expect(result.current.hasAllRoles(['ADMIN'])).toBe(true);
  });

  it('debe manejar correctamente cuando no hay datos de roles', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: { id: 'user_999' },
      isLoaded: true,
    });
    mockUseQuery.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.person).toBeNull();
    expect(result.current.roles).toEqual([]);
  });
});

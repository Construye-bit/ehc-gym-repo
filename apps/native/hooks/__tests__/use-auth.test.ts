import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from '../use-auth';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useQuery, useConvexAuth } from 'convex/react';

jest.mock('@clerk/clerk-expo');
jest.mock('convex/react');

describe('useAuth Hook', () => {
  const mockUseClerkAuth = useClerkAuth as jest.MockedFunction<typeof useClerkAuth>;
  const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
  const mockUseConvexAuth = useConvexAuth as jest.MockedFunction<typeof useConvexAuth>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for useConvexAuth
    mockUseConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
  });

  describe('Estado de carga', () => {
    it('debe retornar isLoading true cuando Clerk no está cargado', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: false,
        isLoaded: false,
        userId: null,
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue(undefined);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('debe retornar isLoading true cuando Clerk está cargado pero userWithRoles es undefined', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_123',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue(undefined);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('debe retornar isLoading false cuando ambos están cargados', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_123',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_123', email: 'test@test.com' },
        person: { name: 'Test User' },
        roles: ['CLIENT'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Estado de autenticación', () => {
    it('debe retornar isAuthenticated false cuando no está autenticado', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: false,
        isLoaded: true,
        userId: null,
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue('skip');

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('debe retornar isAuthenticated true cuando está autenticado y tiene usuario', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_123',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_123', email: 'test@test.com' },
        person: { name: 'Test User' },
        roles: ['CLIENT'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Roles y permisos', () => {
    it('debe identificar correctamente un usuario CLIENT', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_123',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_123', email: 'test@test.com' },
        person: { name: 'Test User' },
        roles: ['CLIENT'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.roles).toEqual(['CLIENT']);
      expect(result.current.isClient).toBe(true);
      expect(result.current.isTrainer).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isSuperAdmin).toBe(false);
    });

    it('debe identificar correctamente un usuario TRAINER', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_456',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_456', email: 'trainer@test.com' },
        person: { name: 'Trainer User' },
        roles: ['TRAINER'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.roles).toEqual(['TRAINER']);
      expect(result.current.isClient).toBe(false);
      expect(result.current.isTrainer).toBe(true);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isSuperAdmin).toBe(false);
    });

    it('debe identificar correctamente un usuario ADMIN', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_789',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_789', email: 'admin@test.com' },
        person: { name: 'Admin User' },
        roles: ['ADMIN'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.roles).toEqual(['ADMIN']);
      expect(result.current.isClient).toBe(false);
      expect(result.current.isTrainer).toBe(false);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isSuperAdmin).toBe(false);
    });

    it('debe identificar correctamente un usuario SUPER_ADMIN', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_999',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_999', email: 'superadmin@test.com' },
        person: { name: 'Super Admin' },
        roles: ['SUPER_ADMIN'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.roles).toEqual(['SUPER_ADMIN']);
      expect(result.current.isClient).toBe(false);
      expect(result.current.isTrainer).toBe(false);
      expect(result.current.isAdmin).toBe(true); // isAdmin incluye SUPER_ADMIN
      expect(result.current.isSuperAdmin).toBe(true);
    });

    it('debe manejar múltiples roles correctamente', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_multi',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_multi', email: 'multi@test.com' },
        person: { name: 'Multi Role User' },
        roles: ['CLIENT', 'TRAINER'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.roles).toEqual(['CLIENT', 'TRAINER']);
      expect(result.current.isClient).toBe(true);
      expect(result.current.isTrainer).toBe(true);
      expect(result.current.isAdmin).toBe(false);
    });
  });

  describe('Funciones de verificación de roles', () => {
    it('hasRole debe verificar correctamente un rol específico', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_123',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_123', email: 'test@test.com' },
        person: { name: 'Test User' },
        roles: ['CLIENT', 'TRAINER'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasRole('CLIENT')).toBe(true);
      expect(result.current.hasRole('TRAINER')).toBe(true);
      expect(result.current.hasRole('ADMIN')).toBe(false);
    });

    it('hasAnyRole debe verificar si tiene al menos uno de los roles', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_123',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_123', email: 'test@test.com' },
        person: { name: 'Test User' },
        roles: ['CLIENT'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasAnyRole(['CLIENT', 'TRAINER'])).toBe(true);
      expect(result.current.hasAnyRole(['TRAINER', 'ADMIN'])).toBe(false);
    });

    it('hasAllRoles debe verificar si tiene todos los roles', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_123',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_123', email: 'test@test.com' },
        person: { name: 'Test User' },
        roles: ['CLIENT', 'TRAINER'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasAllRoles(['CLIENT', 'TRAINER'])).toBe(true);
      expect(result.current.hasAllRoles(['CLIENT', 'ADMIN'])).toBe(false);
    });
  });

  describe('Datos de persona', () => {
    it('debe retornar los datos de la persona cuando están disponibles', () => {
      const mockPerson = {
        _id: 'person_123',
        name: 'Test User',
        email: 'test@test.com',
      };

      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_123',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_123', email: 'test@test.com' },
        person: mockPerson,
        roles: ['CLIENT'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.person).toEqual(mockPerson);
    });

    it('debe retornar null cuando no hay datos de persona', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_123',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_123', email: 'test@test.com' },
        person: null,
        roles: ['CLIENT'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.person).toBeNull();
    });
  });

  describe('Información de Clerk', () => {
    it('debe exponer información adicional de Clerk', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'clerk_user_123',
      } as any);

      mockUseConvexAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseQuery.mockReturnValue({
        user: { _id: 'user_123', email: 'test@test.com' },
        person: { name: 'Test User' },
        roles: ['CLIENT'],
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.clerkUserId).toBe('clerk_user_123');
      expect(result.current.isSignedIn).toBe(true);
    });
  });
});

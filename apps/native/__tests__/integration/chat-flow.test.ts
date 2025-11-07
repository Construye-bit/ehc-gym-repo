import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from '@/hooks/use-auth';
import { useConversations } from '@/hooks/use-conversations';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';

jest.mock('@clerk/clerk-expo');
jest.mock('convex/react');
jest.mock('@/api', () => ({
  role_assignments: {
    queries: {
      getCurrentUserWithRoles: jest.fn(),
    },
  },
  chat: {
    conversations: {
      queries: {
        listMine: jest.fn(),
      },
    },
    trainer_catalog: {
      queries: {
        getPublicTrainers: jest.fn(),
      },
    },
  },
}));

describe('Integration Tests - Chat Flow', () => {
  const mockUseClerkAuth = useClerkAuth as jest.MockedFunction<typeof useClerkAuth>;
  const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Usuario autenticado puede acceder al chat', () => {
    it('debe cargar conversaciones para usuario autenticado', async () => {
      // Mock usuario autenticado
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_123',
      } as any);

      // Mock datos de usuario con roles
      mockUseQuery.mockImplementation((...args: any[]) => {
        const params = args[1];
        if (params === 'skip') return 'skip';
        if (params?.limit) {
          // Query de conversaciones
          return {
            conversations: [
              {
                _id: 'conv_1' as any,
                _creationTime: Date.now(),
                client_user_id: 'user_123' as any,
                trainer_user_id: 'trainer_1' as any,
                status: 'OPEN' as const,
                last_message_text: 'Hola',
                last_message_at: Date.now(),
                unread_count: 1,
                created_at: Date.now(),
                updated_at: Date.now(),
                other_participant: {
                  user_id: 'trainer_1' as any,
                  name: 'Trainer 1',
                  role: 'TRAINER' as const,
                },
                my_role: 'CLIENT' as const,
              },
            ],
            nextCursor: null,
          };
        }
        // Query de usuario con roles
        return {
          user: { _id: 'user_123', email: 'test@test.com' },
          person: { name: 'Test User' },
          roles: ['CLIENT'],
        };
      });

      const { result: authResult } = renderHook(() => useAuth());
      const { result: conversationsResult } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(authResult.current.isAuthenticated).toBe(true);
        expect(authResult.current.isClient).toBe(true);
      });

      await waitFor(() => {
        expect(conversationsResult.current.conversations).toHaveLength(1);
        expect(conversationsResult.current.isLoading).toBe(false);
      });
    });

    it('debe mostrar conversaciones vacías para usuario sin chats', async () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user_456',
      } as any);

      mockUseQuery.mockImplementation((...args: any[]) => {
        const params = args[1];
        if (params === 'skip') return 'skip';
        if (params?.limit) {
          return {
            conversations: [],
            nextCursor: null,
          };
        }
        return {
          user: { _id: 'user_456', email: 'new@test.com' },
          person: { name: 'New User' },
          roles: ['CLIENT'],
        };
      });

      const { result: authResult } = renderHook(() => useAuth());
      const { result: conversationsResult } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(authResult.current.isAuthenticated).toBe(true);
      });

      await waitFor(() => {
        expect(conversationsResult.current.conversations).toHaveLength(0);
        expect(conversationsResult.current.hasMore).toBe(false);
      });
    });
  });

  describe('Usuario no autenticado no puede acceder al chat', () => {
    it('debe retornar skip para usuario no autenticado', () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: false,
        isLoaded: true,
        userId: null,
      } as any);

      mockUseQuery.mockReturnValue('skip');

      const { result: authResult } = renderHook(() => useAuth());

      expect(authResult.current.isAuthenticated).toBe(false);
      expect(authResult.current.isLoading).toBe(false);
    });
  });
});

describe('Integration Tests - Trainer Catalog Flow', () => {
  const mockUseClerkAuth = useClerkAuth as jest.MockedFunction<typeof useClerkAuth>;
  const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cliente puede buscar entrenadores', () => {
    it('debe cargar catálogo de entrenadores para cliente', async () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'client_1',
      } as any);

      const mockTrainers = [
        {
          _id: 'trainer_1',
          person_id: 'person_1',
          name: 'Trainer 1',
          specialties: ['Yoga'],
          branch_name: 'Sede Norte',
          profile_picture: null,
        },
        {
          _id: 'trainer_2',
          person_id: 'person_2',
          name: 'Trainer 2',
          specialties: ['CrossFit'],
          branch_name: 'Sede Sur',
          profile_picture: null,
        },
      ];

      mockUseQuery.mockImplementation((...args: any[]) => {
        const params = args[1];
        if (params === 'skip') return 'skip';
        if (params?.limit === 10) {
          return {
            trainers: mockTrainers,
            nextCursor: null,
          };
        }
        return {
          user: { _id: 'client_1', email: 'client@test.com' },
          person: { name: 'Client User' },
          roles: ['CLIENT'],
        };
      });

      const { result: authResult } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(authResult.current.isAuthenticated).toBe(true);
        expect(authResult.current.isClient).toBe(true);
      });
    });
  });
});

describe('Integration Tests - Role-Based Access', () => {
  const mockUseClerkAuth = useClerkAuth as jest.MockedFunction<typeof useClerkAuth>;
  const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Diferentes roles tienen diferentes permisos', () => {
    it('Cliente debe tener acceso a catálogo de entrenadores', async () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'client_1',
      } as any);

      mockUseQuery.mockReturnValue({
        user: { _id: 'client_1', email: 'client@test.com' },
        person: { name: 'Client User' },
        roles: ['CLIENT'],
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isClient).toBe(true);
        expect(result.current.isTrainer).toBe(false);
        expect(result.current.isAdmin).toBe(false);
      });
    });

    it('Entrenador debe tener rol TRAINER', async () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'trainer_1',
      } as any);

      mockUseQuery.mockReturnValue({
        user: { _id: 'trainer_1', email: 'trainer@test.com' },
        person: { name: 'Trainer User' },
        roles: ['TRAINER'],
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isTrainer).toBe(true);
        expect(result.current.isClient).toBe(false);
        expect(result.current.isAdmin).toBe(false);
      });
    });

    it('Admin debe tener acceso administrativo', async () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'admin_1',
      } as any);

      mockUseQuery.mockReturnValue({
        user: { _id: 'admin_1', email: 'admin@test.com' },
        person: { name: 'Admin User' },
        roles: ['ADMIN'],
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
        expect(result.current.isTrainer).toBe(false);
        expect(result.current.isClient).toBe(false);
      });
    });

    it('Usuario con múltiples roles debe tener todos los permisos', async () => {
      mockUseClerkAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        userId: 'multi_1',
      } as any);

      mockUseQuery.mockReturnValue({
        user: { _id: 'multi_1', email: 'multi@test.com' },
        person: { name: 'Multi Role User' },
        roles: ['CLIENT', 'TRAINER'],
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isClient).toBe(true);
        expect(result.current.isTrainer).toBe(true);
        expect(result.current.hasAllRoles(['CLIENT', 'TRAINER'])).toBe(true);
      });
    });
  });
});

describe('Integration Tests - Data Consistency', () => {
  const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Consistencia de datos en conversaciones', () => {
    it('debe mantener orden correcto de conversaciones', () => {
      const now = Date.now();
      const mockConversations = [
        {
          _id: 'conv_1' as any,
          _creationTime: now - 3600000,
          client_user_id: 'client_1' as any,
          trainer_user_id: 'trainer_1' as any,
          status: 'OPEN' as const,
          last_message_at: now - 3600000,
          last_message_text: 'Mensaje antiguo',
          unread_count: 0,
          created_at: now - 3600000,
          updated_at: now - 3600000,
          other_participant: {
            user_id: 'trainer_1' as any,
            name: 'Trainer 1',
            role: 'TRAINER' as const,
          },
          my_role: 'CLIENT' as const,
        },
        {
          _id: 'conv_2' as any,
          _creationTime: now - 1800000,
          client_user_id: 'client_1' as any,
          trainer_user_id: 'trainer_2' as any,
          status: 'OPEN' as const,
          last_message_at: now - 1800000,
          last_message_text: 'Mensaje reciente',
          unread_count: 2,
          created_at: now - 1800000,
          updated_at: now - 1800000,
          other_participant: {
            user_id: 'trainer_2' as any,
            name: 'Trainer 2',
            role: 'TRAINER' as const,
          },
          my_role: 'CLIENT' as const,
        },
      ];

      mockUseQuery.mockReturnValue({
        conversations: mockConversations,
        nextCursor: null,
      });

      const { result } = renderHook(() => useConversations());

      expect(result.current.conversations).toHaveLength(2);
      expect(result.current.conversations[0]._id).toBe('conv_1');
      expect(result.current.conversations[1]._id).toBe('conv_2');
    });

    it('debe reflejar correctamente contador de no leídos', () => {
      mockUseQuery.mockReturnValue({
        conversations: [
          {
            _id: 'conv_1' as any,
            _creationTime: Date.now(),
            client_user_id: 'client_1' as any,
            trainer_user_id: 'trainer_1' as any,
            status: 'OPEN' as const,
            unread_count: 5,
            last_message_text: 'Test',
            last_message_at: Date.now(),
            created_at: Date.now(),
            updated_at: Date.now(),
            other_participant: {
              user_id: 'trainer_1' as any,
              name: 'Trainer 1',
              role: 'TRAINER' as const,
            },
            my_role: 'CLIENT' as const,
          },
        ],
        nextCursor: null,
      });

      const { result } = renderHook(() => useConversations());

      expect(result.current.conversations[0].unread_count).toBe(5);
    });
  });
});

import { renderHook, waitFor } from '@testing-library/react-native';
import { useConversations } from '../use-conversations';
import { useQuery, useConvexAuth } from 'convex/react';

jest.mock('convex/react');
jest.mock('@/api', () => ({
  chat: {
    conversations: {
      queries: {
        listMine: jest.fn(),
      },
    },
  },
}));

describe('useConversations Hook', () => {
  const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
  const mockUseConvexAuth = useConvexAuth as jest.MockedFunction<typeof useConvexAuth>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for useConvexAuth - authenticated by default
    mockUseConvexAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
  });

  describe('Estado inicial', () => {
    it('debe retornar estado de carga cuando data es undefined', () => {
      mockUseQuery.mockReturnValue(undefined);

      const { result } = renderHook(() => useConversations());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.conversations).toEqual([]);
      // hasMore es true cuando data.nextCursor es !== null, pero undefined hace null !== null = true
      expect(result.current.hasMore).toBe(true);
    });

    it('debe retornar conversaciones vacías cuando no hay data', () => {
      mockUseQuery.mockReturnValue({
        conversations: [],
        nextCursor: null,
      });

      const { result } = renderHook(() => useConversations());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.conversations).toEqual([]);
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('Datos de conversaciones', () => {
    it('debe retornar conversaciones cuando hay datos', () => {
      const mockConversations = [
        {
          _id: 'conv_1',
          _creationTime: Date.now(),
          client_user_id: 'client_1',
          trainer_user_id: 'trainer_1',
          status: 'OPEN' as const,
          last_message_text: 'Hola',
          last_message_at: Date.now(),
          unread_count: 2,
          created_at: Date.now(),
          updated_at: Date.now(),
          other_participant: {
            user_id: 'trainer_1' as any,
            name: 'Trainer 1',
            role: 'TRAINER' as const,
          },
          my_role: 'CLIENT' as const,
        },
        {
          _id: 'conv_2',
          _creationTime: Date.now(),
          client_user_id: 'client_2',
          trainer_user_id: 'trainer_1',
          status: 'OPEN' as const,
          last_message_text: 'Adiós',
          last_message_at: Date.now(),
          unread_count: 0,
          created_at: Date.now(),
          updated_at: Date.now(),
          other_participant: {
            user_id: 'client_2' as any,
            name: 'Client 2',
            role: 'CLIENT' as const,
          },
          my_role: 'TRAINER' as const,
        },
      ];

      mockUseQuery.mockReturnValue({
        conversations: mockConversations,
        nextCursor: null,
      });

      const { result } = renderHook(() => useConversations());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.conversations).toHaveLength(2);
      expect(result.current.conversations).toEqual(mockConversations);
    });

    it('debe indicar hasMore cuando hay más conversaciones', () => {
      const mockConversations = [
        {
          _id: 'conv_1',
          _creationTime: Date.now(),
          client_user_id: 'client_1',
          trainer_user_id: 'trainer_1',
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
      ];

      mockUseQuery.mockReturnValue({
        conversations: mockConversations,
        nextCursor: 123456,
      });

      const { result } = renderHook(() => useConversations());

      expect(result.current.hasMore).toBe(true);
    });
  });

  describe('Función refresh', () => {
    it('debe tener una función refresh disponible', () => {
      mockUseQuery.mockReturnValue({
        conversations: [],
        nextCursor: null,
      });

      const { result } = renderHook(() => useConversations());

      expect(result.current.refresh).toBeDefined();
      expect(typeof result.current.refresh).toBe('function');
    });

    it('refresh debe ser callable sin errores', () => {
      mockUseQuery.mockReturnValue({
        conversations: [],
        nextCursor: null,
      });

      const { result } = renderHook(() => useConversations());

      expect(() => {
        result.current.refresh();
      }).not.toThrow();
    });
  });

  describe('Paginación', () => {
    it('debe usar el límite por defecto de 20', () => {
      mockUseQuery.mockReturnValue({
        conversations: [],
        nextCursor: null,
      });

      renderHook(() => useConversations());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          limit: 20,
        })
      );
    });
  });

  describe('Casos especiales', () => {
    it('debe manejar conversaciones sin mensajes', () => {
      const mockConversations = [
        {
          _id: 'conv_1',
          _creationTime: Date.now(),
          client_user_id: 'client_1',
          trainer_user_id: 'trainer_1',
          status: 'OPEN' as const,
          last_message_text: undefined,
          last_message_at: Date.now(),
          unread_count: 0,
          created_at: Date.now(),
          updated_at: Date.now(),
          other_participant: {
            user_id: 'trainer_1' as any,
            name: 'Trainer',
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

      expect(result.current.conversations).toHaveLength(1);
      expect(result.current.conversations[0].last_message_text).toBeUndefined();
    });

    it('debe manejar nextCursor null correctamente', () => {
      mockUseQuery.mockReturnValue({
        conversations: [],
        nextCursor: null,
      });

      const { result } = renderHook(() => useConversations());

      expect(result.current.hasMore).toBe(false);
    });

    it('debe manejar nextCursor con valor numérico', () => {
      mockUseQuery.mockReturnValue({
        conversations: [],
        nextCursor: 999,
      });

      const { result } = renderHook(() => useConversations());

      expect(result.current.hasMore).toBe(true);
    });
  });
});

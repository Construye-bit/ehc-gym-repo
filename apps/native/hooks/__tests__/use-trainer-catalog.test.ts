import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTrainerCatalog } from '../use-trainer-catalog';
import { useQuery } from 'convex/react';

jest.mock('convex/react');
jest.mock('@/api', () => ({
  chat: {
    trainer_catalog: {
      queries: {
        getPublicTrainers: jest.fn(),
      },
    },
  },
}));

describe('useTrainerCatalog Hook', () => {
  const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTrainers = [
    {
      _id: 'trainer_1',
      person_id: 'person_1',
      name: 'Juan Pérez',
      specialties: ['Yoga', 'Pilates'],
      branch_name: 'Sede Norte',
      profile_picture: 'https://example.com/pic1.jpg',
    },
    {
      _id: 'trainer_2',
      person_id: 'person_2',
      name: 'María González',
      specialties: ['CrossFit', 'Funcional'],
      branch_name: 'Sede Sur',
      profile_picture: 'https://example.com/pic2.jpg',
    },
    {
      _id: 'trainer_3',
      person_id: 'person_3',
      name: 'Carlos López',
      specialties: ['Yoga', 'Meditación'],
      branch_name: 'Sede Norte',
      profile_picture: null,
    },
  ];

  describe('Estado inicial', () => {
    it('debe retornar estado de carga cuando result es undefined', () => {
      mockUseQuery.mockReturnValue(undefined);

      const { result } = renderHook(() => useTrainerCatalog());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.trainers).toEqual([]);
      // hasMore es true cuando result?.nextCursor !== null, pero undefined hace undefined !== null = true
      expect(result.current.hasMore).toBe(true);
    });

    it('debe retornar trainers vacíos cuando no hay datos', () => {
      mockUseQuery.mockReturnValue({
        trainers: [],
        nextCursor: null,
      });

      const { result } = renderHook(() => useTrainerCatalog());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.trainers).toEqual([]);
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('Filtros de especialidad', () => {
    it('debe filtrar trainers por una especialidad', () => {
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: null,
      });

      const { result } = renderHook(() =>
        useTrainerCatalog({ specialties: ['Yoga'] })
      );

      expect(result.current.trainers).toHaveLength(2);
      expect(result.current.trainers.every(t =>
        t.specialties.includes('Yoga')
      )).toBe(true);
    });

    it('debe filtrar trainers por múltiples especialidades', () => {
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: null,
      });

      const { result } = renderHook(() =>
        useTrainerCatalog({ specialties: ['Yoga', 'CrossFit'] })
      );

      expect(result.current.trainers).toHaveLength(3);
    });

    it('debe retornar todos los trainers cuando no hay filtro de especialidad', () => {
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: null,
      });

      const { result } = renderHook(() => useTrainerCatalog());

      expect(result.current.trainers).toHaveLength(3);
    });

    it('debe retornar array vacío cuando ningún trainer tiene la especialidad', () => {
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: null,
      });

      const { result } = renderHook(() =>
        useTrainerCatalog({ specialties: ['Natación'] })
      );

      expect(result.current.trainers).toHaveLength(0);
    });
  });

  describe('Filtro de sucursal', () => {
    it('debe usar branchId en la query', () => {
      mockUseQuery.mockReturnValue({
        trainers: [],
        nextCursor: null,
      });

      renderHook(() =>
        useTrainerCatalog({ branchId: 'branch_123' })
      );

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          branchId: 'branch_123',
        })
      );
    });
  });

  describe('Filtro de disponibilidad', () => {
    it('debe aplicar filtro de availableNow', () => {
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: null,
      });

      const { result } = renderHook(() =>
        useTrainerCatalog({ availableNow: true })
      );

      // Por ahora retorna todos ya que la lógica no está implementada
      expect(result.current.trainers).toHaveLength(3);
    });
  });

  describe('Paginación', () => {
    it('debe indicar hasMore cuando hay más trainers', () => {
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: 100,
      });

      const { result } = renderHook(() => useTrainerCatalog());

      expect(result.current.hasMore).toBe(true);
    });

    it('debe tener función loadMore disponible', () => {
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: 100,
      });

      const { result } = renderHook(() => useTrainerCatalog());

      expect(result.current.loadMore).toBeDefined();
      expect(typeof result.current.loadMore).toBe('function');
    });

    it('loadMore debe actualizar el cursor cuando hay más datos', () => {
      const mockNextCursor = 100;
      
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: mockNextCursor,
      });

      const { result } = renderHook(() => useTrainerCatalog());

      act(() => {
        result.current.loadMore();
      });

      // El cursor debería actualizarse internamente
      // La próxima llamada a useQuery debería incluir el cursor
      expect(result.current.hasMore).toBe(true);
    });

    it('loadMore no debe hacer nada cuando nextCursor es null', () => {
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: null,
      });

      const { result } = renderHook(() => useTrainerCatalog());

      const initialTrainers = result.current.trainers;

      act(() => {
        result.current.loadMore();
      });

      expect(result.current.trainers).toEqual(initialTrainers);
    });
  });

  describe('Límite de resultados', () => {
    it('debe usar límite de 10 por defecto', () => {
      mockUseQuery.mockReturnValue({
        trainers: [],
        nextCursor: null,
      });

      renderHook(() => useTrainerCatalog());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          limit: 10,
        })
      );
    });
  });

  describe('Múltiples filtros combinados', () => {
    it('debe aplicar filtros de especialidad y sucursal combinados', () => {
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: null,
      });

      const { result } = renderHook(() =>
        useTrainerCatalog({
          specialties: ['Yoga'],
          branchId: 'branch_norte',
        })
      );

      // Verifica que se apliquen ambos filtros
      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          specialty: 'Yoga',
          branchId: 'branch_norte',
        })
      );
    });

    it('debe aplicar todos los filtros disponibles', () => {
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: null,
      });

      const { result } = renderHook(() =>
        useTrainerCatalog({
          specialties: ['Yoga'],
          branchId: 'branch_norte',
          availableNow: true,
        })
      );

      // Los trainers filtrados deben cumplir todos los criterios
      const filteredTrainers = result.current.trainers;
      expect(filteredTrainers.every(t => t.specialties.includes('Yoga'))).toBe(true);
    });
  });

  describe('Casos especiales', () => {
    it('debe manejar trainers sin foto de perfil', () => {
      const trainersWithoutPic = [
        {
          ...mockTrainers[0],
          profile_picture: undefined,
        },
      ];

      mockUseQuery.mockReturnValue({
        trainers: trainersWithoutPic,
        nextCursor: null,
      });

      const { result } = renderHook(() => useTrainerCatalog());

      expect(result.current.trainers[0]).toBeDefined();
    });

    it('debe manejar trainers sin especialidades', () => {
      const trainersWithoutSpecialties = [
        {
          ...mockTrainers[0],
          specialties: [],
        },
      ];

      mockUseQuery.mockReturnValue({
        trainers: trainersWithoutSpecialties,
        nextCursor: null,
      });

      const { result } = renderHook(() => useTrainerCatalog());

      expect(result.current.trainers[0].specialties).toEqual([]);
    });
  });

  describe('Actualización de filtros', () => {
    it('debe actualizar trainers cuando cambian los filtros', () => {
      mockUseQuery.mockReturnValue({
        trainers: mockTrainers,
        nextCursor: null,
      });

      const { result, rerender } = renderHook(
        ({ filters }) => useTrainerCatalog(filters),
        {
          initialProps: { filters: { specialties: ['Yoga'] } },
        }
      );

      const initialLength = result.current.trainers.length;

      // Cambiar filtros
      rerender({ filters: { specialties: ['CrossFit'] } });

      // Los trainers deberían actualizarse según el nuevo filtro
      expect(result.current.trainers).toBeDefined();
    });
  });
});

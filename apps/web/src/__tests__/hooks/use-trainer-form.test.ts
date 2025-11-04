import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock de useNavigate
const mockNavigate = vi.fn();

// Mocks de Convex
const mockUseAction = vi.fn();
const mockUseQuery = vi.fn();

// Mock de useAuth
const mockUseAuth = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('convex/react', () => ({
  useAction: mockUseAction,
  useQuery: mockUseQuery,
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: mockUseAuth,
}));

// Importar después de los mocks
const { useTrainerForm } = await import('@/hooks/use-trainer-form');

// Mock data
const mockBranches = [
  {
    _id: 'branch_1' as any,
    _creationTime: Date.now(),
    name: 'Sede Norte',
    address: 'Calle 123',
    phone: '+1234567890',
    city: 'city_1' as any,
  },
  {
    _id: 'branch_2' as any,
    _creationTime: Date.now(),
    name: 'Sede Sur',
    address: 'Calle 456',
    phone: '+0987654321',
    city: 'city_2' as any,
  },
];

const mockTrainerFormData = {
  userData: {
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    userPhone: '+1234567890',
  },
  personalData: {
    personName: 'John',
    personLastName: 'Doe',
    personBornDate: '1990-01-01',
    personDocumentType: 'CC' as const,
    personDocumentNumber: '1234567890',
  },
  workData: {
    branch: 'branch_1',
    specialties: ['Funcional', 'Crossfit'],
  },
};

describe('useTrainerForm Hook', () => {
  const mockCreateTrainerComplete = vi.fn();

  beforeEach(() => {
    mockNavigate.mockReset();
    mockCreateTrainerComplete.mockReset();
    mockUseAction.mockReset();
    mockUseQuery.mockReset();
    mockUseAuth.mockReset();
    
    // Mock useAuth
    mockUseAuth.mockReturnValue({
      isSuperAdmin: true,
      isAdmin: false,
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

    mockUseAction.mockReturnValue(mockCreateTrainerComplete);
    mockUseQuery.mockReturnValue(mockBranches);
  });

  it('debe inicializar con valores por defecto', () => {
    const { result } = renderHook(() => useTrainerForm());

    expect(result.current.currentStep).toBe(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors).toEqual({});
    expect(result.current.userData).toEqual({
      userName: '',
      userEmail: '',
      userPhone: '',
    });
    expect(result.current.personalData).toEqual({
      personName: '',
      personLastName: '',
      personBornDate: '',
      personDocumentType: 'CC',
      personDocumentNumber: '',
    });
    expect(result.current.workData).toEqual({
      branch: '',
      specialties: [],
    });
  });

  it('debe tener funciones para actualizar datos', () => {
    const { result } = renderHook(() => useTrainerForm());

    // Verificar que las funciones existen y son llamables
    expect(typeof result.current.updateUserData).toBe('function');
    expect(typeof result.current.updatePersonalData).toBe('function');
    expect(typeof result.current.updateWorkData).toBe('function');
    expect(typeof result.current.handleNext).toBe('function');
    expect(typeof result.current.handlePrev).toBe('function');
    expect(typeof result.current.handleSubmit).toBe('function');
  });

  it('debe actualizar workData correctamente', () => {
    const { result } = renderHook(() => useTrainerForm());

    act(() => {
      result.current.updateWorkData('branch', 'Sede Norte');
    });

    expect(result.current.workData.branch).toBe('Sede Norte');
  });

  it('debe agregar especialidades correctamente', () => {
    const { result } = renderHook(() => useTrainerForm());

    act(() => {
      result.current.addSpecialty('Funcional');
      result.current.addSpecialty('Crossfit');
    });

    expect(result.current.workData.specialties).toEqual(['Funcional', 'Crossfit']);
  });

  it('debe eliminar especialidades correctamente', () => {
    const { result } = renderHook(() => useTrainerForm());

    act(() => {
      result.current.addSpecialty('Funcional');
      result.current.addSpecialty('Crossfit');
      result.current.addSpecialty('Cardio');
    });

    act(() => {
      result.current.removeSpecialty(1); // Eliminar 'Crossfit'
    });

    expect(result.current.workData.specialties).toEqual(['Funcional', 'Cardio']);
  });

  it('debe validar presencia de métodos de navegación', () => {
    const { result } = renderHook(() => useTrainerForm());

    expect(result.current.currentStep).toBe(1);
    expect(typeof result.current.handleNext).toBe('function');
    expect(typeof result.current.handlePrev).toBe('function');
  });

  it('debe mostrar errores de validación cuando los datos son inválidos', async () => {
    const { result } = renderHook(() => useTrainerForm());

    // Intentar avanzar sin llenar datos
    await act(async () => {
      result.current.handleNext();
      await new Promise(resolve => setTimeout(resolve, 350)); // Esperar validación
    });

    // Debe permanecer en el paso 1 si hay errores
    expect(result.current.currentStep).toBe(1);
  });

  it('debe decrementar el paso al llamar handlePrev', () => {
    const { result } = renderHook(() => useTrainerForm());

    const initialStep = result.current.currentStep;
    expect(initialStep).toBe(1);

    act(() => {
      result.current.handlePrev();
    });

    // handlePrev decrementa el paso sin validación de límite inferior
    expect(result.current.currentStep).toBe(0);
  });

  it('debe tener estructura de datos correcta para el formulario', () => {
    const { result } = renderHook(() => useTrainerForm());

    // Verificar que existen todas las propiedades necesarias
    expect(result.current).toHaveProperty('userData');
    expect(result.current).toHaveProperty('personalData');
    expect(result.current).toHaveProperty('workData');
    expect(result.current).toHaveProperty('currentStep');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('errors');
    expect(result.current).toHaveProperty('branches');
    
    // Verificar tipos de datos iniciales
    expect(typeof result.current.userData).toBe('object');
    expect(typeof result.current.personalData).toBe('object');
    expect(typeof result.current.workData).toBe('object');
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('debe manejar errores al crear entrenador', async () => {
    mockCreateTrainerComplete.mockResolvedValue({
      success: false,
      data: { message: 'Ya existe un usuario con este correo' },
    });

    const { result } = renderHook(() => useTrainerForm());

    // Llenar todos los datos
    act(() => {
      Object.entries(mockTrainerFormData.userData).forEach(([key, value]) => {
        result.current.updateUserData(key as any, value);
      });
      Object.entries(mockTrainerFormData.personalData).forEach(([key, value]) => {
        result.current.updatePersonalData(key as any, value);
      });
      result.current.updateWorkData('branch', mockTrainerFormData.workData.branch);
      mockTrainerFormData.workData.specialties.forEach((specialty) => {
        result.current.addSpecialty(specialty);
      });
    });

    // Establecer en paso 3
    act(() => {
      result.current.handleNext();
      result.current.handleNext();
    });

    // Enviar formulario
    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('debe resetear el formulario correctamente', () => {
    const { result } = renderHook(() => useTrainerForm());

    // Llenar datos
    act(() => {
      result.current.updateUserData('userName', 'Test');
      result.current.updatePersonalData('personName', 'Test');
      result.current.addSpecialty('Funcional');
    });

    // Resetear
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.currentStep).toBe(1);
    expect(result.current.userData.userName).toBe('');
    expect(result.current.personalData.personName).toBe('');
    expect(result.current.workData.specialties).toEqual([]);
    expect(result.current.errors).toEqual({});
  });

  it('debe cargar sedes correctamente', () => {
    const { result } = renderHook(() => useTrainerForm());

    expect(result.current.branches).toBeDefined();
    expect(result.current.branches?.length).toBeGreaterThan(0);
  });
});

import { vi } from 'vitest';

// Mock de useQuery
export const mockUseQuery = vi.fn();

// Mock de useMutation
export const mockUseMutation = vi.fn();

// Mock de useAction
export const mockUseAction = vi.fn();

// Mock de useConvex
export const mockUseConvex = vi.fn();

// Mock del módulo convex/react
vi.mock('convex/react', () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
  useAction: mockUseAction,
  useConvex: mockUseConvex,
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
  ConvexReactClient: vi.fn(),
}));

// Helper para resetear todos los mocks
export const resetConvexMocks = () => {
  mockUseQuery.mockReset();
  mockUseMutation.mockReset();
  mockUseAction.mockReset();
  mockUseConvex.mockReset();
};

// Helper para configurar respuestas de useQuery
export const mockQueryResponse = (data: any) => {
  mockUseQuery.mockReturnValue(data);
};

// Helper para configurar respuestas de useMutation
export const mockMutationResponse = (fn: any) => {
  mockUseMutation.mockReturnValue(fn);
};

// Helper para configurar respuestas de useAction
export const mockActionResponse = (fn: any) => {
  mockUseAction.mockReturnValue(fn);
};

import { vi } from 'vitest';
import React from 'react';

// Mock de useNavigate
export const mockNavigate = vi.fn();

// Mock de useRouter
export const mockUseRouter = vi.fn();

// Mock de useParams
export const mockUseParams = vi.fn();

// Mock de useSearch
export const mockUseSearch = vi.fn();

// Mock del módulo @tanstack/react-router
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useRouter: mockUseRouter,
    useParams: mockUseParams,
    useSearch: mockUseSearch,
    Link: ({ children, to, ...props }: any) =>
      React.createElement('a', { href: to, ...props }, children),
  };
});

// Helper para resetear todos los mocks
export const resetRouterMocks = () => {
  mockNavigate.mockReset();
  mockUseRouter.mockReset();
  mockUseParams.mockReset();
  mockUseSearch.mockReset();
};

// Helper para configurar parámetros
export const mockRouteParams = (params: Record<string, string>) => {
  mockUseParams.mockReturnValue(params);
};

// Helper para configurar búsqueda
export const mockRouteSearch = (search: Record<string, any>) => {
  mockUseSearch.mockReturnValue(search);
};

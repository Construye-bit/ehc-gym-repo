import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';
import { ThemeProvider } from '@/components/theme-provider';

// Mock Convex client
export const mockConvexClient = new ConvexReactClient('https://test.convex.cloud');

// Mock ClerkProvider simplificado
const MockClerkProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

interface AllTheProvidersProps {
  children: ReactNode;
  initialPath?: string;
}

export function AllTheProviders({ children, initialPath = '/' }: AllTheProvidersProps) {
  const memoryHistory = createMemoryHistory({
    initialEntries: [initialPath],
  });

  const router = createRouter({
    routeTree,
    history: memoryHistory,
    context: {},
  });

  return (
    <MockClerkProvider>
      <ConvexProvider client={mockConvexClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
          {children}
        </ThemeProvider>
      </ConvexProvider>
    </MockClerkProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialPath?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { initialPath = '/', ...options }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialPath={initialPath}>{children}</AllTheProviders>
    ),
    ...options,
  });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };

import { vi } from 'vitest';

// Mock User
export const mockClerkUser = {
  id: 'user_mock_123',
  firstName: 'Test',
  lastName: 'User',
  emailAddresses: [
    {
      emailAddress: 'test@example.com',
      id: 'email_1',
    },
  ],
  phoneNumbers: [
    {
      phoneNumber: '+1234567890',
      id: 'phone_1',
    },
  ],
};

// Mock de useUser
export const mockUseUser = vi.fn();

// Mock de useSignIn
export const mockUseSignIn = vi.fn();

// Mock de useSignUp
export const mockUseSignUp = vi.fn();

// Mock de useAuth (Clerk)
export const mockUseClerkAuth = vi.fn();

// Mock de SignIn component
export const mockSignIn = vi.fn();

// Mock de SignUp component
export const mockSignUp = vi.fn();

// Mock del módulo @clerk/clerk-react
vi.mock('@clerk/clerk-react', () => ({
  useUser: mockUseUser,
  useSignIn: mockUseSignIn,
  useSignUp: mockUseSignUp,
  useAuth: mockUseClerkAuth,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignIn: mockSignIn,
  SignUp: mockSignUp,
}));

// Helper para resetear todos los mocks
export const resetClerkMocks = () => {
  mockUseUser.mockReset();
  mockUseSignIn.mockReset();
  mockUseSignUp.mockReset();
  mockUseClerkAuth.mockReset();
  mockSignIn.mockReset();
  mockSignUp.mockReset();
};

// Helper para simular usuario autenticado
export const mockAuthenticatedUser = () => {
  mockUseUser.mockReturnValue({
    isSignedIn: true,
    isLoaded: true,
    user: mockClerkUser,
  });
};

// Helper para simular usuario no autenticado
export const mockUnauthenticatedUser = () => {
  mockUseUser.mockReturnValue({
    isSignedIn: false,
    isLoaded: true,
    user: null,
  });
};

// Helper para simular carga
export const mockLoadingUser = () => {
  mockUseUser.mockReturnValue({
    isSignedIn: false,
    isLoaded: false,
    user: null,
  });
};

# 🧪 Guía de Pruebas - Frontend Web (EHC GYM)

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura de Pruebas](#estructura-de-pruebas)
- [Ejecutar Pruebas](#ejecutar-pruebas)
- [Cobertura de Pruebas](#cobertura-de-pruebas)
- [Guía de Escritura de Pruebas](#guía-de-escritura-de-pruebas)
- [Mocks y Utilidades](#mocks-y-utilidades)

## 📖 Descripción General

Este proyecto cuenta con un conjunto completo de pruebas automatizadas para garantizar la calidad y el correcto funcionamiento del frontend web de EHC GYM. Las pruebas cubren:

- ✅ Hooks personalizados
- ✅ Componentes de UI
- ✅ Componentes de autenticación
- ✅ Componentes de administración
- ✅ Validaciones de formularios
- ✅ Flujos de integración
- ✅ Rutas y navegación

## 🛠️ Tecnologías Utilizadas

- **Vitest**: Framework de testing rápido y moderno
- **Testing Library**: Utilidades para testing de componentes React
- **Happy DOM**: Entorno DOM ligero para pruebas
- **User Event**: Simulación de interacciones de usuario

## 📁 Estructura de Pruebas

```
src/__tests__/
├── setup.ts                          # Configuración global de testing
├── mocks/                            # Mocks de dependencias externas
│   ├── clerk.ts                      # Mock de Clerk (autenticación)
│   ├── convex.ts                     # Mock de Convex (backend)
│   └── router.ts                     # Mock de TanStack Router
├── utils/                            # Utilidades de testing
│   ├── test-utils.tsx                # Helpers para renderizar con providers
│   └── mockData.ts                   # Datos de prueba reutilizables
├── hooks/                            # Pruebas de hooks personalizados
│   ├── use-auth.test.ts
│   ├── use-admin-auth.test.ts
│   └── use-trainer-form.test.ts
├── components/                       # Pruebas de componentes
│   ├── auth/
│   │   └── login-form.test.tsx
│   ├── shared/
│   │   └── route-guard.test.tsx
│   └── ui/
│       └── button.test.tsx
├── validations/                      # Pruebas de esquemas de validación
│   └── trainers.test.ts
└── integration/                      # Pruebas de integración
    └── login-flow.test.tsx
```

## 🚀 Ejecutar Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas en modo watch (desarrollo)
```bash
npm test
```

### Ejecutar pruebas una sola vez
```bash
npm run test:run
```

### Ejecutar pruebas con UI interactiva
```bash
npm run test:ui
```

### Generar reporte de cobertura
```bash
npm run test:coverage
```

## 📊 Cobertura de Pruebas

### Hooks Personalizados
- ✅ `useAuth` - Autenticación y autorización de usuarios
- ✅ `useAdminAuth` - Login/logout de administradores
- ✅ `useTrainerForm` - Formulario de creación de entrenadores
- ⏳ `useClientForm` - Formulario de creación de clientes
- ⏳ `useSedeForm` - Formulario de creación de sedes
- ⏳ `useAdministratorForm` - Formulario de creación de administradores

### Componentes de Autenticación
- ✅ `AdminLoginForm` - Formulario de login
- ✅ `RouteGuard` - Protección de rutas por roles
- ⏳ `ForgotPasswordLink` - Enlace de recuperación de contraseña

### Componentes de UI
- ✅ `Button` - Botón reutilizable con variantes
- ⏳ `Input` - Campo de entrada
- ⏳ `Card` - Tarjeta de contenido
- ⏳ `Dialog` - Modal de diálogo
- ⏳ `Select` - Selector dropdown

### Validaciones
- ✅ Esquemas de validación de Trainers
- ⏳ Esquemas de validación de Clients
- ⏳ Esquemas de validación de Administrators
- ⏳ Esquemas de validación de Sedes

### Flujos de Integración
- ✅ Flujo completo de login
- ⏳ Flujo de creación de entrenador
- ⏳ Flujo de creación de cliente
- ⏳ Flujo de creación de sede

## 📝 Guía de Escritura de Pruebas

### Estructura de un Test

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Nombre del Componente/Hook', () => {
  beforeEach(() => {
    // Resetear mocks antes de cada prueba
  });

  it('debe hacer algo específico', () => {
    // Arrange: Preparar
    // Act: Actuar
    // Assert: Verificar
  });
});
```

### Probar un Hook

```typescript
import { renderHook, act } from '@testing-library/react';

it('debe actualizar el estado correctamente', () => {
  const { result } = renderHook(() => useMyHook());

  act(() => {
    result.current.updateValue('nuevo valor');
  });

  expect(result.current.value).toBe('nuevo valor');
});
```

### Probar un Componente

```typescript
it('debe renderizar correctamente', () => {
  render(<MyComponent title="Test" />);
  
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Probar Interacciones de Usuario

```typescript
it('debe llamar onClick al hacer clic', async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();
  
  render(<Button onClick={handleClick}>Click</Button>);
  
  await user.click(screen.getByRole('button'));
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Probar Formularios

```typescript
it('debe validar el formulario correctamente', async () => {
  const user = userEvent.setup();
  
  render(<MyForm />);
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### Probar Validaciones Zod

```typescript
it('debe validar datos correctos', () => {
  const validData = { /* ... */ };
  
  expect(() => schema.parse(validData)).not.toThrow();
});

it('debe rechazar datos inválidos', () => {
  const invalidData = { /* ... */ };
  
  expect(() => schema.parse(invalidData)).toThrow(z.ZodError);
});
```

## 🎭 Mocks y Utilidades

### Mocks Disponibles

#### Clerk (Autenticación)
```typescript
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
  mockLoadingUser,
} from '@/__tests__/mocks/clerk';

// Usar en tus pruebas
mockAuthenticatedUser();
```

#### Convex (Backend)
```typescript
import {
  mockQueryResponse,
  mockActionResponse,
  mockMutationResponse,
} from '@/__tests__/mocks/convex';

// Simular respuesta de query
mockQueryResponse({ data: 'example' });
```

#### Router
```typescript
import { mockNavigate, mockRouteParams } from '@/__tests__/mocks/router';

// Verificar navegación
expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin' });
```

### Datos de Prueba

```typescript
import {
  mockUser,
  mockTrainer,
  mockBranches,
  mockTrainerFormData,
} from '@/__tests__/utils/mockData';

// Usar en tus pruebas
const trainer = mockTrainer;
```

### Renderizar con Providers

```typescript
import { render } from '@/__tests__/utils/test-utils';

// Renderiza con todos los providers necesarios
render(<MyComponent />);
```

## 🎯 Mejores Prácticas

1. **Nomenclatura**: Usa nombres descriptivos para las pruebas
   ```typescript
   // ✅ Bueno
   it('debe mostrar error cuando el email es inválido', () => {});
   
   // ❌ Malo
   it('test1', () => {});
   ```

2. **Aislamiento**: Cada prueba debe ser independiente
   ```typescript
   beforeEach(() => {
     // Resetear estado antes de cada prueba
     resetMocks();
   });
   ```

3. **Queries de Testing Library**: Usa las queries correctas
   ```typescript
   // ✅ Preferir getByRole
   screen.getByRole('button', { name: /submit/i })
   
   // ⚠️ Usar con moderación
   screen.getByTestId('submit-button')
   ```

4. **Esperar Cambios Asíncronos**: Usa waitFor
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

5. **Mocks Específicos**: Mock solo lo necesario
   ```typescript
   // ✅ Bueno
   vi.mock('@/hooks/use-auth');
   
   // ❌ Malo - mock global innecesario
   vi.mock('react');
   ```

## 📈 Próximos Pasos

- [ ] Completar pruebas de componentes de administración
- [ ] Agregar pruebas E2E con Playwright
- [ ] Aumentar cobertura de código al 90%+
- [ ] Agregar pruebas de accesibilidad
- [ ] Agregar pruebas de rendimiento

## 🤝 Contribuir

Al agregar nuevas funcionalidades, asegúrate de:

1. Escribir pruebas para el nuevo código
2. Mantener la cobertura de código > 80%
3. Seguir las convenciones de nomenclatura
4. Documentar casos de prueba complejos
5. Ejecutar todas las pruebas antes de hacer commit

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [User Event API](https://testing-library.com/docs/user-event/intro)

---

**Última actualización**: 4 de noviembre de 2025

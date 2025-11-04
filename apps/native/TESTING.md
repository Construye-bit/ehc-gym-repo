# Suite de Pruebas - EHC Gym Mobile App

## 📋 Descripción General

Esta suite de pruebas proporciona cobertura completa para la aplicación móvil de EHC Gym, incluyendo tests unitarios, de integración y end-to-end para todos los componentes, hooks, validaciones y flujos de usuario.

## 🎯 Cobertura de Pruebas

### 1. **Tests de Hooks Personalizados** (`hooks/__tests__/`)
- ✅ `use-auth.test.ts` - Hook de autenticación y manejo de roles
- ✅ `use-conversations.test.ts` - Gestión de conversaciones de chat
- ✅ `use-trainer-catalog.test.ts` - Catálogo y filtrado de entrenadores

### 2. **Tests de Componentes UI** (`components/ui/__tests__/`)
- ✅ `button.test.tsx` - Componente Button con todas sus variantes
- ✅ `input.test.tsx` - Componente Input y validaciones

### 3. **Tests de Componentes de Chat** (`components/chat/__tests__/`)
- ✅ `MessageBubble.test.tsx` - Burbujas de mensaje con estados optimistas

### 4. **Tests de Componentes de Feed** (`components/feed/__tests__/`)
- ✅ `PostCard.test.tsx` - Tarjetas de posts con likes y menús

### 5. **Tests de Validación** (`lib/validations/__tests__/`)
- ✅ `auth.test.ts` - Schemas de Zod para autenticación
  - Validación de email
  - Validación de contraseñas fuertes
  - Códigos de verificación

### 6. **Tests de Pantallas** (`app/__tests__/`)
- ✅ `sign-in.test.tsx` - Pantalla de inicio de sesión
  - Autenticación biométrica
  - Manejo de errores
  - Validación de formularios

### 7. **Tests de Integración** (`__tests__/integration/`)
- ✅ `chat-flow.test.ts` - Flujos completos de chat
- ✅ `navigation.test.ts` - Navegación y rutas protegidas

## 🚀 Instalación

Las dependencias ya están configuradas en `package.json`. Para instalarlas:

```bash
cd apps/native
npm install
```

### Dependencias de Testing

```json
{
  "@testing-library/jest-native": "^5.4.3",
  "@testing-library/react-native": "^12.4.3",
  "@types/jest": "^29.5.11",
  "jest": "^29.7.0",
  "jest-expo": "^52.0.4",
  "react-test-renderer": "19.1.0"
}
```

## 🧪 Comandos de Testing

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

### Ejecutar tests con cobertura
```bash
npm run test:coverage
```

### Ejecutar un archivo de test específico
```bash
npm test -- hooks/__tests__/use-auth.test.ts
```

### Ejecutar tests que coincidan con un patrón
```bash
npm test -- --testNamePattern="debe renderizar"
```

## 📁 Estructura de Archivos

```
apps/native/
├── __tests__/
│   └── integration/
│       ├── chat-flow.test.ts
│       └── navigation.test.ts
├── __mocks__/
│   └── styleMock.js
├── app/
│   └── __tests__/
│       └── sign-in.test.tsx
├── components/
│   ├── ui/__tests__/
│   │   ├── button.test.tsx
│   │   └── input.test.tsx
│   ├── chat/__tests__/
│   │   └── MessageBubble.test.tsx
│   └── feed/__tests__/
│       └── PostCard.test.tsx
├── hooks/
│   └── __tests__/
│       ├── use-auth.test.ts
│       ├── use-conversations.test.ts
│       └── use-trainer-catalog.test.ts
├── lib/
│   └── validations/__tests__/
│       └── auth.test.ts
├── jest.config.js
└── jest.setup.js
```

## 🔧 Configuración

### jest.config.js
Configuración principal de Jest con:
- Preset `jest-expo`
- Transformación de módulos de node_modules
- Mapeo de alias `@/`
- Exclusiones de cobertura

### jest.setup.js
Configuración de mocks globales para:
- AsyncStorage
- Expo modules (SecureStore, LocalAuthentication, Router)
- Clerk (autenticación)
- Convex (backend)
- React Query
- Reanimated

## 📊 Casos de Prueba Principales

### Autenticación
- ✅ Login con email/password
- ✅ Login biométrico (Face ID / Touch ID)
- ✅ Validación de formularios
- ✅ Manejo de errores de autenticación
- ✅ Redirección basada en estado de autenticación
- ✅ Verificación de roles (CLIENT, TRAINER, ADMIN)

### Chat
- ✅ Carga de conversaciones
- ✅ Mensajes propios vs ajenos
- ✅ Estados optimistas (SENDING, ERROR)
- ✅ Indicadores de lectura
- ✅ Reintentos de envío
- ✅ Formato de timestamps

### Feed
- ✅ Renderizado de posts
- ✅ Sistema de likes
- ✅ Edición y eliminación de posts propios
- ✅ Avatares y imágenes
- ✅ Formato de tiempo relativo

### Navegación
- ✅ Rutas protegidas
- ✅ Navegación basada en roles
- ✅ Redirecciones condicionales
- ✅ Deep linking
- ✅ Tab navigation

### Validación
- ✅ Emails válidos/inválidos
- ✅ Contraseñas fuertes (mayúsculas, minúsculas, números, especiales)
- ✅ Códigos de verificación de 6 dígitos
- ✅ Mensajes de error personalizados

## 🎨 Patrones de Testing

### 1. Arrange-Act-Assert (AAA)
```typescript
it('debe hacer algo', () => {
  // Arrange: preparar datos y mocks
  const mockData = { ... };
  
  // Act: ejecutar la acción
  const result = someFunction(mockData);
  
  // Assert: verificar el resultado
  expect(result).toBe(expected);
});
```

### 2. Testing de Hooks
```typescript
const { result } = renderHook(() => useAuth());

await waitFor(() => {
  expect(result.current.isAuthenticated).toBe(true);
});
```

### 3. Testing de Componentes
```typescript
const { getByText, getByPlaceholderText } = render(<Component />);

fireEvent.press(getByText('Button'));

expect(getByText('Result')).toBeTruthy();
```

### 4. Mocking de Funciones
```typescript
const mockOnPress = jest.fn();

fireEvent.press(button);

expect(mockOnPress).toHaveBeenCalledTimes(1);
expect(mockOnPress).toHaveBeenCalledWith(expectedArg);
```

## 🐛 Debugging de Tests

### Ver output detallado
```bash
npm test -- --verbose
```

### Ejecutar solo tests que fallaron
```bash
npm test -- --onlyFailures
```

### Ver información de cobertura por archivo
```bash
npm run test:coverage -- --verbose
```

### Debugging con VS Code
Agregar a `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## 📈 Métricas de Cobertura

Los tests están diseñados para alcanzar:
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

Ver reporte de cobertura:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## ✅ Best Practices

1. **Nombres descriptivos**: Los tests describen claramente qué están probando
2. **Un concepto por test**: Cada test valida un único comportamiento
3. **Tests independientes**: No dependen del orden de ejecución
4. **Mocks limpios**: Se resetean en `beforeEach`
5. **Asserts específicos**: Validaciones precisas, no genéricas
6. **Coverage completo**: Casos felices y edge cases

## 🔄 CI/CD Integration

Para integrar en tu pipeline de CI/CD:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

## 🆘 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
rm -rf node_modules
npm install
```

### Tests muy lentos
```bash
npm test -- --maxWorkers=4
```

### Problemas con caché
```bash
npm test -- --clearCache
```

### Errores de TypeScript en tests
Verificar que `@types/jest` esté instalado:
```bash
npm install --save-dev @types/jest
```

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)

## 🤝 Contribuir

Al agregar nuevas funcionalidades:

1. Escribir tests ANTES del código (TDD)
2. Mantener cobertura >80%
3. Seguir patrones existentes
4. Documentar casos especiales
5. Ejecutar todos los tests antes de commit

## 📝 Notas

- Los tests usan mocks para Clerk, Convex y Expo modules
- No se requiere un dispositivo/emulador para ejecutar los tests
- Los tests de componentes usan React Native Testing Library
- Los tests de hooks usan renderHook de Testing Library
- La configuración soporta TypeScript out of the box

---

**Última actualización**: Noviembre 2024
**Mantenido por**: Equipo EHC Gym

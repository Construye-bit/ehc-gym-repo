# 🧪 Guía de Ejemplos - Escribir Nuevos Tests

## 📚 Tabla de Contenidos

1. [Tests de Hooks](#tests-de-hooks)
2. [Tests de Componentes](#tests-de-componentes)
3. [Tests de Pantallas](#tests-de-pantallas)
4. [Tests de Validación](#tests-de-validación)
5. [Tests de Integración](#tests-de-integración)
6. [Tips y Mejores Prácticas](#tips-y-mejores-prácticas)

---

## Tests de Hooks

### Ejemplo: Hook Personalizado Simple

```typescript
// hooks/use-example.ts
import { useState, useCallback } from 'react';

export function useExample(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);

  return { count, increment, decrement };
}
```

```typescript
// hooks/__tests__/use-example.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useExample } from '../use-example';

describe('useExample Hook', () => {
  it('debe inicializar con valor por defecto', () => {
    const { result } = renderHook(() => useExample());
    
    expect(result.current.count).toBe(0);
  });

  it('debe inicializar con valor personalizado', () => {
    const { result } = renderHook(() => useExample(10));
    
    expect(result.current.count).toBe(10);
  });

  it('debe incrementar el contador', () => {
    const { result } = renderHook(() => useExample(5));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(6);
  });

  it('debe decrementar el contador', () => {
    const { result } = renderHook(() => useExample(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  it('debe manejar múltiples incrementos', () => {
    const { result } = renderHook(() => useExample(0));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.increment();
    });
    
    expect(result.current.count).toBe(3);
  });
});
```

### Ejemplo: Hook con API Calls

```typescript
// hooks/use-data-fetcher.ts
import { useState, useEffect } from 'react';

export function useDataFetcher<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}
```

```typescript
// hooks/__tests__/use-data-fetcher.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useDataFetcher } from '../use-data-fetcher';

// Mock global fetch
global.fetch = jest.fn();

describe('useDataFetcher Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe iniciar con loading true', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ data: 'test' })
    });

    const { result } = renderHook(() => useDataFetcher('/api/test'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('debe cargar datos exitosamente', async () => {
    const mockData = { id: 1, name: 'Test' };
    
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => mockData
    });

    const { result } = renderHook(() => useDataFetcher('/api/test'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('debe manejar errores correctamente', async () => {
    const mockError = new Error('Network error');
    
    (global.fetch as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useDataFetcher('/api/test'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });
});
```

---

## Tests de Componentes

### Ejemplo: Componente Simple

```typescript
// components/Counter.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CounterProps {
  initialValue?: number;
  onCountChange?: (count: number) => void;
}

export const Counter: React.FC<CounterProps> = ({ 
  initialValue = 0, 
  onCountChange 
}) => {
  const [count, setCount] = React.useState(initialValue);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    onCountChange?.(newCount);
  };

  const decrement = () => {
    const newCount = count - 1;
    setCount(newCount);
    onCountChange?.(newCount);
  };

  return (
    <View testID="counter-container">
      <Text testID="counter-value">{count}</Text>
      <TouchableOpacity testID="increment-btn" onPress={increment}>
        <Text>+</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="decrement-btn" onPress={decrement}>
        <Text>-</Text>
      </TouchableOpacity>
    </View>
  );
};
```

```typescript
// components/__tests__/Counter.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Counter } from '../Counter';

describe('Counter Component', () => {
  it('debe renderizar con valor inicial por defecto', () => {
    const { getByTestId } = render(<Counter />);
    
    expect(getByTestId('counter-value')).toHaveTextContent('0');
  });

  it('debe renderizar con valor inicial personalizado', () => {
    const { getByTestId } = render(<Counter initialValue={5} />);
    
    expect(getByTestId('counter-value')).toHaveTextContent('5');
  });

  it('debe incrementar al presionar botón +', () => {
    const { getByTestId } = render(<Counter />);
    
    fireEvent.press(getByTestId('increment-btn'));
    
    expect(getByTestId('counter-value')).toHaveTextContent('1');
  });

  it('debe decrementar al presionar botón -', () => {
    const { getByTestId } = render(<Counter initialValue={5} />);
    
    fireEvent.press(getByTestId('decrement-btn'));
    
    expect(getByTestId('counter-value')).toHaveTextContent('4');
  });

  it('debe llamar onCountChange cuando cambia el valor', () => {
    const onCountChange = jest.fn();
    const { getByTestId } = render(
      <Counter onCountChange={onCountChange} />
    );
    
    fireEvent.press(getByTestId('increment-btn'));
    
    expect(onCountChange).toHaveBeenCalledWith(1);
    expect(onCountChange).toHaveBeenCalledTimes(1);
  });

  it('debe manejar múltiples clics', () => {
    const { getByTestId } = render(<Counter />);
    
    fireEvent.press(getByTestId('increment-btn'));
    fireEvent.press(getByTestId('increment-btn'));
    fireEvent.press(getByTestId('increment-btn'));
    
    expect(getByTestId('counter-value')).toHaveTextContent('3');
  });
});
```

### Ejemplo: Componente con Estado Complejo

```typescript
// components/TaskList.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTask = () => {
    if (inputValue.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now().toString(), text: inputValue, completed: false }
      ]);
      setInputValue('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <View testID="task-list-container">
      <TextInput
        testID="task-input"
        value={inputValue}
        onChangeText={setInputValue}
        placeholder="Nueva tarea..."
      />
      <TouchableOpacity testID="add-button" onPress={addTask}>
        <Text>Agregar</Text>
      </TouchableOpacity>
      
      <FlatList
        testID="tasks-list"
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View testID={`task-${item.id}`}>
            <TouchableOpacity 
              testID={`toggle-${item.id}`}
              onPress={() => toggleTask(item.id)}
            >
              <Text>{item.completed ? '✓' : '○'} {item.text}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID={`delete-${item.id}`}
              onPress={() => deleteTask(item.id)}
            >
              <Text>×</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};
```

```typescript
// components/__tests__/TaskList.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaskList } from '../TaskList';

describe('TaskList Component', () => {
  it('debe renderizar correctamente', () => {
    const { getByTestId } = render(<TaskList />);
    
    expect(getByTestId('task-list-container')).toBeTruthy();
    expect(getByTestId('task-input')).toBeTruthy();
    expect(getByTestId('add-button')).toBeTruthy();
  });

  it('debe agregar una nueva tarea', () => {
    const { getByTestId, queryByText } = render(<TaskList />);
    
    const input = getByTestId('task-input');
    const addButton = getByTestId('add-button');
    
    fireEvent.changeText(input, 'Comprar leche');
    fireEvent.press(addButton);
    
    expect(queryByText(/Comprar leche/)).toBeTruthy();
  });

  it('debe limpiar el input después de agregar tarea', () => {
    const { getByTestId } = render(<TaskList />);
    
    const input = getByTestId('task-input');
    const addButton = getByTestId('add-button');
    
    fireEvent.changeText(input, 'Nueva tarea');
    fireEvent.press(addButton);
    
    expect(input.props.value).toBe('');
  });

  it('no debe agregar tarea vacía', () => {
    const { getByTestId, queryByText } = render(<TaskList />);
    
    const input = getByTestId('task-input');
    const addButton = getByTestId('add-button');
    
    fireEvent.changeText(input, '   ');
    fireEvent.press(addButton);
    
    // No debería haber tareas visibles
    expect(queryByText(/○/)).toBeNull();
  });

  it('debe marcar tarea como completada', () => {
    const { getByTestId, queryByText } = render(<TaskList />);
    
    // Agregar tarea
    fireEvent.changeText(getByTestId('task-input'), 'Test task');
    fireEvent.press(getByTestId('add-button'));
    
    // Obtener el ID de la tarea (simulado)
    const taskElement = queryByText(/Test task/);
    expect(taskElement).toBeTruthy();
    
    // Verificar que inicialmente no está completada
    expect(queryByText(/○ Test task/)).toBeTruthy();
  });

  it('debe agregar múltiples tareas', () => {
    const { getByTestId, queryByText } = render(<TaskList />);
    
    const tasks = ['Tarea 1', 'Tarea 2', 'Tarea 3'];
    
    tasks.forEach(task => {
      fireEvent.changeText(getByTestId('task-input'), task);
      fireEvent.press(getByTestId('add-button'));
    });
    
    tasks.forEach(task => {
      expect(queryByText(new RegExp(task))).toBeTruthy();
    });
  });
});
```

---

## Tests de Pantallas

### Ejemplo: Pantalla con Formulario

```typescript
// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      // API call aquí
      router.replace('/(home)');
    } catch (err) {
      setError('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View testID="register-screen">
      <TextInput
        testID="email-input"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        testID="password-input"
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        testID="confirm-password-input"
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      {error ? (
        <Text testID="error-message">{error}</Text>
      ) : null}
      
      <TouchableOpacity
        testID="register-button"
        onPress={handleRegister}
        disabled={loading}
      >
        <Text>{loading ? 'Cargando...' : 'Registrarse'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

```typescript
// app/__tests__/register.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../(auth)/register';
import { useRouter } from 'expo-router';

jest.mock('expo-router');

describe('RegisterScreen', () => {
  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('debe renderizar todos los campos', () => {
    const { getByTestId } = render(<RegisterScreen />);
    
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('confirm-password-input')).toBeTruthy();
    expect(getByTestId('register-button')).toBeTruthy();
  });

  it('debe mostrar error cuando los campos están vacíos', async () => {
    const { getByTestId } = render(<RegisterScreen />);
    
    fireEvent.press(getByTestId('register-button'));
    
    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent(
        'Todos los campos son requeridos'
      );
    });
  });

  it('debe mostrar error cuando las contraseñas no coinciden', async () => {
    const { getByTestId } = render(<RegisterScreen />);
    
    fireEvent.changeText(getByTestId('email-input'), 'test@test.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'password456');
    fireEvent.press(getByTestId('register-button'));
    
    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent(
        'Las contraseñas no coinciden'
      );
    });
  });

  it('debe actualizar los valores de los inputs', () => {
    const { getByTestId } = render(<RegisterScreen />);
    
    fireEvent.changeText(getByTestId('email-input'), 'test@test.com');
    fireEvent.changeText(getByTestId('password-input'), 'password');
    
    expect(getByTestId('email-input').props.value).toBe('test@test.com');
    expect(getByTestId('password-input').props.value).toBe('password');
  });

  it('debe deshabilitar el botón durante la carga', async () => {
    const { getByTestId } = render(<RegisterScreen />);
    
    fireEvent.changeText(getByTestId('email-input'), 'test@test.com');
    fireEvent.changeText(getByTestId('password-input'), 'Password123!');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'Password123!');
    
    fireEvent.press(getByTestId('register-button'));
    
    await waitFor(() => {
      expect(getByTestId('register-button').props.disabled).toBe(true);
    });
  });
});
```

---

## Tests de Validación

### Ejemplo: Schema de Validación Complejo

```typescript
// lib/validations/profile.ts
import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo'),
  
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido es demasiado largo'),
  
  age: z
    .number()
    .min(18, 'Debes ser mayor de 18 años')
    .max(120, 'Edad inválida'),
  
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido'),
  
  bio: z
    .string()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
```

```typescript
// lib/validations/__tests__/profile.test.ts
import { profileSchema } from '../profile';
import { ZodError } from 'zod';

describe('Profile Validation Schema', () => {
  describe('firstName validation', () => {
    it('debe aceptar nombre válido', () => {
      const validData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        age: 25,
        phone: '+573001234567',
      };
      
      expect(() => profileSchema.parse(validData)).not.toThrow();
    });

    it('debe rechazar nombre muy corto', () => {
      const invalidData = {
        firstName: 'J',
        lastName: 'Pérez',
        age: 25,
        phone: '+573001234567',
      };
      
      expect(() => profileSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('debe rechazar nombre muy largo', () => {
      const invalidData = {
        firstName: 'A'.repeat(51),
        lastName: 'Pérez',
        age: 25,
        phone: '+573001234567',
      };
      
      expect(() => profileSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('age validation', () => {
    it('debe aceptar edad válida', () => {
      const validData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        age: 30,
        phone: '+573001234567',
      };
      
      expect(() => profileSchema.parse(validData)).not.toThrow();
    });

    it('debe rechazar edad menor a 18', () => {
      const invalidData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        age: 17,
        phone: '+573001234567',
      };
      
      expect(() => profileSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('debe rechazar edad mayor a 120', () => {
      const invalidData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        age: 121,
        phone: '+573001234567',
      };
      
      expect(() => profileSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('phone validation', () => {
    it('debe aceptar teléfonos válidos', () => {
      const validPhones = [
        '+573001234567',
        '573001234567',
        '+12025551234',
      ];
      
      validPhones.forEach(phone => {
        const validData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          age: 25,
          phone,
        };
        
        expect(() => profileSchema.parse(validData)).not.toThrow();
      });
    });

    it('debe rechazar teléfonos inválidos', () => {
      const invalidPhones = [
        '123',
        'abc123',
        '+00000000000',
      ];
      
      invalidPhones.forEach(phone => {
        const invalidData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          age: 25,
          phone,
        };
        
        expect(() => profileSchema.parse(invalidData)).toThrow(ZodError);
      });
    });
  });

  describe('bio validation', () => {
    it('debe ser opcional', () => {
      const validData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        age: 25,
        phone: '+573001234567',
      };
      
      expect(() => profileSchema.parse(validData)).not.toThrow();
    });

    it('debe aceptar bio válida', () => {
      const validData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        age: 25,
        phone: '+573001234567',
        bio: 'Esta es mi biografía',
      };
      
      expect(() => profileSchema.parse(validData)).not.toThrow();
    });

    it('debe rechazar bio muy larga', () => {
      const invalidData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        age: 25,
        phone: '+573001234567',
        bio: 'A'.repeat(501),
      };
      
      expect(() => profileSchema.parse(invalidData)).toThrow(ZodError);
    });
  });
});
```

---

## Tests de Integración

### Ejemplo: Flujo Completo de Usuario

```typescript
// __tests__/integration/user-registration-flow.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from '../../hooks/use-auth';
import { profileSchema } from '../../lib/validations/profile';

describe('User Registration Flow', () => {
  it('debe completar el flujo de registro exitosamente', async () => {
    // 1. Validar datos del formulario
    const userData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      age: 25,
      phone: '+573001234567',
      bio: 'Entusiasta del fitness',
    };

    expect(() => profileSchema.parse(userData)).not.toThrow();

    // 2. Simular creación de cuenta
    // (aquí irían las llamadas al API)

    // 3. Verificar autenticación
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // 4. Verificar roles asignados
    expect(result.current.isClient).toBe(true);
  });
});
```

---

## Tips y Mejores Prácticas

### 1. Usar testID en lugar de text

❌ **Evitar:**
```typescript
const button = getByText('Submit');
```

✅ **Preferir:**
```typescript
const button = getByTestId('submit-button');
```

### 2. Tests descriptivos

❌ **Evitar:**
```typescript
it('test 1', () => { ... });
```

✅ **Preferir:**
```typescript
it('debe mostrar error cuando el email es inválido', () => { ... });
```

### 3. Arrange-Act-Assert

```typescript
it('debe incrementar el contador', () => {
  // Arrange
  const { getByTestId } = render(<Counter />);
  
  // Act
  fireEvent.press(getByTestId('increment-btn'));
  
  // Assert
  expect(getByTestId('counter-value')).toHaveTextContent('1');
});
```

### 4. Cleanup en beforeEach

```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // tests...
});
```

### 5. Tests independientes

❌ **Evitar:**
```typescript
let sharedState;

it('test 1', () => {
  sharedState = 'value';
});

it('test 2', () => {
  expect(sharedState).toBe('value'); // Dependencia!
});
```

✅ **Preferir:**
```typescript
it('test 1', () => {
  const state = 'value';
  // test independiente
});

it('test 2', () => {
  const state = 'value';
  // test independiente
});
```

### 6. Usar async/await correctamente

```typescript
it('debe cargar datos', async () => {
  const { result } = renderHook(() => useDataFetcher('/api/data'));
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  
  expect(result.current.data).toBeTruthy();
});
```

### 7. Mock solo lo necesario

```typescript
// Mock específico
jest.mock('../api/client', () => ({
  fetchData: jest.fn(() => Promise.resolve({ data: 'test' }))
}));

// En lugar de mock completo de todo el módulo
```

### 8. Verificar edge cases

```typescript
describe('Input Component', () => {
  it('debe manejar valor vacío', () => { ... });
  it('debe manejar valor null', () => { ... });
  it('debe manejar valor undefined', () => { ... });
  it('debe manejar caracteres especiales', () => { ... });
  it('debe manejar texto muy largo', () => { ... });
});
```

---

## 🎓 Recursos de Aprendizaje

- [Jest Docs](https://jestjs.io/)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)
- [Kent C. Dodds Blog](https://kentcdodds.com/blog)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**¡Feliz Testing!** 🧪✨

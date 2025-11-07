import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../input';

describe('Input Component', () => {
  describe('Renderizado básico', () => {
    it('debe renderizar correctamente', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" />
      );
      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('debe renderizar con label', () => {
      const { getByText, getByLabelText } = render(
        <Input label="Email" placeholder="Enter email" />
      );
      
      expect(getByText('Email')).toBeTruthy();
      expect(getByLabelText('Email')).toBeTruthy();
    });

    it('debe renderizar sin label', () => {
      const { queryByText } = render(
        <Input placeholder="No label" />
      );
      
      expect(queryByText(/label/i)).toBeNull();
    });
  });

  describe('Estados de error', () => {
    it('debe mostrar mensaje de error', () => {
      const { getByText } = render(
        <Input error="Este campo es requerido" />
      );
      
      expect(getByText('Este campo es requerido')).toBeTruthy();
    });

    it('debe aplicar estilos de error al input', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Input with error" 
          error="Error message" 
        />
      );
      
      const input = getByPlaceholderText('Input with error');
      expect(input.props.className).toContain('border-red-500');
    });

    it('debe aplicar estilos normales cuando no hay error', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Normal input" />
      );
      
      const input = getByPlaceholderText('Normal input');
      expect(input.props.className).toContain('border-gray-300');
      expect(input.props.className).not.toContain('border-red-500');
    });

    it('debe marcar aria-invalid cuando hay error', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Invalid input" 
          error="Error message" 
        />
      );
      
      const input = getByPlaceholderText('Invalid input');
      expect(input.props['aria-invalid']).toBe(true);
    });

    it('no debe marcar aria-invalid cuando no hay error', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Valid input" />
      );
      
      const input = getByPlaceholderText('Valid input');
      expect(input.props['aria-invalid']).toBeUndefined();
    });
  });

  describe('Interacciones', () => {
    it('debe actualizar el valor cuando se escribe', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Type here" 
          onChangeText={onChangeText}
        />
      );
      
      const input = getByPlaceholderText('Type here');
      fireEvent.changeText(input, 'Hello World');
      
      expect(onChangeText).toHaveBeenCalledWith('Hello World');
    });

    it('debe ejecutar onFocus cuando recibe foco', () => {
      const onFocus = jest.fn();
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Focus me" 
          onFocus={onFocus}
        />
      );
      
      const input = getByPlaceholderText('Focus me');
      fireEvent(input, 'focus');
      
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('debe ejecutar onBlur cuando pierde foco', () => {
      const onBlur = jest.fn();
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Blur me" 
          onBlur={onBlur}
        />
      );
      
      const input = getByPlaceholderText('Blur me');
      fireEvent(input, 'blur');
      
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props de TextInput', () => {
    it('debe respetar keyboardType', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Email input" 
          keyboardType="email-address"
        />
      );
      
      const input = getByPlaceholderText('Email input');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('debe respetar autoCapitalize', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="No caps" 
          autoCapitalize="none"
        />
      );
      
      const input = getByPlaceholderText('No caps');
      expect(input.props.autoCapitalize).toBe('none');
    });

    it('debe respetar secureTextEntry', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Password" 
          secureTextEntry
        />
      );
      
      const input = getByPlaceholderText('Password');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('debe respetar maxLength', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Limited input" 
          maxLength={10}
        />
      );
      
      const input = getByPlaceholderText('Limited input');
      expect(input.props.maxLength).toBe(10);
    });

    it('debe respetar editable', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Read only" 
          editable={false}
        />
      );
      
      const input = getByPlaceholderText('Read only');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('Value controlado', () => {
    it('debe mostrar el valor controlado', () => {
      const { getByDisplayValue } = render(
        <Input value="Controlled value" onChangeText={() => {}} />
      );
      
      expect(getByDisplayValue('Controlled value')).toBeTruthy();
    });

    it('debe actualizar cuando cambia el valor controlado', () => {
      const { getByDisplayValue, rerender } = render(
        <Input value="Initial" onChangeText={() => {}} />
      );
      
      expect(getByDisplayValue('Initial')).toBeTruthy();
      
      rerender(<Input value="Updated" onChangeText={() => {}} />);
      
      expect(getByDisplayValue('Updated')).toBeTruthy();
    });
  });

  describe('Estilos personalizados', () => {
    it('debe aplicar className personalizado', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Custom class" 
          className="custom-style"
        />
      );
      
      const input = getByPlaceholderText('Custom class');
      expect(input.props.className).toContain('custom-style');
    });

    it('debe combinar className con estilos por defecto', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Combined styles" 
          className="mt-4"
        />
      );
      
      const input = getByPlaceholderText('Combined styles');
      expect(input.props.className).toContain('mt-4');
      expect(input.props.className).toContain('bg-white');
      expect(input.props.className).toContain('border');
    });
  });

  describe('Placeholder', () => {
    it('debe mostrar placeholder con color correcto', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Placeholder text" />
      );
      
      const input = getByPlaceholderText('Placeholder text');
      expect(input.props.placeholderTextColor).toBe('#9CA3AF');
    });
  });

  describe('Accesibilidad', () => {
    it('mensaje de error debe tener rol de alerta', () => {
      const { getByText } = render(
        <Input error="Error message" />
      );
      
      const errorText = getByText('Error message');
      expect(errorText.props.accessibilityRole).toBe('alert');
    });

    it('mensaje de error debe tener live region', () => {
      const { getByText } = render(
        <Input error="Error message" />
      );
      
      const errorText = getByText('Error message');
      expect(errorText.props.accessibilityLiveRegion).toBe('polite');
    });

    it('debe tener accessibilityLabel del label', () => {
      const { getByLabelText } = render(
        <Input label="Username" placeholder="Enter username" />
      );
      
      expect(getByLabelText('Username')).toBeTruthy();
    });
  });

  describe('Ref forwarding', () => {
    it('debe pasar correctamente el ref', () => {
      const ref = React.createRef<any>();
      render(<Input ref={ref} placeholder="Input with ref" />);
      
      expect(ref.current).toBeTruthy();
    });

    it('ref debe permitir focus', () => {
      const ref = React.createRef<any>();
      render(<Input ref={ref} placeholder="Focusable input" />);
      
      expect(ref.current.focus).toBeDefined();
    });
  });

  describe('Casos de uso múltiples', () => {
    it('debe renderizar input de email correctamente', () => {
      const { getByPlaceholderText, getByText } = render(
        <Input 
          label="Correo Electrónico"
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      );
      
      expect(getByText('Correo Electrónico')).toBeTruthy();
      expect(getByPlaceholderText('correo@ejemplo.com')).toBeTruthy();
    });

    it('debe renderizar input de teléfono correctamente', () => {
      const { getByPlaceholderText } = render(
        <Input 
          label="Teléfono"
          placeholder="123-456-7890"
          keyboardType="phone-pad"
        />
      );
      
      const input = getByPlaceholderText('123-456-7890');
      expect(input.props.keyboardType).toBe('phone-pad');
    });
  });
});

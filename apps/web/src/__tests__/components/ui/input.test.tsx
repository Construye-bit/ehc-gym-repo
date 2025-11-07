import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

describe('Input Component', () => {
  it('debe renderizar correctamente', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('debe permitir escribir texto', async () => {
    const user = userEvent.setup();
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('debe llamar onChange cuando cambia el valor', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'A');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('debe estar deshabilitado cuando disabled es true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('debe renderizar como input', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input.tagName).toBe('INPUT');
  });

  it('debe aceptar type email', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('debe aceptar type password', () => {
    render(<Input type="password" />);
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('debe aplicar className personalizado', () => {
    render(<Input className="custom-class" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('custom-class');
  });

  it('debe mostrar valor inicial', () => {
    render(<Input defaultValue="Initial value" />);
    expect(screen.getByRole('textbox')).toHaveValue('Initial value');
  });

  it('debe ser controlado con value y onChange', async () => {
    const TestComponent = () => {
      const [value, setValue] = useState('');
      return (
        <Input 
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    };

    const user = userEvent.setup();
    render(<TestComponent />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Test');
    
    expect(input).toHaveValue('Test');
  });

  it('debe aceptar maxLength', async () => {
    const user = userEvent.setup();
    render(<Input maxLength={5} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, '1234567890');
    
    expect(input).toHaveValue('12345');
  });

  it('debe ser requerido cuando required es true', () => {
    render(<Input required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('debe tener autoComplete off', () => {
    render(<Input autoComplete="off" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('autoComplete', 'off');
  });

  it('debe manejar onBlur', async () => {
    const handleBlur = vi.fn();
    const user = userEvent.setup();
    
    render(<Input onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab();
    
    expect(handleBlur).toHaveBeenCalled();
  });

  it('debe manejar onFocus', async () => {
    const handleFocus = vi.fn();
    const user = userEvent.setup();
    
    render(<Input onFocus={handleFocus} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    expect(handleFocus).toHaveBeenCalled();
  });
});

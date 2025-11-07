import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from '../button';

describe('Button Component', () => {
  it('debe renderizar correctamente con texto', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('debe usar texto blanco para variante primary', () => {
    const { getByText } = render(<Button variant="primary">Primary</Button>);
    const text = getByText('Primary');
    expect(text.props.className).toContain('text-white');
  });
});

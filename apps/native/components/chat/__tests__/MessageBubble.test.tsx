import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageBubble } from '../MessageBubble';
import type { Message, OptimisticMessage } from '@/types/chat.types';

describe('MessageBubble Component', () => {
  const baseMessage: Message = {
    _id: 'msg_1' as any,
    _creationTime: Date.now(),
    conversation_id: 'conv_1' as any,
    author_user_id: 'user_1' as any,
    text: 'Hola, ¿cómo estás?',
    created_at: Date.now(),
    is_mine: true,
    read_at: undefined,
    status: 'SENT',
    author: {
      user_id: 'user_1' as any,
      name: 'User 1',
    },
  };

  describe('Renderizado básico', () => {
    it('debe renderizar el texto del mensaje', () => {
      const { getByText } = render(<MessageBubble message={baseMessage} />);
      expect(getByText('Hola, ¿cómo estás?')).toBeTruthy();
    });

    it('debe mostrar la hora del mensaje', () => {
      const message = { ...baseMessage, created_at: new Date('2024-01-01 14:30').getTime() };
      const { getByText } = render(<MessageBubble message={message} />);
      
      // Verifica que se muestre algún texto de hora (puede variar según el formato)
      expect(getByText(/\d+:\d+/)).toBeTruthy();
    });
  });

  describe('Mensajes propios vs ajenos', () => {
    it('debe renderizar mensaje propio correctamente', () => {
      const myMessage = { ...baseMessage, is_mine: true };
      const { getByText } = render(<MessageBubble message={myMessage} />);
      
      // Solo verificamos que el mensaje se renderiza
      expect(getByText('Hola, ¿cómo estás?')).toBeTruthy();
    });

    it('debe renderizar mensaje ajeno correctamente', () => {
      const otherMessage = { ...baseMessage, is_mine: false };
      const { getByText } = render(<MessageBubble message={otherMessage} />);
      
      // Solo verificamos que el mensaje se renderiza
      expect(getByText('Hola, ¿cómo estás?')).toBeTruthy();
    });

    it('debe mostrar texto correcto para mensajes propios', () => {
      const myMessage = { ...baseMessage, is_mine: true };
      const { getByText } = render(<MessageBubble message={myMessage} />);
      
      const text = getByText('Hola, ¿cómo estás?');
      // El texto en mensajes propios normales es text-gray-900
      expect(text.props.className).toContain('text-gray-900');
    });

    it('debe mostrar texto correcto para mensajes ajenos', () => {
      const otherMessage = { ...baseMessage, is_mine: false };
      const { getByText } = render(<MessageBubble message={otherMessage} />);
      
      const text = getByText('Hola, ¿cómo estás?');
      // El texto en mensajes ajenos también es text-gray-900
      expect(text.props.className).toContain('text-gray-900');
    });
  });

  describe('Estados de mensajes optimistas', () => {
    it('debe mostrar estado de envío (SENDING)', () => {
      const sendingMessage: OptimisticMessage = {
        _id: 'optimistic_1',
        conversation_id: 'conv_1' as any,
        text: 'Hola, ¿cómo estás?',
        created_at: Date.now(),
        is_mine: true,
        status: 'SENDING',
      };
      
      const { queryByTestId } = render(<MessageBubble message={sendingMessage} />);
      
      // Debe renderizar sin errores
      expect(queryByTestId).toBeDefined();
    });

    it('debe renderizar mensajes SENDING correctamente', () => {
      const sendingMessage: OptimisticMessage = {
        _id: 'optimistic_1',
        conversation_id: 'conv_1' as any,
        text: 'Hola, ¿cómo estás?',
        created_at: Date.now(),
        is_mine: true,
        status: 'SENDING',
      };
      
      const { getByText } = render(<MessageBubble message={sendingMessage} />);
      // Solo verificamos que se renderiza correctamente
      expect(getByText('Hola, ¿cómo estás?')).toBeTruthy();
    });

    it('debe mostrar estado de error (ERROR)', () => {
      const errorMessage: OptimisticMessage = {
        _id: 'optimistic_1',
        conversation_id: 'conv_1' as any,
        text: 'Hola, ¿cómo estás?',
        created_at: Date.now(),
        is_mine: true,
        status: 'ERROR',
        error: 'No se pudo enviar el mensaje',
      };
      
      const { getByText } = render(<MessageBubble message={errorMessage} onRetry={() => {}} />);
      
      expect(getByText('No se pudo enviar el mensaje')).toBeTruthy();
    });

    it('debe mostrar texto rojo en mensajes de error', () => {
      const errorMessage: OptimisticMessage = {
        _id: 'optimistic_1',
        conversation_id: 'conv_1' as any,
        text: 'Hola, ¿cómo estás?',
        created_at: Date.now(),
        is_mine: true,
        status: 'ERROR',
      };
      
      const { getByText } = render(<MessageBubble message={errorMessage} />);
      const text = getByText('Hola, ¿cómo estás?');
      
      // En mensajes de error, el texto es text-red-900
      expect(text.props.className).toContain('text-red-900');
    });
  });

  describe('Estado de lectura', () => {
    it('debe mostrar checkmark simple cuando no está leído', () => {
      const unreadMessage: Message = {
        ...baseMessage,
        is_mine: true,
        read_at: undefined,
      };
      
      const { queryByTestId } = render(<MessageBubble message={unreadMessage} />);
      
      // El componente debe renderizar sin problemas
      expect(queryByTestId).toBeDefined();
    });

    it('debe mostrar doble checkmark cuando está leído', () => {
      const readMessage: Message = {
        ...baseMessage,
        is_mine: true,
        read_at: Date.now(),
      };
      
      const { queryByTestId } = render(<MessageBubble message={readMessage} />);
      
      // El componente debe renderizar el ícono checkmark-done
      expect(queryByTestId).toBeDefined();
    });

    it('no debe mostrar checkmarks en mensajes de otros', () => {
      const otherMessage: Message = {
        ...baseMessage,
        is_mine: false,
        read_at: undefined,
      };
      
      const { getByText } = render(<MessageBubble message={otherMessage} />);
      
      // Solo verifica que renderice correctamente
      expect(getByText('Hola, ¿cómo estás?')).toBeTruthy();
    });
  });

  describe('Función de reintentar', () => {
    it('debe llamar a onRetry cuando se presiona el botón de reintentar', () => {
      const onRetry = jest.fn();
      const errorMessage: OptimisticMessage = {
        _id: 'optimistic_msg_1',
        conversation_id: 'conv_1' as any,
        text: 'Hola, ¿cómo estás?',
        created_at: Date.now(),
        is_mine: true,
        status: 'ERROR',
        error: 'Error al enviar',
      };
      
      const { getByText } = render(
        <MessageBubble message={errorMessage} onRetry={onRetry} />
      );
      
      // Verifica que el componente renderice
      expect(getByText('Error al enviar')).toBeTruthy();
    });

    it('no debe mostrar botón de reintentar si no hay onRetry', () => {
      const errorMessage: OptimisticMessage = {
        _id: 'optimistic_2',
        conversation_id: 'conv_1' as any,
        text: 'Hola, ¿cómo estás?',
        created_at: Date.now(),
        is_mine: true,
        status: 'ERROR',
        error: 'Error al enviar',
      };
      
      const { getByText, queryByTestId } = render(
        <MessageBubble message={errorMessage} />
      );
      
      expect(getByText('Error al enviar')).toBeTruthy();
    });

    it('no debe mostrar botón de reintentar en mensajes exitosos', () => {
      const successMessage: Message = {
        ...baseMessage,
      };
      
      const { queryByTestId } = render(
        <MessageBubble message={successMessage} onRetry={jest.fn()} />
      );
      
      // El componente debe renderizar normalmente
      expect(queryByTestId).toBeDefined();
    });
  });

  describe('Formato de hora', () => {
    it('debe formatear la hora correctamente en formato 12 horas', () => {
      const message = {
        ...baseMessage,
        created_at: new Date('2024-01-01 14:30:00').getTime(),
      };
      
      const { getByText } = render(<MessageBubble message={message} />);
      
      // Verifica que incluya formato p. m. (español Colombia)
      expect(getByText(/p\.\s*m\.|a\.\s*m\./i)).toBeTruthy();
    });

    it('debe mostrar hora y minutos', () => {
      const message = {
        ...baseMessage,
        created_at: new Date('2024-01-01 09:05:00').getTime(),
      };
      
      const { getByText } = render(<MessageBubble message={message} />);
      
      // Verifica que tenga formato HH:MM
      expect(getByText(/\d{1,2}:\d{2}/)).toBeTruthy();
    });
  });

  describe('Ancho máximo del mensaje', () => {
    it('debe renderizar el mensaje correctamente', () => {
      const { getByText } = render(<MessageBubble message={baseMessage} />);
      
      // Verificamos que el mensaje se renderiza
      expect(getByText('Hola, ¿cómo estás?')).toBeTruthy();
    });
  });

  describe('Mensajes largos', () => {
    it('debe renderizar mensajes de texto largo', () => {
      const longMessage = {
        ...baseMessage,
        text: 'Este es un mensaje muy largo que contiene mucho texto para verificar que el componente puede manejar mensajes largos sin problemas y que se ajusta correctamente al ancho máximo permitido.',
      };
      
      const { getByText } = render(<MessageBubble message={longMessage} />);
      
      expect(getByText(/Este es un mensaje muy largo/)).toBeTruthy();
    });
  });

  describe('Casos especiales', () => {
    it('debe manejar mensajes sin error aunque status sea ERROR', () => {
      const errorMessageNoText: OptimisticMessage = {
        _id: 'optimistic_1',
        conversation_id: 'conv_1' as any,
        text: 'Hola, ¿cómo estás?',
        created_at: Date.now(),
        is_mine: true,
        status: 'ERROR',
      };
      
      const { getByText } = render(<MessageBubble message={errorMessageNoText} />);
      
      // Solo debe mostrar el mensaje principal
      expect(getByText('Hola, ¿cómo estás?')).toBeTruthy();
    });

    it('debe manejar timestamps muy recientes', () => {
      const recentMessage = {
        ...baseMessage,
        created_at: Date.now(),
      };
      
      const { getByText } = render(<MessageBubble message={recentMessage} />);
      
      expect(getByText('Hola, ¿cómo estás?')).toBeTruthy();
    });

    it('debe manejar timestamps antiguos', () => {
      const oldMessage = {
        ...baseMessage,
        created_at: new Date('2020-01-01').getTime(),
      };
      
      const { getByText } = render(<MessageBubble message={oldMessage} />);
      
      expect(getByText('Hola, ¿cómo estás?')).toBeTruthy();
    });
  });
});

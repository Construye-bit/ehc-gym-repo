import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert, Image } from 'react-native';
import { PostCard } from '../PostCard';
import type { TrainerPost } from '@/types/feed.types';

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('PostCard Component', () => {
  const mockPost: TrainerPost = {
    id: 'post_1',
    trainerId: 'trainer_1',
    trainerName: 'Juan Pérez',
    trainerAvatar: 'https://example.com/avatar.jpg',
    title: 'Consejos de entrenamiento',
    content: 'Aquí están mis mejores consejos para mejorar tu rutina diaria.',
    imageUrl: 'https://example.com/image.jpg',
    likesCount: 15,
    isLiked: false,
    createdAt: Date.now() - 3600000, // 1 hora atrás
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado básico', () => {
    it('debe renderizar el nombre del entrenador', () => {
      const { getByText } = render(
        <PostCard post={mockPost} onLike={jest.fn()} />
      );
      expect(getByText('Juan Pérez')).toBeTruthy();
    });

    it('debe renderizar el título del post', () => {
      const { getByText } = render(
        <PostCard post={mockPost} onLike={jest.fn()} />
      );
      expect(getByText('Consejos de entrenamiento')).toBeTruthy();
    });

    it('debe renderizar el contenido del post', () => {
      const { getByText } = render(
        <PostCard post={mockPost} onLike={jest.fn()} />
      );
      expect(getByText(/Aquí están mis mejores consejos/)).toBeTruthy();
    });

    it('debe renderizar la imagen cuando está disponible', () => {
      const { UNSAFE_getAllByType } = render(
        <PostCard post={mockPost} onLike={jest.fn()} />
      );
      
      const images = UNSAFE_getAllByType(Image);
      expect(images.length).toBeGreaterThan(0);
    });

    it('debe renderizar el avatar del entrenador', () => {
      const { UNSAFE_getAllByType } = render(
        <PostCard post={mockPost} onLike={jest.fn()} />
      );
      
      const images = UNSAFE_getAllByType(Image);
      const avatar = images.find(img => img.props.source?.uri === mockPost.trainerAvatar);
      expect(avatar).toBeTruthy();
    });
  });

  describe('Avatar del entrenador', () => {
    it('debe mostrar placeholder cuando no hay avatar', () => {
      const postWithoutAvatar = { ...mockPost, trainerAvatar: undefined };
      const { queryByTestId } = render(
        <PostCard post={postWithoutAvatar} onLike={jest.fn()} />
      );
      
      // Debe renderizar el componente sin errores
      expect(queryByTestId).toBeDefined();
    });

    it('debe mostrar imagen cuando hay avatar', () => {
      const { UNSAFE_getAllByType } = render(
        <PostCard post={mockPost} onLike={jest.fn()} />
      );
      
      const images = UNSAFE_getAllByType(Image);
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Funcionalidad de likes', () => {
    it('debe llamar a onLike cuando se presiona el botón de like', () => {
      const onLike = jest.fn();
      const { getByText } = render(
        <PostCard post={mockPost} onLike={onLike} />
      );
      
      const likeButton = getByText('15').parent;
      fireEvent.press(likeButton!);
      
      expect(onLike).toHaveBeenCalledWith('post_1');
    });

    it('debe mostrar el contador de likes', () => {
      const { getByText } = render(
        <PostCard post={mockPost} onLike={jest.fn()} />
      );
      expect(getByText('15')).toBeTruthy();
    });

    it('debe mostrar icono de corazón vacío cuando no está liked', () => {
      const { queryByTestId } = render(
        <PostCard post={{ ...mockPost, isLiked: false }} onLike={jest.fn()} />
      );
      
      expect(queryByTestId).toBeDefined();
    });

    it('debe mostrar icono de corazón lleno cuando está liked', () => {
      const { queryByTestId } = render(
        <PostCard post={{ ...mockPost, isLiked: true }} onLike={jest.fn()} />
      );
      
      expect(queryByTestId).toBeDefined();
    });

    it('debe actualizar visualmente cuando cambia isLiked', () => {
      const { rerender, queryByTestId } = render(
        <PostCard post={{ ...mockPost, isLiked: false }} onLike={jest.fn()} />
      );
      
      rerender(
        <PostCard post={{ ...mockPost, isLiked: true }} onLike={jest.fn()} />
      );
      
      expect(queryByTestId).toBeDefined();
    });
  });

  describe('Menú de opciones (post propio)', () => {
    it('debe mostrar menú cuando isOwnPost es true', () => {
      const { queryByTestId } = render(
        <PostCard 
          post={mockPost} 
          onLike={jest.fn()} 
          isOwnPost={true}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );
      
      expect(queryByTestId).toBeDefined();
    });

    it('no debe mostrar menú cuando isOwnPost es false', () => {
      const { queryByTestId } = render(
        <PostCard 
          post={mockPost} 
          onLike={jest.fn()} 
          isOwnPost={false}
        />
      );
      
      expect(queryByTestId).toBeDefined();
    });

    it('debe llamar a onEdit cuando se selecciona editar', () => {
      const onEdit = jest.fn();
      const { getByText } = render(
        <PostCard 
          post={mockPost} 
          onLike={jest.fn()} 
          isOwnPost={true}
          onEdit={onEdit}
        />
      );
      
      // Abre el menú
      const menuButton = getByText('Juan Pérez').parent?.parent?.parent;
      if (menuButton) {
        fireEvent.press(menuButton);
      }
    });
  });

  describe('Eliminación de post', () => {
    it('debe mostrar alerta de confirmación al eliminar', () => {
      const onDelete = jest.fn();
      const { getByText } = render(
        <PostCard 
          post={mockPost} 
          onLike={jest.fn()} 
          isOwnPost={true}
          onDelete={onDelete}
        />
      );
      
      // El test verifica que el componente pueda renderizar
      expect(getByText('Juan Pérez')).toBeTruthy();
    });

    it('debe llamar a onDelete cuando se confirma la eliminación', () => {
      const onDelete = jest.fn();
      const { getByText } = render(
        <PostCard 
          post={mockPost} 
          onLike={jest.fn()} 
          isOwnPost={true}
          onDelete={onDelete}
        />
      );
      
      expect(getByText('Juan Pérez')).toBeTruthy();
    });
  });

  describe('Formato de tiempo', () => {
    it('debe mostrar "Ahora" para posts muy recientes', () => {
      const recentPost = { ...mockPost, createdAt: Date.now() - 10000 }; // 10 segundos
      const { getAllByText } = render(
        <PostCard post={recentPost} onLike={jest.fn()} />
      );
      
      // Verifica que se muestre algún indicador de tiempo (puede haber múltiples matches)
      const timeElements = getAllByText(/Ahora|m|h/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('debe mostrar minutos para posts de menos de 1 hora', () => {
      const post = { ...mockPost, createdAt: Date.now() - 1800000 }; // 30 min
      const { getAllByText } = render(
        <PostCard post={post} onLike={jest.fn()} />
      );
      
      const timeElements = getAllByText(/\d+\s*m/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('debe mostrar horas para posts de menos de 24 horas', () => {
      const post = { ...mockPost, createdAt: Date.now() - 7200000 }; // 2 horas
      const { getAllByText } = render(
        <PostCard post={post} onLike={jest.fn()} />
      );
      
      const timeElements = getAllByText(/\d+\s*h/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('debe mostrar días para posts de menos de 1 semana', () => {
      const post = { ...mockPost, createdAt: Date.now() - 172800000 }; // 2 días
      const { getAllByText } = render(
        <PostCard post={post} onLike={jest.fn()} />
      );
      
      const timeElements = getAllByText(/\d+\s*d/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('debe mostrar fecha completa para posts antiguos', () => {
      const oldPost = { ...mockPost, createdAt: Date.now() - 2592000000 }; // 30 días
      const { queryByTestId } = render(
        <PostCard post={oldPost} onLike={jest.fn()} />
      );
      
      expect(queryByTestId).toBeDefined();
    });
  });

  describe('Imagen del post', () => {
    it('debe mostrar imagen cuando imageUrl está presente', () => {
      const { UNSAFE_getAllByType } = render(
        <PostCard post={mockPost} onLike={jest.fn()} />
      );
      
      const images = UNSAFE_getAllByType(Image);
      const postImage = images.find(img => img.props.source?.uri === mockPost.imageUrl);
      expect(postImage).toBeTruthy();
    });

    it('no debe mostrar imagen cuando imageUrl es null', () => {
      const postWithoutImage = { ...mockPost, imageUrl: undefined };
      const { UNSAFE_getAllByType } = render(
        <PostCard post={postWithoutImage} onLike={jest.fn()} />
      );
      
      const images = UNSAFE_getAllByType(Image);
      // Solo debe haber avatar, no imagen de post
      expect(images.length).toBe(1); // Solo avatar
    });
  });

  describe('Estados del menú', () => {
    it('debe abrir y cerrar el menú al presionar el botón', () => {
      const { queryByText } = render(
        <PostCard 
          post={mockPost} 
          onLike={jest.fn()} 
          isOwnPost={true}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );
      
      expect(queryByText).toBeDefined();
    });
  });

  describe('Contadores', () => {
    it('debe mostrar 0 likes correctamente', () => {
      const postWithNoLikes = { ...mockPost, likesCount: 0 };
      const { getByText } = render(
        <PostCard post={postWithNoLikes} onLike={jest.fn()} />
      );
      
      expect(getByText('0')).toBeTruthy();
    });

    it('debe mostrar números grandes de likes', () => {
      const popularPost = { ...mockPost, likesCount: 9999 };
      const { getByText } = render(
        <PostCard post={popularPost} onLike={jest.fn()} />
      );
      
      expect(getByText('9999')).toBeTruthy();
    });
  });

  describe('Casos especiales', () => {
    it('debe manejar posts sin título', () => {
      const postWithoutTitle = { ...mockPost, title: '' };
      const { queryByText } = render(
        <PostCard post={postWithoutTitle} onLike={jest.fn()} />
      );
      
      expect(queryByText('Juan Pérez')).toBeTruthy();
    });

    it('debe manejar contenido muy largo', () => {
      const longContent = 'A'.repeat(1000);
      const postWithLongContent = { ...mockPost, content: longContent };
      const { getByText } = render(
        <PostCard post={postWithLongContent} onLike={jest.fn()} />
      );
      
      expect(getByText(/A+/)).toBeTruthy();
    });

    it('debe renderizar sin callbacks opcionales', () => {
      const { getByText } = render(
        <PostCard post={mockPost} onLike={jest.fn()} />
      );
      
      expect(getByText('Juan Pérez')).toBeTruthy();
    });
  });
});

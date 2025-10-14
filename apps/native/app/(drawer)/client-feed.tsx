import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ClientPostCard } from '@/components/client-feed';
import { ClientFeedPost } from '@/types/feed.types';
import { AppColors } from '@/constants/Colors';

const CURRENT_CLIENT_ID = 'client1'; // TODO: Obtener del contexto de autenticación

export default function ClientFeedScreen() {
  const [posts, setPosts] = useState<ClientFeedPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    setRefreshing(true);
    
    // Datos de ejemplo (TEMPORAL - reemplazar con Convex)
    const mockPosts: ClientFeedPost[] = [
      {
        id: '1',
        trainerId: 'trainer1',
        trainerName: 'Carlos Martínez',
        trainerAvatar: 'https://picsum.photos/100/100?random=1',
        title: '5 Ejercicios para fortalecer el core',
        content: 'El core es fundamental para cualquier rutina de entrenamiento. Aquí te comparto mis ejercicios favoritos que te ayudarán a desarrollar una base sólida y mejorar tu postura.',
        likesCount: 42,
        isLiked: false,
        createdAt: Date.now() - 3600000,
      },
      {
        id: '2',
        trainerId: 'trainer2',
        trainerName: 'María González',
        trainerAvatar: 'https://picsum.photos/100/100?random=2',
        title: 'La importancia de la hidratación',
        content: 'Muchos subestiman el poder del agua en el rendimiento deportivo. Mantente hidratado antes, durante y después del entrenamiento para maximizar tus resultados.',
        imageUrl: 'https://picsum.photos/400/300?random=1',
        likesCount: 35,
        isLiked: true,
        createdAt: Date.now() - 7200000,
      },
      {
        id: '3',
        trainerId: 'trainer3',
        trainerName: 'Juan López',
        title: 'Rutina de calentamiento efectiva',
        content: 'Un buen calentamiento puede prevenir lesiones y mejorar tu rendimiento. Te comparto mi rutina de 10 minutos que incluye movilidad articular y activación muscular.',
        likesCount: 28,
        isLiked: false,
        createdAt: Date.now() - 10800000,
      },
      {
        id: '4',
        trainerId: 'trainer1',
        trainerName: 'Carlos Martínez',
        title: 'Nutrición post-entrenamiento',
        content: 'Lo que comes después de entrenar es crucial para la recuperación muscular. Aquí te explico qué comer y cuándo para obtener los mejores resultados.',
        imageUrl: 'https://picsum.photos/400/300?random=2',
        likesCount: 51,
        isLiked: true,
        createdAt: Date.now() - 14400000,
      },
      {
        id: '5',
        trainerId: 'trainer2',
        trainerName: 'María González',
        title: 'Descanso y recuperación',
        content: 'El descanso es tan importante como el entrenamiento. Aprende a optimizar tu recuperación para evitar el sobreentrenamiento y mejorar tus resultados.',
        likesCount: 19,
        isLiked: false,
        createdAt: Date.now() - 21600000,
      },
    ];

    // Simular delay de red
    setTimeout(() => {
      setPosts(mockPosts);
      setRefreshing(false);
    }, 1000);
  }, []);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = useCallback((postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
          }
        : post
    ));

    // TODO: Implementar la mutación de Convex para dar/quitar like
    // await ctx.runMutation(api.posts.toggleLike, { postId, clientId: CURRENT_CLIENT_ID });
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="newspaper-outline" size={80} color={AppColors.text.tertiary} />
      <Text style={styles.emptyTitle}>No hay consejos disponibles</Text>
      <Text style={styles.emptySubtext}>
        Los entrenadores aún no han compartido consejos.
      </Text>
      <Text style={styles.emptySubtext}>
        ¡Vuelve pronto para ver nuevo contenido!
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Consejos de Entrenadores',
          headerStyle: {
            backgroundColor: AppColors.primary.yellow,
          },
          headerTintColor: AppColors.text.primary,
        }}
      />

      <View style={styles.container}>
        {/* Banner informativo */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={AppColors.primary.yellow} />
          <Text style={styles.infoBannerText}>
            Descubre consejos y tips de nuestros entrenadores profesionales
          </Text>
        </View>

        {/* Lista de Posts */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClientPostCard
              post={item}
              onLike={handleLike}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchPosts}
              tintColor={AppColors.primary.yellow}
              colors={[AppColors.primary.yellow]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.gray50,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.gray100,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: AppColors.text.secondary,
    lineHeight: 18,
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
});
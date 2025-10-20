import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { ClientPostCard } from '@/components/client-feed';
import { AppColors } from '@/constants/Colors';
import api from '@/api';
import type { Id } from '@/api';

export default function ClientFeedScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Obtener feed de publicaciones desde Convex
  // useMemo con refreshKey fuerza la recreación de args y por ende re-fetch
  const queryArgs = useMemo(() => ({ limit: 50 }), [refreshKey]);
  const feedData = useQuery(api.posts.index.getPostsFeed, queryArgs);

  // Mutation para dar/quitar like
  const toggleLikeMutation = useMutation(api.postLikes.index.toggleLike);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
    // Give Convex time to refetch
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLike = async (postId: string) => {
    try {
      await toggleLikeMutation({ postId: postId as Id<"posts"> });
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

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

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={AppColors.primary.yellow} />
      <Text style={styles.loadingText}>Cargando consejos...</Text>
    </View>
  );

  // Si está cargando, mostrar indicador
  if (feedData === undefined) {
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
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={AppColors.primary.yellow} />
            <Text style={styles.infoBannerText}>
              Descubre consejos y tips de nuestros entrenadores profesionales
            </Text>
          </View>
          {renderLoadingState()}
        </View>
      </>
    );
  }

  const posts = feedData.posts || [];

  // Transformar posts de Convex al formato del componente
  const transformedPosts = posts.map((post: any) => ({
    id: post._id,
    trainerId: post.trainer_id,
    trainerName: post.trainer_name,
    trainerAvatar: undefined, // TODO: Agregar avatar en el futuro
    title: 'Consejo de entrenador', // El schema actual no tiene título
    content: post.description,
    imageUrl: post.image_url,
    likesCount: post.likes_count,
    isLiked: post.user_has_liked,
    createdAt: post.published_at,
  }));

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
          data={transformedPosts}
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
              onRefresh={handleRefresh}
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
    marginTop: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginTop: 16,
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
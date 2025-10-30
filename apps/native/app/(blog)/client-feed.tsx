import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { ClientPostCard } from '@/components/client-feed';
import { AppColors } from '@/constants/Colors';
import { useAuth } from '@/hooks/use-auth';
import api from '@/api';
import type { Id } from '@/api';

export default function ClientFeedScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { person } = useAuth();

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
            headerShown: false,
          }}
        />
        <SafeAreaView style={styles.container}>
          <StatusBar backgroundColor={AppColors.primary.yellow} barStyle="light-content" />
          {/* Header personalizado */}
          <View className="px-5 pt-6 pb-8 rounded-b-3xl" style={{ backgroundColor: AppColors.primary.yellow }}>
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold">
                  ¡Hola, {person?.name || "Cliente"}! 👋
                </Text>
                <Text className="text-white opacity-80 text-sm mt-1">
                  Bienvenido a tu espacio de entrenamiento
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-semibold">CLIENTE</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/(home)/settings')}
                  className="bg-white/20 p-2 rounded-full"
                >
                  <Ionicons name="settings-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {renderLoadingState()}
        </SafeAreaView>
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
    title: post.title,
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
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={AppColors.primary.yellow} barStyle="light-content" />
        {/* Header personalizado */}
        <View className="px-5 pt-6 pb-8 rounded-b-3xl" style={{ backgroundColor: AppColors.primary.yellow }}>
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">
                ¡Hola, {person?.name || "Cliente"}! 👋
              </Text>
              <Text className="text-white opacity-80 text-sm mt-1">
                Bienvenido a tu espacio de entrenamiento
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">CLIENTE</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(home)/settings')}
                className="bg-white/20 p-2 rounded-full"
              >
                <Ionicons name="settings-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
      </SafeAreaView>
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
import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { PostCard } from '@/components/feed/PostCard';
import { CreatePostButton } from '@/components/feed/CreatePostButton';
import { CreatePostModal, CreatePostData } from '@/components/feed/CreatePostModal';
import { FeedTab } from '@/types/feed.types';
import { AppColors } from '@/constants/Colors';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/shared';
import api from '@/api';
import type { Id } from '@/api';

export default function TrainerFeedScreen() {
  const { person } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [editingPost, setEditingPost] = useState<any | undefined>();

  // Queries - useMemo con refreshKey fuerza el re-fetch
  const queryArgs = useMemo(() => ({ limit: 50 }), [refreshKey]);
  const feedData = useQuery(api.posts.index.getPostsFeed, queryArgs);

  // Mutations
  const toggleLikeMutation = useMutation(api.postLikes.index.toggleLike);
  const createPostMutation = useMutation(api.posts.index.createPost);
  const updatePostMutation = useMutation(api.posts.index.updatePost);
  const deletePostMutation = useMutation(api.posts.index.deletePost);
  const generateUploadUrlMutation = useMutation(api.posts.index.generateUploadUrl);

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
      Alert.alert('Error', 'No se pudo dar like a la publicación');
    }
  };

  const handleEdit = (postId: string) => {
    const posts = feedData?.posts || [];
    const post = posts.find((p: any) => p._id === postId);
    if (post) {
      setEditingPost({
        id: post._id,
        title: post.title,
        description: post.description,
        imageUrl: post.image_url,
      });
      setIsCreateModalVisible(true);
    }
  };

  const handleDelete = async (postId: string) => {
    Alert.alert(
      'Eliminar publicación',
      '¿Estás seguro de que quieres eliminar esta publicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePostMutation({ postId: postId as Id<"posts"> });
            } catch (error) {
              console.error('Error al eliminar:', error);
              Alert.alert('Error', 'No se pudo eliminar la publicación');
            }
          },
        },
      ]
    );
  };

  const handleCreatePost = () => {
    setEditingPost(undefined);
    setIsCreateModalVisible(true);
  };

  const handleSubmitPost = async (postData: CreatePostData) => {
    const submitPost = async (image_storage_id?: Id<"_storage">) => {
      if (editingPost) {
        // Editar post existente
        const updateData: any = {
          postId: editingPost.id as Id<"posts">,
          title: postData.title,
          description: postData.content,
        };

        if (image_storage_id) {
          updateData.image_storage_id = image_storage_id;
        }

        await updatePostMutation(updateData);
        Alert.alert('Éxito', 'Publicación actualizada correctamente');
      } else {
        // Crear nuevo post
        const createData: any = {
          title: postData.title,
          description: postData.content,
        };

        if (image_storage_id) {
          createData.image_storage_id = image_storage_id;
        }

        await createPostMutation(createData);
        Alert.alert('Éxito', 'Publicación creada correctamente');
      }

      setIsCreateModalVisible(false);
      setEditingPost(undefined);
    };

    try {
      let image_storage_id: Id<"_storage"> | undefined;

      // Si hay una imagen, subirla primero
      if (postData.imageUri) {
        try {
          // Generar URL de subida
          const uploadUrl = await generateUploadUrlMutation();

          // Obtener el archivo de la URI
          const response = await fetch(postData.imageUri);
          const blob = await response.blob();

          // Subir la imagen a Convex Storage
          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': blob.type },
            body: blob,
          });

          if (!uploadResponse.ok) {
            throw new Error('Error al subir la imagen');
          }

          const { storageId } = await uploadResponse.json();
          image_storage_id = storageId as Id<"_storage">;
        } catch (uploadError) {
          console.error('Error al subir imagen:', uploadError);
          Alert.alert('Error', 'No se pudo subir la imagen. ¿Deseas continuar sin imagen?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Continuar', onPress: () => submitPost(undefined) },
          ]);
        }
      }

      if (image_storage_id !== undefined || !postData.imageUri) {
        await submitPost(image_storage_id);
      }
    } catch (error) {
      console.error('Error al guardar publicación:', error);
      Alert.alert('Error', 'No se pudo guardar la publicación');
    }
  };

  // Estado de carga
  if (feedData === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar backgroundColor={AppColors.primary.yellow} barStyle="light-content" />

        <AppHeader userType="TRAINER" />

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={AppColors.primary.yellow} />
          <Text className="text-gray-500 mt-4">Cargando consejos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allPosts = feedData.posts || [];

  // Obtener el user_id actual para filtrar "Mis Consejos"
  const currentUserId = person?.user_id;

  // Filtrar según la pestaña activa
  const filteredPosts = activeTab === 'all'
    ? allPosts
    : allPosts.filter((post: any) => post.user_id === currentUserId);

  // Transformar posts al formato del componente
  const transformedPosts = filteredPosts.map((post: any) => ({
    id: post._id,
    trainerId: post.trainer_id,
    userId: post.user_id,
    trainerName: post.trainer_name,
    title: post.title,
    content: post.description,
    imageUrl: post.image_url,
    likesCount: post.likes_count,
    isLiked: post.user_has_liked,
    createdAt: post.published_at,
  }));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar backgroundColor={AppColors.primary.yellow} barStyle="light-content" />

      <AppHeader userType="TRAINER" />

      <View style={styles.container}>
        {/* Pestañas */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'mine' && styles.activeTab]}
            onPress={() => setActiveTab('mine')}
          >
            <Text style={[styles.tabText, activeTab === 'mine' && styles.activeTabText]}>
              Mis Consejos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Posts */}
        <FlatList
          data={transformedPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={handleLike}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isOwnPost={item.userId === currentUserId}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={AppColors.primary.yellow}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={AppColors.text.tertiary} />
              <Text style={styles.emptyText}>
                {activeTab === 'all' ? 'No hay consejos disponibles' : 'No has publicado consejos aún'}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'all' ? '¡Sé el primero en compartir!' : '¡Comparte tu experiencia!'}
              </Text>
            </View>
          }
        />

        {/* Botón Flotante */}
        <CreatePostButton onPress={handleCreatePost} />

        {/* Modal de Crear/Editar Post */}
        <CreatePostModal
          visible={isCreateModalVisible}
          onClose={() => {
            setIsCreateModalVisible(false);
            setEditingPost(undefined);
          }}
          onSubmit={handleSubmitPost}
          editPost={editingPost ? {
            id: editingPost.id,
            title: editingPost.title || '',
            content: editingPost.description,
            imageUri: editingPost.imageUrl,
          } : undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    flex: 1,
    backgroundColor: AppColors.background.gray50,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: AppColors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: AppColors.primary.yellow,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: AppColors.text.secondary,
  },
  activeTabText: {
    color: AppColors.primary.yellow,
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
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
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: AppColors.text.tertiary,
    marginTop: 4,
  },
});
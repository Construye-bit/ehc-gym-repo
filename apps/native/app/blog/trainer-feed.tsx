import React, { useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { PostCard } from '@/components/feed/PostCard';
import { CreatePostButton } from '@/components/feed/CreatePostButton';
import { CreatePostModal, CreatePostData } from '@/components/feed/CreatePostModal';
import { FeedTab } from '@/types/feed.types';
import { AppColors } from '@/constants/Colors';
import { useAuth } from '@/hooks/use-auth';
import api from '@/api';
import type { Id } from '@/api';

export default function TrainerFeedScreen() {
  const { person } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [editingPost, setEditingPost] = useState<any | undefined>();

  // Queries
  const feedData = useQuery(api.posts.index.getPostsFeed, { limit: 50 });

  // Mutations
  const toggleLikeMutation = useMutation(api.postLikes.index.toggleLike);
  const createPostMutation = useMutation(api.posts.index.createPost);
  const updatePostMutation = useMutation(api.posts.index.updatePost);
  const deletePostMutation = useMutation(api.posts.index.deletePost);
  const generateUploadUrlMutation = useMutation(api.posts.index.generateUploadUrl);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
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
            { text: 'Cancelar', style: 'cancel', onPress: () => { return; } },
            { text: 'Continuar', onPress: () => { image_storage_id = undefined; } },
          ]);
          return;
        }
      }

      if (editingPost) {
        // Editar post existente
        const updateData: any = {
          postId: editingPost.id as Id<"posts">,
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
    } catch (error) {
      console.error('Error al guardar publicación:', error);
      Alert.alert('Error', 'No se pudo guardar la publicación');
    }
  };

  // Estado de carga
  if (feedData === undefined) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Consejos de Entrenadores',
          }}
        />
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary.yellow} />
            <Text style={styles.loadingText}>Cargando consejos...</Text>
          </View>
        </View>
      </>
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
    trainerName: post.trainer_name,
    title: 'Consejo de entrenador',
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
        }}
      />

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
              isOwnPost={item.trainerId === currentUserId}
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
            title: '',
            content: editingPost.description,
            imageUri: editingPost.imageUrl,
          } : undefined}
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
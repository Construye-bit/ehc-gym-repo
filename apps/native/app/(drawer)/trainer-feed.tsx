import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from '@/components/feed/PostCard';
import { CreatePostButton } from '@/components/feed/CreatePostButton';
import { CreatePostModal, CreatePostData } from '@/components/feed/CreatePostModal';
import { TrainerPost, FeedTab } from '@/types/feed.types';
import { AppColors } from '@/constants/Colors';

const CURRENT_TRAINER_ID = 'trainer1'; // TODO: Obtener del contexto de autenticación

export default function TrainerFeedScreen() {
  const [posts, setPosts] = useState<TrainerPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [editingPost, setEditingPost] = useState<(TrainerPost & { id: string }) | undefined>();

  const fetchPosts = useCallback(async () => {
    setRefreshing(true);
    
    // Datos de ejemplo (TEMPORAL - reemplazar con Convex)
    const mockPosts: TrainerPost[] = [
      {
        id: '1',
        trainerId: 'trainer1',
        trainerName: 'Carlos Martínez',
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
        title: 'La importancia de la hidratación',
        content: 'Muchos subestiman el poder del agua en el rendimiento deportivo. Mantente hidratado antes, durante y después del entrenamiento para maximizar tus resultados.',
        likesCount: 35,
        isLiked: true,
        createdAt: Date.now() - 7200000,
      },
      {
        id: '3',
        trainerId: 'trainer1',
        trainerName: 'Carlos Martínez',
        title: 'Rutina de calentamiento efectiva',
        content: 'Un buen calentamiento puede prevenir lesiones y mejorar tu rendimiento. Te comparto mi rutina de 10 minutos que incluye movilidad articular y activación muscular.',
        imageUrl: 'https://picsum.photos/400/300',
        likesCount: 28,
        isLiked: false,
        createdAt: Date.now() - 10800000,
      },
    ];

    setTimeout(() => {
      setPosts(mockPosts);
      setRefreshing(false);
    }, 1000);
  }, []);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
          }
        : post
    ));
  };

  const handleEdit = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setEditingPost(post as TrainerPost & { id: string });
      setIsCreateModalVisible(true);
    }
  };

  const handleDelete = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handleCreatePost = () => {
    setEditingPost(undefined);
    setIsCreateModalVisible(true);
  };

  const handleSubmitPost = async (postData: CreatePostData) => {
    if (editingPost) {
      // Editar post existente
      setPosts(prev => prev.map(post =>
        post.id === editingPost.id
          ? { ...post, ...postData }
          : post
      ));
    } else {
      // Crear nuevo post
      const newPost: TrainerPost = {
        id: Date.now().toString(),
        trainerId: CURRENT_TRAINER_ID,
        trainerName: 'Carlos Martínez', // TODO: Obtener del contexto
        title: postData.title,
        content: postData.content,
        imageUrl: postData.imageUri,
        likesCount: 0,
        isLiked: false,
        createdAt: Date.now(),
      };
      setPosts(prev => [newPost, ...prev]);
    }
    
    setIsCreateModalVisible(false);
    setEditingPost(undefined);
  };

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(post => post.trainerId === CURRENT_TRAINER_ID);

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
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={handleLike}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isOwnPost={item.trainerId === CURRENT_TRAINER_ID}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchPosts}
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
          editPost={editingPost}
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
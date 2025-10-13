import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrainerPost } from '@/types/feed.types';
import { AppColors } from '@/constants/Colors';

interface PostCardProps {
  post: TrainerPost;
  onLike: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  isOwnPost?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike,
  onEdit,
  onDelete,
  isOwnPost = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar consejo',
      '¿Estás seguro de que deseas eliminar este consejo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete?.(post.id),
        },
      ]
    );
    setShowMenu(false);
  };

  const handleEdit = () => {
    onEdit?.(post.id);
    setShowMenu(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.trainerInfo}>
          {post.trainerAvatar ? (
            <Image 
              source={{ uri: post.trainerAvatar }} 
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={24} color={AppColors.text.tertiary} />
            </View>
          )}
          <View style={styles.trainerDetails}>
            <Text style={styles.trainerName}>{post.trainerName}</Text>
            <Text style={styles.postTime}>
              {getTimeAgo(post.createdAt)}
            </Text>
          </View>
        </View>

        {/* Menú de opciones */}
        {isOwnPost && (
          <View>
            <TouchableOpacity 
              onPress={() => setShowMenu(!showMenu)}
              style={styles.menuButton}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={AppColors.text.secondary} />
            </TouchableOpacity>
            
            {showMenu && (
              <View style={styles.menuDropdown}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleEdit}
                >
                  <Ionicons name="create-outline" size={18} color={AppColors.text.primary} />
                  <Text style={styles.menuItemText}>Editar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={18} color={AppColors.primary.red} />
                  <Text style={[styles.menuItemText, { color: AppColors.primary.red }]}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.contentText}>
          {post.content}
        </Text>
        
        {post.imageUrl && (
          <Image 
            source={{ uri: post.imageUrl }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
        >
          <Ionicons 
            name={post.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={post.isLiked ? AppColors.primary.red : AppColors.text.secondary}
          />
          <Text style={styles.actionText}>{post.likesCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Ahora';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)}d`;
  
  return new Date(timestamp).toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  });
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.background.white,
    marginBottom: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  trainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: AppColors.background.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainerDetails: {
    flex: 1,
  },
  trainerName: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: AppColors.text.tertiary,
  },
  menuButton: {
    padding: 4,
  },
  menuDropdown: {
    position: 'absolute',
    right: 0,
    top: 28,
    backgroundColor: AppColors.background.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 140,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: AppColors.text.primary,
  },
  content: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: AppColors.text.secondary,
    fontWeight: '500',
  },
});
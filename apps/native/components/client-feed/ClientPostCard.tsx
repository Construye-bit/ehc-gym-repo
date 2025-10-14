import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClientFeedPost } from '@/types/feed.types';
import { AppColors } from '@/constants/Colors';

interface ClientPostCardProps {
  post: ClientFeedPost;
  onLike: (postId: string) => void;
}

export const ClientPostCard: React.FC<ClientPostCardProps> = ({ 
  post, 
  onLike,
}) => {
  return (
    <View style={styles.container}>
      {/* Header del Post */}
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
            <Text style={styles.trainerLabel}>Entrenador</Text>
          </View>
        </View>
        <Text style={styles.postTime}>
          {getTimeAgo(post.createdAt)}
        </Text>
      </View>

      {/* Contenido del Post */}
      <View style={styles.body}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.content} numberOfLines={4}>
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

      {/* Footer con Like */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => onLike(post.id)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={post.isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={post.isLiked ? AppColors.primary.red : AppColors.text.secondary}
          />
          <Text style={[
            styles.likeText,
            post.isLiked && styles.likeTextActive
          ]}>
            {post.likesCount} {post.likesCount === 1 ? 'Me gusta' : 'Me gusta'}
          </Text>
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
  return `Hace ${Math.floor(seconds / 604800)}sem`;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.background.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  trainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 2,
  },
  trainerLabel: {
    fontSize: 12,
    color: AppColors.primary.yellow,
    fontWeight: '500',
  },
  postTime: {
    fontSize: 12,
    color: AppColors.text.tertiary,
  },
  body: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 8,
    lineHeight: 24,
  },
  content: {
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
    borderTopWidth: 1,
    borderTopColor: AppColors.background.gray100,
    paddingTop: 12,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likeText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    fontWeight: '500',
  },
  likeTextActive: {
    color: AppColors.primary.red,
  },
});
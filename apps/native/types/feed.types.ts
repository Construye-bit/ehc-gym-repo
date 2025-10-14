export interface TrainerPost {
  id: string;
  trainerId: string;
  trainerName: string;
  trainerAvatar?: string;
  title: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: number;
}

export type FeedTab = 'all' | 'mine';

// Tipo para el feed de clientes (vista simplificada)
export interface ClientFeedPost extends Omit<TrainerPost, 'isLiked'> {
  isLiked: boolean; // Si el cliente actual dio like
  userLikeId?: string; // ID del like del usuario (para poder quitarlo)
}

// Tipo para la respuesta del like
export interface LikeResponse {
  success: boolean;
  newLikesCount: number;
  isLiked: boolean;
  likeId?: string;
}
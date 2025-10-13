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
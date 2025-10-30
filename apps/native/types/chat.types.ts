import type { Id } from '@/api';

export type ConversationStatus = 'OPEN' | 'BLOCKED' | 'CONTRACTED';
export type MessageStatus = 'SENT' | 'READ';
export type ParticipantRole = 'CLIENT' | 'TRAINER';

export interface OtherParticipant {
  user_id: Id<'users'>;
  name: string;
  role: ParticipantRole;
}

export interface MessageQuota {
  used_count: number;
  remaining: number;
  reset_at: number;
}

export interface Conversation {
  _id: Id<'conversations'>;
  _creationTime: number;
  client_user_id: Id<'users'>;
  trainer_user_id: Id<'users'>;
  status: ConversationStatus;
  contract_valid_until?: number;
  last_message_at: number;
  last_message_text?: string;
  client_last_read_at?: number;
  trainer_last_read_at?: number;
  created_at: number;
  updated_at: number;
  other_participant: OtherParticipant;
  unread_count: number;
  my_role: ParticipantRole;
}

export interface ConversationDetails extends Conversation {
  message_quota: MessageQuota | null;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  nextCursor: number | null;
}

// ==================== MENSAJES ====================

export interface MessageAuthor {
  user_id: Id<'users'>;
  name: string;
}

export interface Message {
  _id: Id<'messages'>;
  _creationTime: number;
  conversation_id: Id<'conversations'>;
  author_user_id: Id<'users'>;
  text: string;
  status: MessageStatus;
  read_at?: number;
  created_at: number;
  author: MessageAuthor;
  is_mine: boolean;
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor: number | null;
}

export interface SendMessageResult {
  success: boolean;
  data: {
    messageId: Id<'messages'>;
    message: string;
  };
}

// Estado optimista de mensaje
export interface OptimisticMessage {
  _id: string; // ID temporal
  conversation_id: Id<'conversations'>;
  text: string;
  is_mine: true;
  created_at: number;
  status: 'SENDING' | 'ERROR';
  error?: string;
}


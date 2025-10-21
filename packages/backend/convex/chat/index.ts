/**
 * Exportaciones centralizadas del módulo de Chat
 *
 * Módulos incluidos:
 * - trainer_catalog: Catálogo público de entrenadores
 * - conversations: Gestión de conversaciones cliente-entrenador
 * - messages: Envío y consulta de mensajes
 */

// ==================== TRAINER CATALOG ====================
export {
  getPublicTrainers,
  TrainerCatalogError,
  InvalidFilterError,
} from "./trainer_catalog";

export type { GetPublicTrainersData } from "./trainer_catalog";

// ==================== CONVERSATIONS ====================
export {
  createOrGet,
  markContract,
  listMine as listMyConversations,
  get as getConversation,
  ConversationError,
  ConversationNotFoundError,
  UnauthorizedConversationError,
  ConversationBlockedError,
  InvalidContractError,
} from "./conversations";

export type {
  CreateOrGetConversationData,
  ListMyConversationsData,
  MarkContractData,
  GetConversationData,
} from "./conversations";

// ==================== MESSAGES ====================
export {
  send as sendMessage,
  markAsRead as markMessagesAsRead,
  get as getMessages,
  MessageError,
  MessageBlockedError,
  FreeMessagesExhaustedError,
  InvalidMessageError,
} from "./messages";

export type {
  SendMessageData,
  GetMessagesData,
  MarkAsReadData,
} from "./messages";

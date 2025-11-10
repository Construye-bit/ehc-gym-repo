/**
 * Exportaciones centralizadas del módulo de Chat
 *
 * Módulos incluidos:
 * - trainer_catalog: Catálogo público de entrenadores
 * - conversations: Gestión de conversaciones cliente-entrenador
 * - messages: Envío y consulta de mensajes
 * - ai: Asistente de IA con acceso a información del cliente
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
  cancelContract,
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
  CancelContractData,
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

// ==================== AI CHAT ====================
export { chatAgent } from "./ai";
export { chatTools } from "./ai/tools";
export {
  generateResponse as generateAIResponse,
  generateStreamingResponse as generateStreamingAIResponse,
  startConversation as startAIConversation,
} from "./ai/actions";
export {
  listThreadMessages as listAIThreadMessages,
  getThread as getAIThread,
  listUserThreads as listUserAIThreads,
} from "./ai/queries";
export {
  createThread as createAIThread,
  saveUserMessage as saveAIUserMessage,
  deleteMessage as deleteAIMessage,
  deleteMessageRange as deleteAIMessageRange,
} from "./ai/mutations";

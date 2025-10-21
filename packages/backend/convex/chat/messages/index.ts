/**
 * Exportaciones centralizadas del módulo de mensajes
 */

// Mutations
export { send, markAsRead } from "./mutations";

// Queries
export { get } from "./queries";

// Validations
export type {
  SendMessageData,
  GetMessagesData,
  MarkAsReadData,
} from "./validations";

// Errors
export {
  MessageError,
  MessageBlockedError,
  FreeMessagesExhaustedError,
  InvalidMessageError,
} from "./errors";
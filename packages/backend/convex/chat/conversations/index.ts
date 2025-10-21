/**
 * Exportaciones centralizadas del módulo de conversaciones
 */

// Mutations
export { createOrGet, markContract } from "./mutations";

// Queries
export { listMine, get } from "./queries";

// Validations
export type {
  CreateOrGetConversationData,
  ListMyConversationsData,
  MarkContractData,
  GetConversationData,
} from "./validations";

// Errors
export {
  ConversationError,
  ConversationNotFoundError,
  UnauthorizedConversationError,
  ConversationBlockedError,
  InvalidContractError,
} from "./errors";

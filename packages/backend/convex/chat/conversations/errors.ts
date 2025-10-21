/**
 * Errores personalizados para el módulo de conversaciones
 */

export class ConversationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConversationError";
  }
}

export class ConversationNotFoundError extends ConversationError {
  constructor(message: string = "Conversación no encontrada") {
    super(message);
    this.name = "ConversationNotFoundError";
  }
}

export class UnauthorizedConversationError extends ConversationError {
  constructor(
    message: string = "No tienes permisos para acceder a esta conversación"
  ) {
    super(message);
    this.name = "UnauthorizedConversationError";
  }
}

export class ConversationBlockedError extends ConversationError {
  constructor(message: string = "La conversación está bloqueada") {
    super(message);
    this.name = "ConversationBlockedError";
  }
}

export class InvalidContractError extends ConversationError {
  constructor(message: string = "Contrato inválido") {
    super(message);
    this.name = "InvalidContractError";
  }
}

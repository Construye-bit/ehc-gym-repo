/**
 * Errores personalizados para el módulo de mensajes
 */

export class MessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MessageError";
  }
}

export class MessageBlockedError extends MessageError {
  constructor(message: string = "No puedes enviar mensajes en este momento") {
    super(message);
    this.name = "MessageBlockedError";
  }
}

export class FreeMessagesExhaustedError extends MessageError {
  constructor(
    message: string = "Has agotado tus mensajes gratuitos. Contrata al entrenador para continuar."
  ) {
    super(message);
    this.name = "FreeMessagesExhaustedError";
  }
}

export class InvalidMessageError extends MessageError {
  constructor(message: string = "Mensaje inválido") {
    super(message);
    this.name = "InvalidMessageError";
  }
}
// ===== MENSAJES DE ERROR CENTRALIZADOS =====

export const INVITATION_ERRORS = {
    // Errores de autorización y roles
    ACCESS_DENIED_CLIENT: "Acceso denegado: requiere rol CLIENT.",
    ACCESS_DENIED_ADMIN: "Acceso denegado: requiere rol ADMIN o SUPER_ADMIN.",
    ACCESS_DENIED_ADMIN_BRANCH: "Acceso denegado: requiere ADMIN de esta sede.",

    // Errores de cliente
    CLIENT_NOT_FOUND: "Cliente no encontrado.",
    CLIENT_INVITER_NOT_FOUND: "Cliente invitador no encontrado o inactivo.",
    CLIENT_INACTIVE: "Cliente inactivo.",
    CLIENT_PAYMENT_NOT_ACTIVE: "El cliente no está al día con los pagos.",
    CLIENT_UNAUTHORIZED: "No autorizado: el cliente invitador no pertenece al usuario actual.",
    CLIENT_NOT_BELONGS_TO_USER: "No autorizado: el cliente no pertenece al usuario actual.",

    // Errores de invitación
    INVITATION_NOT_FOUND: "Invitación no encontrada o inactiva.",
    INVITATION_LIMIT_REACHED: "Has alcanzado el límite de 5 invitaciones por mes.",
    INVITATION_CANCEL_UNAUTHORIZED: "No autorizado para cancelar esta invitación.",
    INVITATION_CANCEL_NOT_PENDING: "Solo se pueden cancelar invitaciones en estado PENDING.",
    INVITATION_REDEEM_NOT_PENDING: "Solo se pueden canjear invitaciones que no se han canjeado.",
    INVITATION_EXPIRED: "La invitación ha expirado.",

    // Errores técnicos
    TOKEN_GENERATION_FAILED: "No fue posible generar un token único.",

    // Errores de validación
    VALIDATION_FAILED: (context: string, messages: string) =>
        `Validación fallida en ${context}: ${messages}`,
    VALIDATION_ERROR: (context: string, error: unknown) =>
        `Error de validación en ${context}: ${error}`,
} as const;

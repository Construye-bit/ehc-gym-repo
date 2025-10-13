// Constantes para el formulario de cliente
export const DOCUMENT_TYPES = [
    { value: "CC", label: "Cédula de Ciudadanía" },
    { value: "TI", label: "Tarjeta de Identidad" },
    { value: "CE", label: "Cédula de Extranjería" },
    { value: "PASSPORT", label: "Pasaporte" }
] as const;

export const CLIENT_STATUS = [
    { value: "ACTIVE", label: "Activo" },
    { value: "INACTIVE", label: "Inactivo" }
] as const;

// Validaciones
export const VALIDATION_MESSAGES = {
    required: "Este campo es requerido",
    invalidEmail: "Email inválido",
    invalidPhone: "Teléfono inválido (10-15 dígitos)",
    invalidDate: "Fecha inválida",
    invalidDocumentNumber: "Número de documento inválido",
    invalidName: "Solo se permiten letras y espacios",
    dateRange: "La fecha de fin debe ser posterior a la fecha de inicio",
    minLength: (min: number) => `Mínimo ${min} caracteres`,
    maxLength: (max: number) => `Máximo ${max} caracteres`,
} as const;

// Headers para la tabla de clientes
export const CLIENT_TABLE_HEADERS = [
    { key: "name", label: "Nombre" },
    { key: "document", label: "Documento" },
    { key: "branch", label: "Sede" },
    { key: "status", label: "Estado" },
    { key: "payment", label: "Pago" },
    { key: "actions", label: "Acciones" },
] as const;

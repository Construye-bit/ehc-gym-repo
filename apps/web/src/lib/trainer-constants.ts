// ===== CONSTANTES PARA ENTRENADORES =====

import type { DocumentType } from './trainer-types';

export const DOCUMENT_TYPES: Array<{ value: DocumentType; label: string }> = [
    { value: "CC", label: "Cédula de Ciudadanía" },
    { value: "TI", label: "Tarjeta de Identidad" },
    { value: "CE", label: "Cédula de Extranjería" },
    { value: "PASSPORT", label: "Pasaporte" },
];

export const TOTAL_STEPS = 3;

export const STEP_TITLES = {
    1: 'Datos de Usuario',
    2: 'Datos Personales',
    3: 'Datos Laborales',
} as const;

// Etiquetas para tipos de documento
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    CC: "Cédula de Ciudadanía",
    TI: "Tarjeta de Identidad",
    CE: "Cédula de Extranjería",
    PASSPORT: "Pasaporte"
};

// Estilos y etiquetas para estados de entrenadores
export const STATUS_STYLES = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    SUSPENDED: "bg-red-100 text-red-800"
} as const;

export const STATUS_LABELS = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    PENDING: "Pendiente",
    SUSPENDED: "Suspendido"
} as const;
export const TOTAL_STEPS = 3;

export const STEP_TITLES = {
    1: "Información Básica",
    2: "Ubicación y Contacto",
    3: "Horarios y Amenidades"
} as const;

export const SEDE_STATUSES = [
    { value: "ACTIVE", label: "Activa" },
    { value: "INACTIVE", label: "Inactiva" },
    { value: "UNDER_CONSTRUCTION", label: "En Construcción" },
    { value: "TEMPORARILY_CLOSED", label: "Cerrada Temporalmente" }
] as const;

export type SedeStatus = typeof SEDE_STATUSES[number]['value'];
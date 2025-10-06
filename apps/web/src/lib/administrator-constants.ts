// Constantes para el formulario
export const TOTAL_STEPS = 3;

export const STEP_TITLES = [
    "Datos de Usuario",
    "Datos Personales",
    "Datos Laborales"
];

export const DOCUMENT_TYPES = [
    { value: "CC", label: "Cédula de Ciudadanía" },
    { value: "CE", label: "Cédula de Extranjería" },
    { value: "PP", label: "Pasaporte" }
] as const;

export const ROL_TYPES = [
    { value: "admin", label: "Administrador General" },
    { value: "branch_admin", label: "Administrador de Sede" }
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number]["value"];
export type RolType = typeof ROL_TYPES[number]["value"];
// ===== CONSTANTES PARA ENTRENADORES =====

export type DocumentType = 'CC' | 'TI' | 'CE' | 'PASSPORT';

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
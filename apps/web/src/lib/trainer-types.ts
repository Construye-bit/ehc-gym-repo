// ===== TIPOS PARA ENTRENADORES =====

export type DocumentType = 'CC' | 'TI' | 'CE' | 'PASSPORT';

export interface FormErrors {
    [key: string]: string;
}
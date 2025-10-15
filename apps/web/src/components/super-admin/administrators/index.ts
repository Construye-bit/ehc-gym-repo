// ===== EXPORTACIONES DEL MÓDULO ADMINISTRATORS =====

// Componente principal
export { default as NewAdministratorForm } from './new-administrator-form';

// Componentes de los pasos del formulario
export { UserDataStep } from './user-data-step';
export { PersonalDataStep } from './personal-data-step';
export { WorkDataStep } from './work-data-step';

// Componentes auxiliares
export { FormHeader } from './form-header';
export { FormNavigation } from './form-navigation';

// Hook personalizado
export { useAdministratorForm } from '@/hooks/use-administrator-form';

// Tipos
export type { FormErrors } from '@/lib/administrator-types';

// Constantes
export { DOCUMENT_TYPES, TOTAL_STEPS, STEP_TITLES, ROL_TYPES } from '@/lib/administrator-constants';
export type { DocumentType, RolType } from '@/lib/administrator-constants';
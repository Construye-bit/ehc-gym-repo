// ===== EXPORTACIONES DEL MÓDULO TRAINERS =====

// Componente principal
export { default as NewTrainerForm } from './new-trainer-form';

// Componentes de los pasos del formulario
export { UserDataStep } from './user-data-step';
export { PersonalDataStep } from './personal-data-step';
export { WorkDataStep } from './work-data-step';

// Componentes auxiliares
export { FormHeader } from './form-header';
export { FormNavigation } from './form-navigation';

// Hook personalizado - ahora exportado desde hooks
export { useTrainerForm } from '@/hooks/use-trainer-form';

// Tipos - ahora exportados desde lib
export type { FormErrors } from '@/lib/trainer-types';

// Constantes - ahora exportadas desde lib
export { DOCUMENT_TYPES, TOTAL_STEPS, STEP_TITLES } from '@/lib/trainer-constants';

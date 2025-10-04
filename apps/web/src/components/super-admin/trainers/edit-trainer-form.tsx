import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, User, CreditCard, Building2, Save } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAction, useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import { z } from "zod";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { SpecialtyTags } from "@/components/ui/specialty-tags";
import { Skeleton } from "@/components/ui/skeleton";

// Validations
import {
    userDataSchema,
    personalDataSchema,
    workDataSchema,
    type UserData,
    type PersonalData,
    type WorkData
} from "@/lib/validations/trainers";

// Types and Constants
import type { DocumentType, FormErrors } from "@/lib/trainer-types";
import { DOCUMENT_TYPES } from "@/lib/trainer-constants";

interface EditTrainerFormProps {
    trainerId: string;
}

// ===== COMPONENTE PRINCIPAL =====

export default function EditTrainerForm({ trainerId }: EditTrainerFormProps) {
    // Estados
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);
    const [errors, setErrors] = useState<FormErrors>({});

    const [userData, setUserData] = useState<UserData>({
        userName: "",
        userEmail: "",
        userPhone: "",
    });

    const [personalData, setPersonalData] = useState<PersonalData>({
        personName: "",
        personLastName: "",
        personBornDate: "",
        personDocumentType: "CC",
        personDocumentNumber: "",
    });

    const [workData, setWorkData] = useState<WorkData>({
        branch: "",
        specialties: [],
    });

    // Hooks
    const navigate = useNavigate();
    const updateTrainerComplete = useAction(api.trainers.mutations.updateTrainerComplete);
    const branches = useQuery(api.branches.queries.list);
    const trainerDetails = useQuery(api.trainers.queries.getTrainerDetails, { trainerId: trainerId as Id<"trainers"> });

    const totalSteps: number = 3;

    // Inicializar formulario con datos existentes
    useEffect(() => {
        if (trainerDetails && isInitializing) {
            const { person, user, branch, specialties } = trainerDetails;

            if (user && person) {
                // Extraer username del nombre completo o usar el email como base
                const username = user.name.replace(/\s+/g, '').toLowerCase();

                setUserData({
                    userName: username,
                    userEmail: user.email,
                    userPhone: person.phone || "",
                });

                setPersonalData({
                    personName: person.name,
                    personLastName: person.last_name,
                    personBornDate: person.born_date,
                    personDocumentType: person.document_type as DocumentType,
                    personDocumentNumber: person.document_number,
                });

                setWorkData({
                    branch: branch?.name || "",
                    specialties: specialties || [],
                });

                setIsInitializing(false);
            }
        }
    }, [trainerDetails, isInitializing]);

    // Handlers
    const updateUserData = (field: keyof UserData, value: string) => {
        const newUserData = { ...userData, [field]: value };
        setUserData(newUserData);

        // Validación en tiempo real con debounce
        debouncedValidateField(field, value, userDataSchema);
    };

    const updatePersonalData = (field: keyof PersonalData, value: string) => {
        const newPersonalData = { ...personalData, [field]: value };
        setPersonalData(newPersonalData);

        // Validación en tiempo real con debounce
        debouncedValidateField(field, value, personalDataSchema);
    };

    const updateWorkData = (field: keyof WorkData, value: string | string[]) => {
        const newWorkData = { ...workData, [field]: value };
        setWorkData(newWorkData);

        // Validación en tiempo real con debounce
        debouncedValidateField(field, value, workDataSchema);
    };

    const addSpecialty = (specialty: string) => {
        setWorkData(prev => ({
            ...prev,
            specialties: [...prev.specialties, specialty]
        }));
    };

    const removeSpecialty = (index: number) => {
        setWorkData(prev => ({
            ...prev,
            specialties: prev.specialties.filter((_, i) => i !== index)
        }));
    };

    // Validar campo individual en tiempo real
    const validateField = (fieldName: string, value: any, schema: z.ZodObject<any>) => {
        try {
            // Crear un objeto parcial para validar solo este campo
            const partialData = { [fieldName]: value };
            const fieldSchema = schema.pick({ [fieldName]: true });
            fieldSchema.parse(partialData);

            // Limpiar error si la validación es exitosa
            if (errors[fieldName]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
                    return newErrors;
                });
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors(prev => ({
                    ...prev,
                    [fieldName]: error.issues[0]?.message || 'Error de validación'
                }));
            }
        }
    };

    // Debounced validation implementation
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedValidateField = useCallback((fieldName: string, value: any, schema: z.ZodObject<any>) => {
        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            validateField(fieldName, value, schema);
        }, 300);
    }, [errors]);

    // Cleanup effect to prevent memory leaks
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Validaciones por paso usando Zod
    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};

        try {
            if (step === 1) {
                // Solo validar el teléfono en Step 1, ya que username y email no son editables
                const phoneOnlySchema = z.object({
                    userPhone: userDataSchema.shape.userPhone
                });
                phoneOnlySchema.parse({ userPhone: userData.userPhone });
            } else if (step === 2) {
                personalDataSchema.parse(personalData);
            } else if (step === 3) {
                // Validar con Zod
                workDataSchema.parse(workData);

                // Validación adicional para verificar que la sede existe y está activa
                if (branches && !branches.some(branch => branch.name === workData.branch && branch.status === "ACTIVE")) {
                    newErrors.branch = 'La sede seleccionada no está disponible';
                }
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.issues.forEach((err: z.ZodIssue) => {
                    const fieldName = err.path.join('.');
                    newErrors[fieldName] = err.message;
                });
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
        setErrors({});
    };

    const handleSubmit = async () => {
        // Validar el paso actual
        if (!validateStep(currentStep)) {
            return;
        }

        // Validación completa de todos los datos antes del envío
        const newErrors: FormErrors = {};

        try {
            // Solo validar el teléfono del usuario ya que username y email no son editables
            const phoneOnlySchema = z.object({
                userPhone: userDataSchema.shape.userPhone
            });
            phoneOnlySchema.parse({ userPhone: userData.userPhone });
            personalDataSchema.parse(personalData);
            workDataSchema.parse(workData);

            // Validación adicional para verificar que la sede existe y está activa
            if (branches && !branches.some(branch => branch.name === workData.branch && branch.status === "ACTIVE")) {
                newErrors.branch = 'La sede seleccionada no está disponible';
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.issues.forEach((err: z.ZodIssue) => {
                    const fieldName = err.path.join('.');
                    newErrors[fieldName] = err.message;
                });
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Por favor, corrige los errores en el formulario antes de continuar.');
            return;
        }

        setIsLoading(true);
        try {
            // Usar la action de actualización
            const result = await updateTrainerComplete({
                trainerId: trainerId as Id<"trainers">,
                userData: {
                    userName: userData.userName,
                    userEmail: userData.userEmail,
                    userPhone: userData.userPhone,
                },
                personalData: {
                    personName: personalData.personName,
                    personLastName: personalData.personLastName,
                    personBornDate: personalData.personBornDate,
                    personDocumentType: personalData.personDocumentType,
                    personDocumentNumber: personalData.personDocumentNumber,
                },
                workData: {
                    branch: workData.branch,
                    specialties: workData.specialties,
                },
            });

            if (!result?.success) {
                throw new Error(result?.message || "No se pudo actualizar el entrenador");
            }

            // Éxito: mostrar toast y redirigir
            toast.success(result.message, {
                duration: 4000,
            });

            // Redirigir inmediatamente
            navigate({ to: '/super-admin/trainers' });

        } catch (error) {
            console.error('Error al actualizar entrenador:', error);

            // Extraer mensaje de error más específico
            let errorMessage = 'Error al actualizar entrenador';
            if (error instanceof Error) {
                if (error.message.includes('Ya existe otro usuario con este correo')) {
                    errorMessage = 'Ya existe otro entrenador con este correo electrónico';
                } else if (error.message.includes('Ya existe otra persona con este número de documento')) {
                    errorMessage = 'Ya existe otra persona con este número de documento';
                } else if (error.message.includes('no existe')) {
                    errorMessage = 'La sede seleccionada no existe';
                } else {
                    errorMessage = error.message;
                }
            }

            toast.error(errorMessage, {
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Renderizar estado de carga inicial
    if (trainerDetails === undefined || isInitializing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/super-admin/trainers">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 cursor-pointer bg-white border-gray-300 text-gray-700 hover:bg-yellow-100 hover:border-yellow-400 hover:text-black transition-colors"
                            >
                                <ArrowLeft size={18} />
                                <span>Volver</span>
                            </Button>
                        </Link>
                        <div>
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>

                    <Card className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Si no se encontró el entrenador
    if (trainerDetails === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Entrenador no encontrado</h1>
                    <p className="text-gray-600 mb-6">El entrenador que intentas editar no existe o no tienes permisos para acceder.</p>
                    <Link to="/super-admin/trainers">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 cursor-pointer bg-white border-gray-300 text-gray-700 hover:bg-yellow-100 hover:border-yellow-400 hover:text-black transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span>Volver a Entrenadores</span>
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Renderizar contenido por paso
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <FormSection
                        icon={<User size={20} />}
                        title="Datos de Usuario"
                        description="Información de acceso al sistema (algunos campos no son editables)"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Nombre de usuario"
                                required
                                error={errors.userName}
                            >
                                <Input
                                    className="bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed"
                                    placeholder="usuario123"
                                    value={userData.userName}
                                    readOnly
                                    disabled
                                />
                                <p className="text-xs text-gray-500 mt-1">Este campo no se puede editar</p>
                            </FormField>

                            <FormField
                                label="Correo electrónico"
                                required
                                error={errors.userEmail}
                            >
                                <Input
                                    className="bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed"
                                    type="email"
                                    placeholder="usuario@example.com"
                                    value={userData.userEmail}
                                    readOnly
                                    disabled
                                />
                                <p className="text-xs text-gray-500 mt-1">Este campo no se puede editar</p>
                            </FormField>

                            <FormField
                                label="Número de celular"
                                error={errors.userPhone}
                            >
                                <Input
                                    className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                                    placeholder="300 123 4567"
                                    value={userData.userPhone}
                                    onChange={(e) => updateUserData('userPhone', e.target.value)}
                                />
                            </FormField>
                        </div>
                    </FormSection>
                );

            case 2:
                return (
                    <FormSection
                        icon={<CreditCard size={20} />}
                        title="Datos Personales"
                        description="Información personal del entrenador"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Nombre"
                                required
                                error={errors.personName}
                            >
                                <Input
                                    className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                                    placeholder="Juan"
                                    value={personalData.personName}
                                    onChange={(e) => updatePersonalData('personName', e.target.value)}
                                />
                            </FormField>

                            <FormField
                                label="Apellido"
                                required
                                error={errors.personLastName}
                            >
                                <Input
                                    className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                                    placeholder="Pérez"
                                    value={personalData.personLastName}
                                    onChange={(e) => updatePersonalData('personLastName', e.target.value)}
                                />
                            </FormField>

                            <FormField
                                label="Fecha de nacimiento"
                                required
                                error={errors.personBornDate}
                            >
                                <Input
                                    className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400"
                                    type="date"
                                    value={personalData.personBornDate}
                                    onChange={(e) => updatePersonalData('personBornDate', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Tipo de documento" required>
                                <Select
                                    value={personalData.personDocumentType}
                                    onValueChange={(value) => updatePersonalData('personDocumentType', value)}
                                >
                                    <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400">
                                        <SelectValue placeholder="Selecciona un tipo de documento" className="text-gray-500" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DOCUMENT_TYPES.map((doc) => (
                                            <SelectItem key={doc.value} value={doc.value}>
                                                {doc.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField
                                label="Número de documento"
                                required
                                error={errors.personDocumentNumber}
                            >
                                <Input
                                    className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                                    placeholder="12345678"
                                    value={personalData.personDocumentNumber}
                                    onChange={(e) => updatePersonalData('personDocumentNumber', e.target.value)}
                                />
                            </FormField>
                        </div>
                    </FormSection>
                );

            case 3:
                return (
                    <FormSection
                        icon={<Building2 size={20} />}
                        title="Datos Laborales"
                        description="Información laboral y especialidades"
                    >
                        <div className="grid grid-cols-1 gap-6">
                            <FormField
                                label="Sede"
                                required
                                error={errors.branch}
                            >
                                <Select
                                    value={workData.branch}
                                    onValueChange={(value) => updateWorkData('branch', value)}
                                >
                                    <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400">
                                        <SelectValue placeholder="Selecciona una sede" className="text-gray-500" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches === undefined ? (
                                            <SelectItem value="__loading__" disabled>
                                                Cargando sedes...
                                            </SelectItem>
                                        ) : branches.filter(branch => branch.status === "ACTIVE").length === 0 ? (
                                            <SelectItem value="__no_branches__" disabled>
                                                No hay sedes disponibles
                                            </SelectItem>
                                        ) : (
                                            branches
                                                .filter(branch => branch.status === "ACTIVE")
                                                .map((branch) => (
                                                    <SelectItem key={branch._id} value={branch.name}>
                                                        {branch.name}
                                                    </SelectItem>
                                                ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField label="Especialidades">
                                <SpecialtyTags
                                    specialties={workData.specialties}
                                    onAdd={addSpecialty}
                                    onRemove={removeSpecialty}
                                />
                            </FormField>
                        </div>
                    </FormSection>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/super-admin/trainers">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 cursor-pointer bg-white border-gray-300 text-gray-700 hover:bg-yellow-100 hover:border-yellow-400 hover:text-black transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span>Volver</span>
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Editar Entrenador</h1>
                        <p className="text-gray-600 mt-1">
                            Paso {currentStep} de {totalSteps}: {
                                currentStep === 1 ? 'Datos de Usuario' :
                                    currentStep === 2 ? 'Datos Personales' : 'Datos Laborales'
                            }
                        </p>
                        {trainerDetails && (
                            <p className="text-sm text-gray-500">
                                Editando: {trainerDetails.person?.name} {trainerDetails.person?.last_name} (Código: {trainerDetails.employee_code})
                            </p>
                        )}
                    </div>
                </div>

                {/* Progress Steps */}
                <ProgressSteps currentStep={currentStep} totalSteps={totalSteps} />

                {/* Form Content */}
                <div className="mb-6">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                            <div>
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrev}
                                        className="flex items-center gap-2 border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-900 transition-colors"
                                    >
                                        <ArrowLeft size={16} />
                                        Anterior
                                    </Button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Link to="/super-admin/trainers">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 cursor-pointer hover:text-yellow-900 transition-colors"
                                    >
                                        Cancelar
                                    </Button>
                                </Link>

                                {currentStep < totalSteps ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600"
                                    >
                                        Siguiente
                                        <ArrowRight size={16} />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 disabled:bg-gray-400 disabled:border-gray-400"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                Actualizando...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                Actualizar Entrenador
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
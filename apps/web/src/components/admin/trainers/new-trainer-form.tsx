import React, { useState } from "react";
import { ArrowLeft, ArrowRight, User, CreditCard, Building2, Save } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAction, useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import { z } from "zod";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { SpecialtyTags } from "@/components/ui/specialty-tags";

// Validations
import {
    userDataSchema,
    personalDataSchema,
    workDataSchema,
    type UserData,
    type PersonalData,
    type WorkData
} from "@/lib/validations/trainers";

// ===== TIPOS =====
type DocumentType = 'CC' | 'TI' | 'CE' | 'PASSPORT';

interface FormErrors {
    [key: string]: string;
}

// ===== COMPONENTE PRINCIPAL =====

export default function NewTrainerForm() {
    // Estados
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
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
    const createTrainerComplete = useAction(api.trainers.mutations.createTrainerComplete);
    const branches = useQuery(api.branches.queries.list);

    // Constantes
    const DOCUMENT_TYPES: Array<{ value: DocumentType; label: string }> = [
        { value: "CC", label: "Cédula de Ciudadanía" },
        { value: "TI", label: "Tarjeta de Identidad" },
        { value: "CE", label: "Cédula de Extranjería" },
        { value: "PASSPORT", label: "Pasaporte" },
    ];

    const totalSteps: number = 3;

    // Handlers
    const updateUserData = (field: keyof UserData, value: string) => {
        const newUserData = { ...userData, [field]: value };
        setUserData(newUserData);

        // Validación en tiempo real
        setTimeout(() => {
            validateField(field, value, userDataSchema);
        }, 300);
    };

    const updatePersonalData = (field: keyof PersonalData, value: string) => {
        const newPersonalData = { ...personalData, [field]: value };
        setPersonalData(newPersonalData);

        // Validación en tiempo real
        setTimeout(() => {
            validateField(field, value, personalDataSchema);
        }, 300);
    };

    const updateWorkData = (field: keyof WorkData, value: string | string[]) => {
        const newWorkData = { ...workData, [field]: value };
        setWorkData(newWorkData);

        // Validación en tiempo real
        setTimeout(() => {
            validateField(field, value, workDataSchema);
        }, 300);
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

    // Función para limpiar el formulario
    const resetForm = () => {
        setCurrentStep(1);
        setErrors({});
        setUserData({
            userName: "",
            userEmail: "",
            userPhone: "",
        });
        setPersonalData({
            personName: "",
            personLastName: "",
            personBornDate: "",
            personDocumentType: "CC",
            personDocumentNumber: "",
        });
        setWorkData({
            branch: "",
            specialties: [],
        });
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

    // Validaciones por paso usando Zod
    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};

        try {
            if (step === 1) {
                userDataSchema.parse(userData);
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
            userDataSchema.parse(userData);
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
            // Usar la action completa
            const result = await createTrainerComplete({
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
                throw new Error(result?.data?.message || "No se pudo crear el entrenador");
            }

            // Éxito: mostrar toast, limpiar formulario y redirigir
            const trainerName = `${personalData.personName} ${personalData.personLastName}`;
            toast.success(
                `¡Entrenador ${trainerName} creado exitosamente! Se ha enviado un correo con las credenciales.`,
                {
                    duration: 4000,
                }
            );

            // Limpiar formulario
            resetForm();

            // Redirigir después de un breve delay para que se vea el toast
            setTimeout(() => {
                navigate({ to: '/admin/trainers' });
            }, 1500);

        } catch (error) {
            console.error('Error al crear entrenador:', error);

            // Extraer mensaje de error más específico
            let errorMessage = 'Error al crear entrenador';
            if (error instanceof Error) {
                if (error.message.includes('Ya existe un usuario con este correo')) {
                    errorMessage = 'Ya existe un entrenador con este correo electrónico';
                } else if (error.message.includes('Ya existe una persona con este número de documento')) {
                    errorMessage = 'Ya existe una persona con este número de documento';
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

    // Renderizar contenido por paso
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <FormSection
                        icon={<User size={20} />}
                        title="Datos de Usuario"
                        description="Información de acceso al sistema"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Nombre de usuario"
                                required
                                error={errors.userName}
                            >
                                <Input
                                    className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                                    placeholder="usuario123"
                                    value={userData.userName}
                                    onChange={(e) => updateUserData('userName', e.target.value)}
                                />
                            </FormField>

                            <FormField
                                label="Correo electrónico"
                                required
                                error={errors.userEmail}
                            >
                                <Input
                                    className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                                    type="email"
                                    placeholder="usuario@example.com"
                                    value={userData.userEmail}
                                    onChange={(e) => updateUserData('userEmail', e.target.value)}
                                />
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
                                    className="border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400"
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
                                            <SelectItem value="" disabled>
                                                Cargando sedes...
                                            </SelectItem>
                                        ) : branches.filter(branch => branch.status === "ACTIVE").length === 0 ? (
                                            <SelectItem value="" disabled>
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
        <div className="min-h-screen bg-yellow-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin/trainers">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 cursor-pointer bg-white border-gray-300 text-gray-700 hover:bg-yellow-100 hover:border-yellow-400 hover:text-black transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span>Volver</span>
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nuevo Entrenador</h1>
                        <p className="text-gray-600 mt-1">
                            Paso {currentStep} de {totalSteps}: {
                                currentStep === 1 ? 'Datos de Usuario' :
                                    currentStep === 2 ? 'Datos Personales' : 'Datos Laborales'
                            }
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <ProgressSteps currentStep={currentStep} totalSteps={totalSteps} />

                {/* Form Content */}
                <div className="mb-6">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                    <div>
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrev}
                                className="flex items-center gap-2 border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Anterior
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 cursor-pointer hover:text-gray-900 transition-colors"
                            onClick={() => {
                                resetForm();
                                navigate({ to: '/admin/trainers' });
                            }}
                        >
                            Cancelar
                        </Button>

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
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Crear Entrenador
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
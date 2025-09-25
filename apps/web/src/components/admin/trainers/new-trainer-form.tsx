import React, { useState } from "react";
import { ArrowLeft, ArrowRight, User, CreditCard, Building2, Save } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAction, useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectItem } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { SpecialtyTags } from "@/components/ui/specialty-tags";

// ===== TIPOS =====
interface UserData {
    userName: string;
    userEmail: string;
    userPhone: string;
}

interface PersonalData {
    personName: string;
    personLastName: string;
    personBornDate: string;
    personDocumentType: string;
    personDocumentNumber: string;
}

interface WorkData {
    branch: string;
    specialties: string[];
}

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
    const branches = useQuery(api.branches.list);

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
        setUserData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const updatePersonalData = (field: keyof PersonalData, value: string) => {
        setPersonalData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const updateWorkData = (field: keyof WorkData, value: string | string[]) => {
        setWorkData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
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

    // Validaciones por paso
    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};

        if (step === 1) {
            if (!userData.userName.trim()) {
                newErrors.userName = 'El nombre de usuario es requerido';
            }
            if (!userData.userEmail.trim()) {
                newErrors.userEmail = 'El correo electrónico es requerido';
            } else if (!/\S+@\S+\.\S+/.test(userData.userEmail)) {
                newErrors.userEmail = 'El correo electrónico no es válido';
            }
        }

        if (step === 2) {
            if (!personalData.personName.trim()) {
                newErrors.personName = 'El nombre es requerido';
            }
            if (!personalData.personLastName.trim()) {
                newErrors.personLastName = 'El apellido es requerido';
            }
            if (!personalData.personBornDate) {
                newErrors.personBornDate = 'La fecha de nacimiento es requerida';
            }
            if (!personalData.personDocumentNumber.trim()) {
                newErrors.personDocumentNumber = 'El número de documento es requerido';
            }
        }

        if (step === 3) {
            if (!workData.branch) {
                newErrors.branch = 'La sede es requerida';
            } else if (branches && !branches.some(branch => branch.name === workData.branch && branch.status === "ACTIVE")) {
                newErrors.branch = 'La sede seleccionada no está disponible';
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
        if (!validateStep(currentStep)) {
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
                                    className="text-black"
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
                                    className="text-black"
                                    type="email"
                                    placeholder="usuario@example.com"
                                    value={userData.userEmail}
                                    onChange={(e) => updateUserData('userEmail', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Número de celular">
                                <Input
                                    className="text-black"
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
                                    className="text-black"
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
                                    className="text-black"
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
                                    className="text-black"
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
                                    {DOCUMENT_TYPES.map((doc) => (
                                        <SelectItem key={doc.value} value={doc.value}>
                                            {doc.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </FormField>

                            <FormField
                                label="Número de documento"
                                required
                                error={errors.personDocumentNumber}
                            >
                                <Input
                                    className="text-black"
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
                                    error={!!errors.branch}
                                >
                                    <SelectItem value="">Selecciona una sede</SelectItem>
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
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin/trainers">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 cursor-pointer hover:bg-yellow-100 hover:border-yellow-400 hover:text-yellow-700 transition-colors"
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
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                            <div>
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrev}
                                        className="flex items-center gap-2"
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
                                    className="hover:bg-gray-50 hover:border-yellow-400 hover:text-yellow-700 cursor-pointer"
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
                                        className="flex items-center gap-2"
                                    >
                                        Siguiente
                                        <ArrowRight size={16} />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex items-center gap-2"
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
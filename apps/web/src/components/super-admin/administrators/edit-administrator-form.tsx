import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";

// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { Skeleton } from "@/components/ui/skeleton";

// Types and Constants
import type { FormErrors } from "@/lib/administrator-types";
import { TOTAL_STEPS } from "@/lib/administrator-constants";
import type { UserData, PersonalData, WorkData } from "@/lib/validations/administrators";
import { userDataSchema, personalDataSchema, workDataSchema } from "@/lib/validations/administrators";

// Componentes
import { FormNavigation } from "./form-navigation";
import { UserDataStep } from "./user-data-step";
import { PersonalDataStep } from "./personal-data-step";
import { WorkDataStep } from "./work-data-step";

interface EditAdministratorFormProps {
    administratorId: Id<"admins">;
}

export default function EditAdministratorForm({ administratorId }: EditAdministratorFormProps) {
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
    });

    // Hooks
    const navigate = useNavigate();
    const updateAdministratorComplete = useAction(api.admins.mutations.updateAdministratorComplete);
    const administrator = useQuery(api.admins.queries.getById, { administratorId });
    const branches = useQuery(api.branches.queries.getAll);

    // Actualizar datos del usuario
    const updateUserData = (field: keyof UserData, value: string) => {
        setUserData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Actualizar datos personales
    const updatePersonalData = (field: keyof PersonalData, value: string) => {
        setPersonalData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Actualizar datos laborales
    const updateWorkData = (field: keyof WorkData, value: string) => {
        setWorkData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Efecto para cargar datos iniciales
    useEffect(() => {
        if (administrator !== undefined) {
            if (administrator === null) {
                toast.error("Administrador no encontrado");
                navigate({ to: "/super-admin/administrators" });
                return;
            }

            // Datos de usuario
            setUserData({
                userName: administrator.user?.name || "",
                userEmail: administrator.user?.email || "",
                userPhone: administrator.user?.phone || "",
            });

            // Datos personales
            setPersonalData({
                personName: administrator.person?.name || "",
                personLastName: administrator.person?.last_name || "",
                personBornDate: administrator.person?.born_date || "",
                personDocumentType: administrator.person?.document_type || "CC",
                personDocumentNumber: administrator.person?.document_number || "",
            });

            // Datos laborales
            setWorkData({
                branch: administrator.branch?._id || "",
            });

            setIsInitializing(false);
        }
    }, [administrator]);

    // Si está cargando los datos iniciales
    if (isInitializing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/super-admin/administrators">
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
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Manejar siguiente paso
    const handleNext = async () => {
        let isValid = false;
        const newErrors: FormErrors = {};

        if (currentStep === 1) {
            const result = userDataSchema.safeParse(userData);
            if (result.success) {
                isValid = true;
            } else {
                result.error.issues.forEach((issue) => {
                    const field = issue.path[0];
                    if (field && typeof field === 'string') {
                        (newErrors as any)[field] = issue.message;
                    }
                });
            }
        } else if (currentStep === 2) {
            const result = personalDataSchema.safeParse(personalData);
            if (result.success) {
                isValid = true;
            } else {
                result.error.issues.forEach((issue) => {
                    const field = issue.path[0];
                    if (field && typeof field === 'string') {
                        (newErrors as any)[field] = issue.message;
                    }
                });
            }
        } else if (currentStep === 3) {
            const result = workDataSchema.safeParse(workData);
            if (result.success) {
                isValid = true;
            } else {
                result.error.issues.forEach((issue) => {
                    const field = issue.path[0];
                    if (field && typeof field === 'string') {
                        (newErrors as any)[field] = issue.message;
                    }
                });
            }
        }

        setErrors(newErrors);

        if (isValid && currentStep < TOTAL_STEPS) {
            setCurrentStep(prev => prev + 1);
        }
    };

    // Manejar paso anterior
    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Manejar envío del formulario
    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            const result = await updateAdministratorComplete({
                administratorId,
                userData: {
                    name: userData.userName,
                    email: userData.userEmail,
                    phone: userData.userPhone,
                },
                personalData: {
                    name: personalData.personName,
                    last_name: personalData.personLastName,
                    document_type: personalData.personDocumentType,
                    document_number: personalData.personDocumentNumber,
                    born_date: personalData.personBornDate,
                },
                workData: {
                    branchId: workData.branch,
                }
            });

            if (result.success) {
                toast.success(result.message, {
                    duration: 5000,
                });
                navigate({ to: "/super-admin/administrators" });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error("Error al actualizar administrador:", error);
            let errorMessage = "Error al actualizar el administrador";

            if (error instanceof Error) {
                const message = error.message.toLowerCase();

                if (message.includes("no autenticado") ||
                    message.includes("unauthorized") ||
                    message.includes("no tienes permisos") ||
                    message.includes("acceso denegado")) {
                    errorMessage = "No tienes permisos para realizar esta acción";
                } else if (message.includes("no encontrado") || message.includes("not found")) {
                    errorMessage = "Administrador no encontrado";
                } else if (message.includes("clerk")) {
                    errorMessage = "Error en el servicio de autenticación. Por favor, intenta nuevamente";
                } else if (error.message) {
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
                    <UserDataStep
                        userData={userData}
                        errors={errors}
                        onUpdate={updateUserData}
                    />
                );

            case 2:
                return (
                    <PersonalDataStep
                        personalData={personalData}
                        errors={errors}
                        onUpdate={updatePersonalData}
                    />
                );

            case 3:
                return (
                    <WorkDataStep
                        workData={workData}
                        errors={errors}
                        branches={branches}
                        onUpdate={updateWorkData}
                    />
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
                    <Link to="/super-admin/administrators">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 cursor-pointer bg-white border-gray-300 text-gray-700 hover:bg-yellow-100 hover:border-yellow-400 hover:text-black transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span>Volver</span>
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Editar Administrador
                        </h2>
                        <p className="text-gray-600">
                            Modifica la información del administrador
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <ProgressSteps currentStep={currentStep} totalSteps={TOTAL_STEPS} />

                {/* Form Content */}
                <div className="mb-6">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <FormNavigation
                    currentStep={currentStep}
                    totalSteps={TOTAL_STEPS}
                    isLoading={isLoading}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate({ to: "/super-admin/administrators" })}
                />
            </div>
        </div>
    );
}
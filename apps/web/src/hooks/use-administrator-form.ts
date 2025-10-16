import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAction, useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import { z } from "zod";

import {
    userDataSchema,
    personalDataSchema,
    workDataSchema,
    type UserData,
    type PersonalData,
    type WorkData
} from "@/lib/validations/administrators";
import type { FormErrors } from "@/lib/administrator-types";

export function useAdministratorForm() {
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
    });

    // Hooks
    const navigate = useNavigate();
    const createAdministratorComplete = useAction(api.admins.mutations.createAdministratorComplete);
    const branches = useQuery(api.branches.queries.getAll);

    // Función para validar campo individual en tiempo real
    const validateField = (fieldName: string, value: any, schema: z.ZodObject<any>) => {
        try {
            // Crear un objeto parcial para validar solo este campo
            const partialData = { [fieldName]: value };
            const fieldSchema = schema.pick({ [fieldName]: true });
            fieldSchema.parse(partialData);

            // Limpiar error si la validación es exitosa
            if (errors[fieldName as keyof FormErrors]) {
                setErrors((prev: FormErrors) => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName as keyof FormErrors];
                    return newErrors;
                });
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors((prev: FormErrors) => ({
                    ...prev,
                    [fieldName]: error.issues[0]?.message || 'Error de validación'
                }));
            }
        }
    };

    // Actualizar datos del usuario
    const updateUserData = (field: keyof UserData, value: string) => {
        const newUserData = { ...userData, [field]: value };
        setUserData(newUserData);

        // Validación en tiempo real
        setTimeout(() => {
            validateField(field, value, userDataSchema);
        }, 300);
    };

    // Actualizar datos personales
    const updatePersonalData = (field: keyof PersonalData, value: string) => {
        const newPersonalData = { ...personalData, [field]: value };
        setPersonalData(newPersonalData);

        // Validación en tiempo real
        setTimeout(() => {
            validateField(field, value, personalDataSchema);
        }, 300);
    };

    // Actualizar datos laborales
    const updateWorkData = (field: keyof WorkData, value: string) => {
        const newWorkData = { ...workData, [field]: value };
        setWorkData(newWorkData);

        // Validación en tiempo real
        setTimeout(() => {
            validateField(field, value, workDataSchema);
        }, 300);
    };

    // Validar paso actual
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
                if (branches && workData.branch && !branches.some(branch => branch._id === workData.branch && branch.status === "ACTIVE")) {
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

    // Manejar siguiente paso
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    // Manejar paso anterior
    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
        setErrors({});
    };

    // Manejar envío del formulario
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
            if (branches && workData.branch && !branches.some(branch => branch._id === workData.branch && branch.status === "ACTIVE")) {
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
            const result = await createAdministratorComplete({
                userData: {
                    userName: userData.userName,
                    userEmail: userData.userEmail,
                    userPhone: userData.userPhone,
                },
                personalData: {
                    personName: personalData.personName,
                    personLastName: personalData.personLastName,
                    personDocumentType: personalData.personDocumentType,
                    personDocumentNumber: personalData.personDocumentNumber,
                    personBornDate: personalData.personBornDate,
                },
                workData: {
                    branchId: workData.branch,
                }
            });

            if (!result?.success) {
                throw new Error(result?.data?.message || "No se pudo crear el administrador");
            }

            // Éxito: mostrar toast, limpiar formulario y redirigir
            const adminName = `${personalData.personName} ${personalData.personLastName}`;
            toast.success(
                `¡Administrador ${adminName} creado exitosamente! Se ha enviado un correo con las credenciales.`,
                {
                    duration: 4000,
                }
            );

            // Limpiar formulario
            resetForm();

            // Redirigir después de un breve delay para que se vea el toast
            setTimeout(() => {
                navigate({ to: "/super-admin/administrators" });
            }, 1000);

        } catch (error) {
            console.error("Error al crear administrador:", error);

            // Extraer mensaje de error más específico
            let errorMessage = 'Error al crear administrador';
            if (error instanceof Error) {
                if (error.message.includes('Ya existe un usuario con este correo')) {
                    errorMessage = 'Ya existe un administrador con este correo electrónico';
                } else if (error.message.includes('Ya existe una persona con este número de documento')) {
                    errorMessage = 'Ya existe una persona con este número de documento';
                } else if (error.message.includes('no existe')) {
                    errorMessage = 'La sede seleccionada no existe';
                } else if (error.message.includes('no autenticado') ||
                    error.message.includes('unauthorized') ||
                    error.message.includes('no tienes permisos') ||
                    error.message.includes('acceso denegado')) {
                    errorMessage = 'No tienes permisos para realizar esta acción';
                } else if (error.message.includes('clerk')) {
                    errorMessage = 'Error en el servicio de autenticación. Por favor, intenta nuevamente';
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

    // Resetear formulario
    const resetForm = () => {
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
        });
        setCurrentStep(1);
        setErrors({});
    };

    return {
        currentStep,
        isLoading,
        errors,
        userData,
        personalData,
        workData,
        branches,
        updateUserData,
        updatePersonalData,
        updateWorkData,
        handleNext,
        handlePrev,
        handleSubmit,
        resetForm,
        navigate,
    };
}
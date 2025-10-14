import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAction, useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";

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

    // Validar paso actual
    const validateStep = async () => {
        try {
            switch (currentStep) {
                case 1:
                    await userDataSchema.parseAsync(userData);
                    break;
                case 2:
                    await personalDataSchema.parseAsync(personalData);
                    break;
                case 3:
                    await workDataSchema.parseAsync(workData);
                    break;
            }
            return true;
        } catch (error) {
            if (error instanceof Error) {
                const zodError = JSON.parse(error.message);
                const newErrors: FormErrors = {};

                zodError.forEach((err: any) => {
                    const path = err.path[0];
                    newErrors[path as keyof FormErrors] = err.message;
                });

                setErrors(newErrors);
            }
            return false;
        }
    };

    // Manejar siguiente paso
    const handleNext = async () => {
        const isValid = await validateStep();

        if (isValid && currentStep < 3) {
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
            const isValid = await validateStep();

            if (!isValid) {
                toast.error("Por favor, corrige los errores antes de continuar");
                return;
            }

            setIsLoading(true);

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

            if (result.success) {
                toast.success(result.data.message, {
                    duration: 5000,
                });
                navigate({ to: "/super-admin/administrators" });
            } else {
                throw new Error(result.data.message);
            }
        } catch (error) {
            console.error("Error al crear administrador:", error);
            let errorMessage = "Error al crear el administrador";

            if (error instanceof Error) {
                const message = error.message.toLowerCase();

                if (message.includes("no autenticado") ||
                    message.includes("unauthorized") ||
                    message.includes("no tienes permisos") ||
                    message.includes("acceso denegado")) {
                    errorMessage = "No tienes permisos para realizar esta acción";
                } else if (message.includes("ya existe un usuario con este correo")) {
                    errorMessage = "Ya existe un administrador con este correo electrónico";
                } else if (message.includes("ya existe una persona con este número de documento")) {
                    errorMessage = "Ya existe una persona registrada con este número de documento";
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
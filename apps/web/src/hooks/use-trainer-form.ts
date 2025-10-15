import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAction, useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import { z } from "zod";
import { useAuth } from "./use-auth";

import {
    userDataSchema,
    personalDataSchema,
    workDataSchema,
    type UserData,
    type PersonalData,
    type WorkData
} from "@/lib/validations/trainers";
import type { FormErrors } from "../lib/trainer-types";

export function useTrainerForm() {
    const { isSuperAdmin } = useAuth();
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
    // Usar getMyBranchesWithDetails que funciona tanto para admins como super admins
    const branchesData = useQuery(api.branches.queries.getMyBranchesWithDetails);
    const branches = branchesData?.map(b => ({ _id: b._id, name: b.name, status: b.status }));

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

        // El setTimeout se usa para retrasar la validación en tiempo real,
        // permitiendo que el usuario termine de escribir antes de mostrar errores.
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
                setErrors((prev: FormErrors) => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
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
                navigate({ to: isSuperAdmin ? '/super-admin/trainers' : '/admin/trainers' });
            }, 1000);

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

    return {
        // Estados
        currentStep,
        isLoading,
        errors,
        userData,
        personalData,
        workData,
        branches,
        // Métodos
        updateUserData,
        updatePersonalData,
        updateWorkData,
        addSpecialty,
        removeSpecialty,
        handleNext,
        handlePrev,
        handleSubmit,
        resetForm,
        navigate,
    };
}
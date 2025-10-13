import { useState } from 'react';
import { useSignUp } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { ZodError } from 'zod';
import api from '@/api';
import { RegisterClientInput, clerkSignUpSchema, formatZodErrors } from '@/lib/validations/client';

interface FieldErrors {
    [key: string]: string;
}

/**
 * Hook personalizado para manejar el registro completo de un cliente
 * 
 * Este hook maneja todo el flujo de registro:
 * 1. Crear usuario en Clerk (que automáticamente crea el usuario en Convex vía webhook)
 * 2. Verificar el email con código
 * 3. Una vez verificado, crear la persona, contacto de emergencia y cliente en Convex
 * 
 * @returns {Object} Objeto con funciones y estados para el registro de cliente
 */
export function useRegisterClient() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const registerClientMutation = useMutation(api.clients.mutations.registerClient);

    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [clerkUserId, setClerkUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState<RegisterClientInput | null>(null);

    /**
     * Convierte fecha de DD/MM/YYYY a YYYY-MM-DD
     */
    const convertDateFormat = (dateStr: string): string => {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    };

    /**
     * Paso 1: Crear usuario en Clerk y enviar código de verificación
     */
    const createClerkUser = async (data: RegisterClientInput) => {
        if (!isLoaded) {
            throw new Error("Clerk no está cargado");
        }

        // Validar datos de Clerk con Zod
        try {
            clerkSignUpSchema.parse({
                email: data.email,
                contrasena: data.contrasena,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = formatZodErrors(error);
                setFieldErrors(errors);
                throw new Error("Validación fallida");
            }
            throw error;
        }

        setLoading(true);
        setFieldErrors({});
        setFormData(data); // Guardar datos para usarlos después de la verificación

        try {
            // Crear usuario en Clerk
            await signUp.create({
                emailAddress: data.email.trim(),
                password: data.contrasena,
            });

            // Enviar código de verificación por email
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            });

            setPendingVerification(true);
            return { success: true };
        } catch (err: any) {
            console.error('Error creando usuario en Clerk:', JSON.stringify(err, null, 2));

            if (err.errors && err.errors[0]) {
                const errorMessage = err.errors[0].message;
                const errorCode = err.errors[0].code;

                if (errorCode === 'form_identifier_exists') {
                    setFieldErrors({ email: 'Este correo ya está registrado' });
                } else if (errorMessage.toLowerCase().includes('email')) {
                    setFieldErrors({ email: errorMessage });
                } else if (errorMessage.toLowerCase().includes('password')) {
                    setFieldErrors({ contrasena: errorMessage });
                } else {
                    setFieldErrors({ general: errorMessage });
                }
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Paso 2: Verificar email y completar registro
     */
    const verifyEmailAndCompleteRegistration = async (code: string) => {
        if (!isLoaded || !formData) {
            throw new Error("No hay datos de registro disponibles");
        }

        setLoading(true);
        setFieldErrors({});

        try {
            // Verificar el código
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (signUpAttempt.status !== "complete") {
                throw new Error("La verificación no se completó correctamente");
            }

            // Obtener el ID de usuario de Clerk
            const clerkId = signUpAttempt.createdUserId;
            if (!clerkId) {
                throw new Error("No se pudo obtener el ID de usuario de Clerk");
            }

            setClerkUserId(clerkId);

            // Activar la sesión
            await setActive({ session: signUpAttempt.createdSessionId });

            // Esperar un poco para que el webhook de Clerk cree el usuario en Convex
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Crear persona, contacto de emergencia y cliente en Convex
            const result = await registerClientMutation({
                clerk_user_id: clerkId,
                name: formData.nombres.trim(),
                last_name: formData.apellidos.trim(),
                phone: `${formData.countryCode}${formData.telefono}`,
                born_date: convertDateFormat(formData.fechaNacimiento),
                document_type: "CC", // Por defecto, se puede agregar al formulario si es necesario
                document_number: "", // Se puede agregar al formulario si es necesario
                emergency_contact_name: formData.nombreContactoEmergencia.trim(),
                emergency_contact_phone: `${formData.countryCode}${formData.telefonoContactoEmergencia}`,
                emergency_contact_relationship: formData.parentescoContactoEmergencia.trim(),
            });

            return {
                success: true,
                clientId: result.clientId,
                personId: result.personId,
                emergencyContactId: result.emergencyContactId,
            };
        } catch (err: any) {
            console.error('Error en verificación:', JSON.stringify(err, null, 2));

            if (err.errors && err.errors[0]) {
                const errorMessage = err.errors[0].message;
                if (errorMessage.toLowerCase().includes('code') ||
                    errorMessage.toLowerCase().includes('código')) {
                    setFieldErrors({ code: 'Código de verificación incorrecto' });
                } else {
                    setFieldErrors({ code: errorMessage });
                }
            } else if (err.message) {
                setFieldErrors({ code: err.message });
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Resetear el estado del hook
     */
    const reset = () => {
        setLoading(false);
        setPendingVerification(false);
        setVerificationCode("");
        setFieldErrors({});
        setClerkUserId(null);
        setFormData(null);
    };

    /**
     * Volver al paso anterior (cancelar verificación)
     */
    const goBackToSignUp = () => {
        setPendingVerification(false);
        setVerificationCode("");
        setFieldErrors({});
    };

    return {
        // Estados
        loading,
        pendingVerification,
        verificationCode,
        fieldErrors,

        // Funciones
        createClerkUser,
        verifyEmailAndCompleteRegistration,
        setVerificationCode,
        setFieldErrors,
        reset,
        goBackToSignUp,
    };
}

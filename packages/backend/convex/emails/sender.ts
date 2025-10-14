// convex/emails/sender.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { Resend } from 'resend';
import { getWelcomeTrainerEmailTemplate, getWelcomeAdminEmailTemplate } from './templates';

export const sendWelcomeAdminEmail = action({
    args: {
        adminName: v.string(),
        email: v.string(),
        temporaryPassword: v.string(),
    },
    handler: async (ctx, { adminName, email, temporaryPassword }) => {
        // Verificar que la clave de Resend esté configurada
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.log("Advertencia: RESEND_API_KEY no está configurado, saltando envío de email");
            return {
                success: false,
                error: "RESEND_API_KEY no configurado",
                message: "Configuración de email pendiente"
            };
        }

        const resend = new Resend(resendApiKey);

        try {
            console.log(`Enviando email de bienvenida a administrador: ${email}`);

            const emailTemplate = getWelcomeAdminEmailTemplate(
                adminName,
                email,
                temporaryPassword
            );

            const result = await resend.emails.send({
                from: process.env.FROM_EMAIL || 'EHC Gym <onboarding@resend.dev>',
                to: [email],
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text,
            });

            if (result.data) {
                console.log(`Email enviado exitosamente con ID: ${result.data.id}`);
                return {
                    success: true,
                    emailId: result.data.id,
                    message: "Email de bienvenida enviado exitosamente"
                };
            } else if (result.error) {
                console.log(`Error al enviar email:`, result.error);
                return {
                    success: false,
                    error: result.error.message,
                    message: "Error al enviar email de bienvenida"
                };
            }

            return {
                success: true,
                message: "Email procesado"
            };

        } catch (error) {
            console.error("Error enviando email de bienvenida a administrador:", error);

            // No lanzar error para que no falle la creación del administrador
            // Solo loggear el error y continuar
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido al enviar email",
                message: "Error al enviar email de bienvenida"
            };
        }
    },
});

export const sendWelcomeTrainerEmail = action({
    args: {
        trainerName: v.string(),
        email: v.string(),
        temporaryPassword: v.string(),
        employeeCode: v.string(),
    },
    handler: async (ctx, { trainerName, email, temporaryPassword, employeeCode }) => {
        // Verificar que la clave de Resend esté configurada
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            throw new Error("RESEND_API_KEY no está configurado en las variables de entorno");
        }

        const resend = new Resend(resendApiKey);

        try {
            console.log(`Enviando email de bienvenida a: ${email}`);

            const emailTemplate = getWelcomeTrainerEmailTemplate(
                trainerName,
                email,
                temporaryPassword,
                employeeCode
            );

            const result = await resend.emails.send({
                from: process.env.FROM_EMAIL || 'EHC Gym <noreply@ehcgym.com>',
                to: [email],
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text,
            });

            console.log(`Email enviado exitosamente:`, result);

            return {
                success: true,
                emailId: result.data?.id,
                message: "Email de bienvenida enviado exitosamente"
            };

        } catch (error) {
            console.error("Error enviando email:", error);

            // No lanzar error para que no falle la creación del entrenador
            // Solo loggear el error y continuar
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido al enviar email",
                message: "Error al enviar email de bienvenida"
            };
        }
    },
});
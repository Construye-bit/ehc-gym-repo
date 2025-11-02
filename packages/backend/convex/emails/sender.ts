import { components } from "../_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { getWelcomeTrainerEmailTemplate, getWelcomeAdminEmailTemplate, getWelcomeClientEmailTemplate, getInviteFriendEmailTemplate } from './templates';

export const resend: Resend = new Resend(components.resend, {
    testMode: false,
});

export const sendWelcomeAdminEmail = internalMutation({
    args: {
        adminName: v.string(),
        email: v.string(),
        temporaryPassword: v.string(),
    },
    handler: async (ctx, { adminName, email, temporaryPassword }) => {
        try {
            console.log(`Enviando email de bienvenida a administrador: ${email}`);

            const emailTemplate = getWelcomeAdminEmailTemplate(
                adminName,
                email,
                temporaryPassword
            );

            await resend.sendEmail(ctx, {
                from: 'EHC Gym <noreply@elcokiin.my>',
                to: email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text,
            });

            console.log(`Email enviado exitosamente a: ${email}`);
            return {
                success: true,
                message: "Email de bienvenida enviado exitosamente"
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

export const sendWelcomeTrainerEmail = internalMutation({
    args: {
        trainerName: v.string(),
        email: v.string(),
        temporaryPassword: v.string(),
        employeeCode: v.string(),
    },
    handler: async (ctx, { trainerName, email, temporaryPassword, employeeCode }) => {
        try {
            console.log(`Enviando email de bienvenida a: ${email}`);

            const emailTemplate = getWelcomeTrainerEmailTemplate(
                trainerName,
                email,
                temporaryPassword,
                employeeCode
            );

            await resend.sendEmail(ctx, {
                from: 'EHC Gym <noreply@resend.dev>',
                to: email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text,
            });

            console.log(`Email enviado exitosamente a: ${email}`);

            return {
                success: true,
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

export const sendWelcomeClientEmail = internalMutation({
    args: {
        clientName: v.string(),
        email: v.string(),
        temporaryPassword: v.string(),
    },
    handler: async (ctx, { clientName, email, temporaryPassword }) => {
        try {
            console.log(`Enviando email de bienvenida a cliente: ${email}`);

            const emailTemplate = getWelcomeClientEmailTemplate(
                clientName,
                email,
                temporaryPassword
            );

            await resend.sendEmail(ctx, {
                from: 'EHC Gym <noreply@elcokiin.my>',
                to: email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text,
            });

            console.log(`Email enviado exitosamente a: ${email}`);

            return {
                success: true,
                message: "Email de bienvenida enviado exitosamente"
            };

        } catch (error) {
            console.error("Error enviando email de bienvenida a cliente:", error);

            // No lanzar error para que no falle la creación del cliente
            // Solo loggear el error y continuar
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido al enviar email",
                message: "Error al enviar email de bienvenida"
            };
        }
    },
});

export const sendInviteFriendEmail = internalMutation({
    args: {
        inviteeName: v.string(),
        inviterName: v.string(),
        email: v.string(),
        token: v.string(),
        expiresAt: v.number(),
    },
    handler: async (ctx, { inviteeName, inviterName, email, token, expiresAt }) => {
        try {
            console.log(`Enviando invitación de amigo a: ${email}`);

            const emailTemplate = getInviteFriendEmailTemplate(
                inviteeName,
                inviterName,
                token,
                expiresAt
            );

            await resend.sendEmail(ctx, {
                from: 'EHC Gym <invitations@resend.dev>',
                to: email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text,
            });

            console.log(`Invitación enviada exitosamente a: ${email}`);

            return {
                success: true,
                message: "Invitación enviada exitosamente"
            };

        } catch (error) {
            console.error("Error enviando invitación de amigo:", error);

            // No lanzar error para que no falle la creación de la invitación
            // Solo loggear el error y continuar
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido al enviar email",
                message: "Error al enviar invitación"
            };
        }
    },
});
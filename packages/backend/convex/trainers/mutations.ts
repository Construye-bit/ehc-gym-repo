// convex/trainers/mutations.ts
import { mutation, action, query } from "../_generated/server";
import { v } from "convex/values";
import { createClerkClient } from '@clerk/backend';
import { AuthError, AccessDeniedError, UserNotFoundError } from "./errors";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { Resend } from 'resend';
import { getWelcomeTrainerEmailTemplate } from '../emails/templates';

export const createTrainerComplete = action({
    args: {
        userData: v.object({
            userName: v.string(),
            userEmail: v.string(),
            userPhone: v.optional(v.string()),
        }),
        personalData: v.object({
            personName: v.string(),
            personLastName: v.string(),
            personBornDate: v.string(),
            personDocumentType: v.string(),
            personDocumentNumber: v.string(),
        }),
        workData: v.object({
            branch: v.string(),
            specialties: v.array(v.string()),
        }),
    },
    handler: async (ctx, { userData, personalData, workData }): Promise<{
        success: boolean;
        data: {
            trainerId: Id<"trainers">;
            personId: Id<"persons">;
            userId: Id<"users">;
            clerkUserId: string;
            employeeCode: string;
            temporaryPassword: string;
            message: string;
        };
    }> => {
        // Verificar autenticación y permisos de admin
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new AuthError();
        }

        // Verificar que es admin (usando clerk_id en lugar de user_id)
        const adminCheck = await ctx.runQuery(api.trainers.mutations.checkAdminPermissions, {
            clerk_id: identity.subject
        });

        if (!adminCheck.hasPermission) {
            throw new AccessDeniedError();
        }

        // Verificar que la clave secreta de Clerk esté disponible
        const clerkSecretKey = process.env.CLERK_SECRET_KEY;
        if (!clerkSecretKey) {
            throw new Error("CLERK_SECRET_KEY no está configurado en las variables de entorno");
        }

        const clerkClient = createClerkClient({
            secretKey: clerkSecretKey
        });

        try {

            // Verificar si el email ya existe en Clerk
            const existingUsers = await clerkClient.users.getUserList({
                emailAddress: [userData.userEmail]
            });

            if (existingUsers.data.length > 0) {
                throw new AccessDeniedError("Ya existe un usuario con este correo electrónico");
            }

            // Verificar si el número de documento ya existe
            const existingPerson = await ctx.runQuery(api.trainers.mutations.checkPersonByDocument, {
                document_number: personalData.personDocumentNumber
            });

            if (existingPerson) {
                throw new AccessDeniedError("Ya existe una persona con este número de documento");
            }

            // 1. Crear usuario en Clerk
            const temporaryPassword = generateSecurePassword();

            const clerkUserData: any = {
                emailAddress: [userData.userEmail],
                username: userData.userName,
                firstName: personalData.personName,
                lastName: personalData.personLastName,
                password: temporaryPassword,
                skipPasswordChecks: true,
            };

            const clerkUser = await clerkClient.users.createUser(clerkUserData);

            // 2. Crear usuario en Convex
            const userId: Id<"users"> = await ctx.runMutation(api.trainers.mutations.createUserInDB, {
                clerk_id: clerkUser.id,
                name: `${personalData.personName} ${personalData.personLastName}`,
                email: userData.userEmail,
                phone: userData.userPhone,
            });

            // 3. Crear persona en Convex
            const personId: Id<"persons"> = await ctx.runMutation(api.trainers.mutations.createPersonInDB, {
                user_id: userId,
                name: personalData.personName,
                last_name: personalData.personLastName,
                born_date: personalData.personBornDate,
                document_type: personalData.personDocumentType,
                document_number: personalData.personDocumentNumber,
            });

            // 4. Obtener y validar branch
            const branch = await ctx.runQuery(api.trainers.mutations.getBranchByName, {
                name: workData.branch
            });

            if (!branch) {
                throw new AccessDeniedError(`La sede "${workData.branch}" no existe`);
            }

            // 5. Generar código de empleado único
            const employeeCode: string = await ctx.runMutation(api.trainers.mutations.generateEmployeeCode, {});

            // 6. Crear trainer
            const trainerId: Id<"trainers"> = await ctx.runMutation(api.trainers.mutations.createTrainerInDB, {
                person_id: personId,
                user_id: userId,
                branch_id: branch._id,
                employee_code: employeeCode,
                specialties: workData.specialties,
            });

            // 7. Asignar rol de TRAINER
            const assignedByUserId = adminCheck.user!._id;

            await ctx.runMutation(api.trainers.mutations.assignRoleInDB, {
                user_id: userId,
                role: "TRAINER",
                assigned_by_user_id: assignedByUserId,
            });

            // Enviar email de bienvenida con credenciales
            console.log("Paso 8: Enviando email de bienvenida...");
            try {
                // Verificar que la clave de Resend esté configurada
                const resendApiKey = process.env.RESEND_API_KEY;
                if (!resendApiKey) {
                    console.log("Advertencia: RESEND_API_KEY no está configurado, saltando envío de email");
                } else {
                    const resend = new Resend(resendApiKey);
                    const trainerName = `${personalData.personName} ${personalData.personLastName}`;

                    console.log(`Enviando email de bienvenida a: ${userData.userEmail}`);

                    const emailTemplate = getWelcomeTrainerEmailTemplate(
                        trainerName,
                        userData.userEmail,
                        temporaryPassword,
                        employeeCode
                    );

                    const result = await resend.emails.send({
                        from: process.env.FROM_EMAIL || 'EHC Gym <onboarding@resend.dev>',
                        to: [userData.userEmail],
                        subject: emailTemplate.subject,
                        html: emailTemplate.html,
                        text: emailTemplate.text,
                    });

                    if (result.data) {
                        console.log(`Email enviado exitosamente con ID: ${result.data.id}`);
                    } else if (result.error) {
                        console.log(`Error al enviar email:`, result.error);
                    } else {
                        console.log(`Email enviado, respuesta:`, result);
                    }
                }
            } catch (emailError) {
                console.error("Error enviando email de bienvenida:", emailError);
                // No fallar la creación del entrenador por error de email
            } return {
                success: true,
                data: {
                    trainerId,
                    personId,
                    userId,
                    clerkUserId: clerkUser.id,
                    employeeCode,
                    temporaryPassword, // Solo para desarrollo
                    message: "Entrenador creado exitosamente.",
                }
            };

        } catch (error) {
            console.error("Error creating trainer:", error);

            // Si es un error conocido, lanzarlo tal como está
            if (error instanceof AuthError || error instanceof AccessDeniedError) {
                throw error;
            }

            // Mejor manejo de errores de Clerk
            if (error && typeof error === "object" && "errors" in error) {
                const clerkError = error as any;
                if (clerkError.errors && Array.isArray(clerkError.errors) && clerkError.errors.length > 0) {
                    const firstError = clerkError.errors[0];
                    throw new Error(`Error de Clerk: ${firstError.message || firstError.longMessage || "Error desconocido"}`);
                }
            }

            // Manejo de errores estándar
            let errorMessage = "Error desconocido";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "string") {
                errorMessage = error;
            } else if (error && typeof error === "object" && "message" in error) {
                errorMessage = (error as { message: string }).message;
            } else {
                errorMessage = JSON.stringify(error);
            }

            throw new Error(`Error al crear entrenador: ${errorMessage}`);
        }
    },
});

// Mutations auxiliares para ser usadas desde la action
export const createUserInDB = mutation({
    args: {
        clerk_id: v.string(),
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<Id<"users">> => {
        return await ctx.db.insert("users", {
            clerk_id: args.clerk_id,
            name: args.name,
            email: args.email,
            phone: args.phone,
            updated_at: Date.now(),
            active: true,
        });
    },
});

export const createPersonInDB = mutation({
    args: {
        user_id: v.id("users"),
        name: v.string(),
        last_name: v.string(),
        born_date: v.string(),
        document_type: v.string(),
        document_number: v.string(),
    },
    handler: async (ctx, args): Promise<Id<"persons">> => {
        return await ctx.db.insert("persons", {
            user_id: args.user_id,
            name: args.name,
            last_name: args.last_name,
            born_date: args.born_date,
            document_type: args.document_type as any,
            document_number: args.document_number,
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true,
        });
    },
});

export const createTrainerInDB = mutation({
    args: {
        person_id: v.id("persons"),
        user_id: v.id("users"),
        branch_id: v.id("branches"),
        employee_code: v.string(),
        specialties: v.array(v.string()),
    },
    handler: async (ctx, args): Promise<Id<"trainers">> => {
        return await ctx.db.insert("trainers", {
            person_id: args.person_id,
            user_id: args.user_id,
            branch_id: args.branch_id,
            employee_code: args.employee_code,
            specialties: args.specialties,
            hire_date: Date.now(),
            status: "ACTIVE",
            created_at: Date.now(),
            updated_at: Date.now(),
        });
    },
});

export const assignRoleInDB = mutation({
    args: {
        user_id: v.id("users"),
        role: v.string(),
        assigned_by_user_id: v.id("users"),
    },
    handler: async (ctx, args): Promise<Id<"role_assignments">> => {
        return await ctx.db.insert("role_assignments", {
            user_id: args.user_id,
            role: args.role as any,
            assigned_at: Date.now(),
            assigned_by_user_id: args.assigned_by_user_id,
            active: true,
        });
    },
});

export const generateEmployeeCode = mutation({
    args: {},
    handler: async (ctx): Promise<string> => {
        const prefix = "TR";
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const employeeCode = `${prefix}${randomNum}`;

            const existing = await ctx.db
                .query("trainers")
                .withIndex("by_employee_code", (q) => q.eq("employee_code", employeeCode))
                .first();

            if (!existing) {
                return employeeCode;
            }

            attempts++;
        }

        throw new Error("No se pudo generar un código de empleado único");
    },
});

// Queries auxiliares para ser usadas desde la action
export const checkPersonByDocument = query({
    args: {
        document_number: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("persons")
            .filter((q) => q.eq(q.field("document_number"), args.document_number))
            .first();
    },
});

export const getBranchByName = query({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("branches")
            .filter((q) => q.eq(q.field("name"), args.name))
            .first();
    },
});

export const getUserByClerkId = query({
    args: {
        clerk_id: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", args.clerk_id))
            .first();
    },
});

export const checkAdminPermissions = query({
    args: {
        clerk_id: v.string(),
    },
    handler: async (ctx, args) => {
        // Buscar usuario por clerk_id
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", args.clerk_id))
            .first();

        if (!currentUser) {
            return { hasPermission: false, user: null };
        }

        // Buscar rol de admin
        const adminRole = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) => q.eq("user_id", currentUser._id).eq("active", true))
            .filter((q) => q.or(
                q.eq(q.field("role"), "ADMIN"),
                q.eq(q.field("role"), "SUPER_ADMIN")
            ))
            .first();

        return {
            hasPermission: !!adminRole,
            user: currentUser,
        };
    },
});



function generateSecurePassword(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";

    // Asegurar al menos: 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

    // Completar hasta 12 caracteres
    for (let i = 4; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Mezclar caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
}
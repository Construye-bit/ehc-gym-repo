// convex/trainers/mutations.ts
import { mutation, action, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { createClerkClient } from '@clerk/backend';
import { AuthError, AccessDeniedError, UserNotFoundError } from "./errors";
import { api } from "../_generated/api";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { Resend } from 'resend';
import { getWelcomeTrainerEmailTemplate } from '../emails/templates';
import {
    userDataSchema,
    personalDataSchema,
    workDataSchema,
    createUserSchema,
    createPersonSchema,
    createTrainerSchema,
    validateWithZod
} from './validations';

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
        // Validar datos de entrada con Zod
        const validatedUserData = validateWithZod(userDataSchema, userData, "userData");
        const validatedPersonalData = validateWithZod(personalDataSchema, personalData, "personalData");
        const validatedWorkData = validateWithZod(workDataSchema, workData, "workData");

        // Verificar autenticación y permisos de admin
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new AuthError();
        }

        // Verificar que es admin (usando clerk_id en lugar de user_id)
        const adminCheck = await ctx.runQuery(api.trainers.queries.checkAdminPermissions, {
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
                emailAddress: [validatedUserData.userEmail]
            });

            if (existingUsers.data.length > 0) {
                throw new AccessDeniedError("Ya existe un usuario con este correo electrónico");
            }

            // Verificar si el número de documento ya existe
            const existingPerson = await ctx.runQuery(api.trainers.queries.checkPersonByDocument, {
                document_number: validatedPersonalData.personDocumentNumber
            });

            if (existingPerson) {
                throw new AccessDeniedError("Ya existe una persona con este número de documento");
            }

            // 1. Crear usuario en Clerk
            const temporaryPassword = generateSecurePassword();

            const clerkUserData: any = {
                emailAddress: [validatedUserData.userEmail],
                username: validatedUserData.userName,
                firstName: validatedPersonalData.personName,
                lastName: validatedPersonalData.personLastName,
                password: temporaryPassword,
                skipPasswordChecks: true,
            };

            const clerkUser = await clerkClient.users.createUser(clerkUserData);

            // 2. Crear usuario en Convex
            const userId: Id<"users"> = await ctx.runMutation(api.trainers.mutations.createUserInDB, {
                clerk_id: clerkUser.id,
                name: `${validatedPersonalData.personName} ${validatedPersonalData.personLastName}`,
                email: validatedUserData.userEmail,
            });

            // 3. Crear persona en Convex
            const personId: Id<"persons"> = await ctx.runMutation(api.trainers.mutations.createPersonInDB, {
                user_id: userId,
                name: validatedPersonalData.personName,
                last_name: validatedPersonalData.personLastName,
                born_date: validatedPersonalData.personBornDate,
                phone: validatedUserData.userPhone,
                document_type: validatedPersonalData.personDocumentType,
                document_number: validatedPersonalData.personDocumentNumber,
            });

            // 4. Obtener y validar branch
            const branch = await ctx.runQuery(api.trainers.queries.getBranchByName, {
                name: validatedWorkData.branch
            });

            if (!branch) {
                throw new AccessDeniedError(`La sede "${validatedWorkData.branch}" no existe`);
            }

            // 4.1 Verificar que el admin tenga permisos para crear trainers en esta sede
            // Obtener el usuario actual
            const currentUser = await ctx.runQuery(api.trainers.queries.getUserByClerkId, {
                clerk_id: identity.subject
            });

            if (!currentUser) {
                throw new AccessDeniedError("Usuario no encontrado");
            }

            // Verificar si es SUPER_ADMIN
            const currentUserRoles = await ctx.runQuery(api.trainers.queries.getRolesByUserId, {
                userId: currentUser._id
            });

            const isSuperAdmin = currentUserRoles.some(role => role.role === "SUPER_ADMIN");

            // Si no es super admin, verificar que tenga la sede asignada
            if (!isSuperAdmin) {
                // Buscar la persona asociada
                const currentPerson = await ctx.runQuery(api.persons.queries.getByUserId, {
                    userId: currentUser._id
                });

                if (!currentPerson) {
                    throw new AccessDeniedError("Persona no encontrada");
                }

                // Buscar el admin asociado
                const currentAdmin = await ctx.runQuery(api.admins.queries.getByPersonId, {
                    personId: currentPerson._id
                });

                if (!currentAdmin || !currentAdmin.branch_id) {
                    throw new AccessDeniedError("Administrador no encontrado o sin sede asignada");
                }

                // Verificar que la sede del trainer sea la misma que la del admin
                if (currentAdmin.branch_id !== branch._id) {
                    throw new AccessDeniedError(`No tienes permisos para crear entrenadores en la sede "${validatedWorkData.branch}". Solo puedes crear entrenadores en tu sede asignada.`);
                }
            }

            // 5. Generar código de empleado único
            const employeeCode: string = await ctx.runMutation(api.trainers.mutations.generateEmployeeCode, {});

            // 6. Crear trainer
            const trainerId: Id<"trainers"> = await ctx.runMutation(api.trainers.mutations.createTrainerInDB, {
                person_id: personId,
                user_id: userId,
                branch_id: branch._id,
                employee_code: employeeCode,
                specialties: validatedWorkData.specialties,
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
                    const trainerName = `${validatedPersonalData.personName} ${validatedPersonalData.personLastName}`;

                    console.log(`Enviando email de bienvenida a: ${validatedUserData.userEmail}`);

                    const emailTemplate = getWelcomeTrainerEmailTemplate(
                        trainerName,
                        validatedUserData.userEmail,
                        temporaryPassword,
                        employeeCode
                    );

                    const result = await resend.emails.send({
                        from: process.env.FROM_EMAIL || 'EHC Gym <onboarding@resend.dev>',
                        to: [validatedUserData.userEmail],
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
    },
    handler: async (ctx, args): Promise<Id<"users">> => {
        // Validar datos de entrada
        const validatedData = validateWithZod(createUserSchema, args, "createUserInDB");

        return await ctx.db.insert("users", {
            clerk_id: validatedData.clerk_id,
            name: validatedData.name,
            email: validatedData.email,
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
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<Id<"persons">> => {
        // Validar datos de entrada
        const validatedData = validateWithZod(createPersonSchema, args, "createPersonInDB");

        return await ctx.db.insert("persons", {
            user_id: args.user_id,
            name: validatedData.name,
            last_name: validatedData.last_name,
            born_date: validatedData.born_date,
            document_type: validatedData.document_type as any,
            document_number: validatedData.document_number,
            phone: validatedData.phone,
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
        // Validar datos de entrada
        const validatedData = validateWithZod(createTrainerSchema, args, "createTrainerInDB");

        return await ctx.db.insert("trainers", {
            person_id: args.person_id,
            user_id: args.user_id,
            branch_id: args.branch_id,
            employee_code: validatedData.employee_code,
            specialties: validatedData.specialties,
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

// ===== MUTACIONES DE EDICIÓN =====

// Action para editar trainer completo (incluyendo actualización en Clerk)
export const updateTrainerComplete = action({
    args: {
        trainerId: v.id("trainers"),
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
    handler: async (ctx, { trainerId, userData, personalData, workData }): Promise<{
        success: boolean;
        message: string;
    }> => {
        // Validar datos de entrada con Zod
        const validatedUserData = validateWithZod(userDataSchema, userData, "userData");
        const validatedPersonalData = validateWithZod(personalDataSchema, personalData, "personalData");
        const validatedWorkData = validateWithZod(workDataSchema, workData, "workData");

        // Verificar autenticación y permisos de admin
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new AuthError();
        }

        // Verificar que es admin
        const adminCheck = await ctx.runQuery(api.trainers.queries.checkAdminPermissions, {
            clerk_id: identity.subject
        });

        if (!adminCheck.hasPermission) {
            throw new AccessDeniedError();
        }

        // Obtener datos actuales del trainer
        const currentData = await ctx.runMutation(internal.trainers.mutations.getTrainerUserData, {
            trainerId
        });

        const { trainer, person, user } = currentData;

        // Verificar permisos del admin para editar este trainer
        const currentUser = await ctx.runQuery(api.trainers.queries.getUserByClerkId, {
            clerk_id: identity.subject
        });

        if (!currentUser) {
            throw new AccessDeniedError("Usuario no encontrado");
        }

        // Verificar si es SUPER_ADMIN
        const currentUserRoles = await ctx.runQuery(api.trainers.queries.getRolesByUserId, {
            userId: currentUser._id
        });

        const isSuperAdmin = currentUserRoles.some(role => role.role === "SUPER_ADMIN");

        // Si no es super admin, verificar que el trainer esté en su sede
        if (!isSuperAdmin && trainer.branch_id) {
            const currentPerson = await ctx.runQuery(api.persons.queries.getByUserId, {
                userId: currentUser._id
            });

            if (!currentPerson) {
                throw new AccessDeniedError("Persona no encontrada");
            }

            const currentAdmin = await ctx.runQuery(api.admins.queries.getByPersonId, {
                personId: currentPerson._id
            });

            if (!currentAdmin || !currentAdmin.branch_id) {
                throw new AccessDeniedError("Administrador no encontrado o sin sede asignada");
            }

            if (currentAdmin.branch_id !== trainer.branch_id) {
                throw new AccessDeniedError("No tienes permisos para editar este entrenador");
            }
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
            // No se permite cambiar el email - mantener el email original
            // if (validatedUserData.userEmail !== user.email) {
            //     const existingUsers = await clerkClient.users.getUserList({
            //         emailAddress: [validatedUserData.userEmail]
            //     });

            //     if (existingUsers.data.length > 0) {
            //         throw new AccessDeniedError("Ya existe otro usuario con este correo electrónico");
            //     }
            // }

            // Verificar si el nuevo número de documento ya existe (solo si cambió)
            if (validatedPersonalData.personDocumentNumber !== person.document_number) {
                const existingPerson = await ctx.runQuery(api.trainers.queries.checkPersonByDocument, {
                    document_number: validatedPersonalData.personDocumentNumber
                });

                if (existingPerson && existingPerson._id !== person._id) {
                    throw new AccessDeniedError("Ya existe otra persona con este número de documento");
                }
            }

            // 1. Actualizar usuario en Clerk (solo nombre y apellido, no email ni username)
            const clerkUpdateData: any = {
                firstName: validatedPersonalData.personName,
                lastName: validatedPersonalData.personLastName,
            };

            // No se permite actualizar email ni username en edición
            // Solo actualizar nombre y apellido

            await clerkClient.users.updateUser(user.clerk_id, clerkUpdateData);

            // 2. Actualizar usuario en Convex (mantener el email original)
            await ctx.runMutation(internal.trainers.mutations.updateUserInDB, {
                userId: user._id,
                name: `${validatedPersonalData.personName} ${validatedPersonalData.personLastName}`,
                email: user.email, // Mantener el email original
            });

            // 3. Actualizar persona en Convex
            await ctx.runMutation(internal.trainers.mutations.updatePersonInDB, {
                personId: person._id,
                name: validatedPersonalData.personName,
                last_name: validatedPersonalData.personLastName,
                born_date: validatedPersonalData.personBornDate,
                phone: validatedUserData.userPhone,
                document_type: validatedPersonalData.personDocumentType,
                document_number: validatedPersonalData.personDocumentNumber,
            });

            // 4. Obtener y validar nueva branch (solo si cambió)
            if (!trainer.branch_id) {
                throw new Error("El entrenador no tiene una sede asignada");
            }

            const currentBranch = await ctx.runQuery(api.trainers.queries.getBranchById, {
                branchId: trainer.branch_id
            });

            let newBranchId = trainer.branch_id;
            if (validatedWorkData.branch !== currentBranch?.name) {
                const newBranch = await ctx.runQuery(api.trainers.queries.getBranchByName, {
                    name: validatedWorkData.branch
                });

                if (!newBranch) {
                    throw new AccessDeniedError(`La sede "${validatedWorkData.branch}" no existe`);
                }

                // Si no es super admin, verificar que la nueva sede sea la misma que su sede asignada
                if (!isSuperAdmin) {
                    const currentPerson = await ctx.runQuery(api.persons.queries.getByUserId, {
                        userId: currentUser._id
                    });

                    if (!currentPerson) {
                        throw new AccessDeniedError("Persona no encontrada");
                    }

                    const currentAdmin = await ctx.runQuery(api.admins.queries.getByPersonId, {
                        personId: currentPerson._id
                    });

                    if (!currentAdmin || !currentAdmin.branch_id) {
                        throw new AccessDeniedError("Administrador no encontrado o sin sede asignada");
                    }

                    if (currentAdmin.branch_id !== newBranch._id) {
                        throw new AccessDeniedError("No puedes cambiar el entrenador a una sede diferente a la tuya");
                    }
                }

                newBranchId = newBranch._id;
            }

            // 5. Actualizar trainer - solo si newBranchId no es undefined
            if (newBranchId) {
                await ctx.runMutation(internal.trainers.mutations.updateTrainerInDB, {
                    trainerId: trainer._id,
                    branch_id: newBranchId,
                    specialties: validatedWorkData.specialties,
                });
            } else {
                throw new Error("No se pudo determinar la sede del entrenador");
            }

            return {
                success: true,
                message: `Entrenador ${validatedPersonalData.personName} ${validatedPersonalData.personLastName} actualizado exitosamente`
            };

        } catch (error) {
            console.error("Error updating trainer:", error);

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

            throw new Error(`Error al actualizar entrenador: ${errorMessage}`);
        }
    },
});

// Mutaciones internas auxiliares para actualización
export const updateUserInDB = internalMutation({
    args: {
        userId: v.id("users"),
        name: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            name: args.name,
            email: args.email,
            updated_at: Date.now(),
        });
        return { success: true };
    },
});

export const updatePersonInDB = internalMutation({
    args: {
        personId: v.id("persons"),
        name: v.string(),
        last_name: v.string(),
        born_date: v.string(),
        document_type: v.string(),
        document_number: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.personId, {
            name: args.name,
            last_name: args.last_name,
            born_date: args.born_date,
            document_type: args.document_type as any,
            document_number: args.document_number,
            phone: args.phone,
            updated_at: Date.now(),
        });
        return { success: true };
    },
});

export const updateTrainerInDB = internalMutation({
    args: {
        trainerId: v.id("trainers"),
        branch_id: v.id("branches"),
        specialties: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.trainerId, {
            branch_id: args.branch_id,
            specialties: args.specialties,
            updated_at: Date.now(),
        });
        return { success: true };
    },
});

// ===== MUTACIONES DE ELIMINACIÓN =====

// Action para borrar trainer completamente (usando action para manejar Clerk)
export const deleteTrainerComplete = action({
    args: {
        trainerId: v.id("trainers"),
    },
    handler: async (ctx, { trainerId }): Promise<{
        success: boolean;
        message: string;
    }> => {
        // Verificar autenticación y permisos usando queries
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new AuthError("No autenticado");
        }

        // Verificar permisos de admin
        const adminCheck = await ctx.runQuery(api.trainers.queries.checkAdminPermissions, {
            clerk_id: identity.subject
        });

        if (!adminCheck.hasPermission) {
            throw new AccessDeniedError();
        }

        // Obtener datos completos del trainer
        const userData = await ctx.runMutation(internal.trainers.mutations.getTrainerUserData, {
            trainerId
        });

        const { trainer, person, user } = userData;

        // Verificar permisos del admin para eliminar este trainer
        const currentUser = await ctx.runQuery(api.trainers.queries.getUserByClerkId, {
            clerk_id: identity.subject
        });

        if (!currentUser) {
            throw new AccessDeniedError("Usuario no encontrado");
        }

        // Verificar si es SUPER_ADMIN
        const currentUserRoles = await ctx.runQuery(api.trainers.queries.getRolesByUserId, {
            userId: currentUser._id
        });

        const isSuperAdmin = currentUserRoles.some(role => role.role === "SUPER_ADMIN");

        // Si no es super admin, verificar que el trainer esté en su sede
        if (!isSuperAdmin && trainer.branch_id) {
            const currentPerson = await ctx.runQuery(api.persons.queries.getByUserId, {
                userId: currentUser._id
            });

            if (!currentPerson) {
                throw new AccessDeniedError("Persona no encontrada");
            }

            const currentAdmin = await ctx.runQuery(api.admins.queries.getByPersonId, {
                personId: currentPerson._id
            });

            if (!currentAdmin || !currentAdmin.branch_id) {
                throw new AccessDeniedError("Administrador no encontrado o sin sede asignada");
            }

            if (currentAdmin.branch_id !== trainer.branch_id) {
                throw new AccessDeniedError("No tienes permisos para eliminar este entrenador");
            }
        }

        try {
            // PASO 1: ELIMINAR DE CLERK PRIMERO (con máxima prioridad)
            const clerkSecretKey = process.env.CLERK_SECRET_KEY;
            let clerkDeletionSuccess = false;

            if (!clerkSecretKey) {
                console.error('CLERK_SECRET_KEY no configurado - esto es REQUERIDO para eliminar usuarios');
                throw new Error("Configuración de Clerk faltante - no se puede eliminar usuario");
            }

            console.log(`=== INICIANDO ELIMINACIÓN DE CLERK ===`);
            console.log(`Clerk ID: ${user.clerk_id}`);
            console.log(`Email: ${user.email}`);

            const clerkClient = createClerkClient({
                secretKey: clerkSecretKey
            });

            try {
                // Verificar si el usuario existe en Clerk antes de eliminarlo
                console.log('Verificando existencia del usuario en Clerk...');
                const clerkUser = await clerkClient.users.getUser(user.clerk_id);
                console.log(`✅ Usuario encontrado en Clerk: ${clerkUser.emailAddresses[0]?.emailAddress}`);

                // Eliminar el usuario de Clerk usando el método deleteUser del SDK
                console.log(`Eliminando usuario de Clerk con ID: ${user.clerk_id}...`);
                const deleteResponse = await clerkClient.users.deleteUser(user.clerk_id);
                console.log('✅ Usuario eliminado de Clerk exitosamente:', deleteResponse.id);
                clerkDeletionSuccess = true;

            } catch (clerkError: any) {
                console.error('❌ ERROR ELIMINANDO DE CLERK:', {
                    message: clerkError?.message || 'Sin mensaje',
                    status: clerkError?.status || 'Sin status',
                    code: clerkError?.code || 'Sin código',
                    details: clerkError?.errors || 'Sin detalles',
                    clerk_id: user.clerk_id
                });

                // Si el error es "not found", considerarlo como éxito
                if (clerkError?.status === 404 || clerkError?.message?.includes('not_found')) {
                    console.log('✅ Usuario no encontrado en Clerk (ya eliminado)');
                    clerkDeletionSuccess = true;
                } else {
                    // Para otros errores, fallar la operación
                    throw new Error(`Fallo crítico en Clerk: ${clerkError?.message || 'Error desconocido'}`);
                }
            }

            // PASO 2: SI CLERK FUNCIONÓ, ELIMINAR DE CONVEX
            if (clerkDeletionSuccess) {
                console.log('=== INICIANDO ELIMINACIÓN DE CONVEX ===');

                // Eliminar datos de Convex usando mutaciones internas
                await ctx.runMutation(internal.trainers.mutations.deleteTrainerInternal, { trainerId });
                console.log('✅ Trainer eliminado');

                // Eliminar persona usando mutation interna
                await ctx.runMutation(internal.trainers.mutations.deletePersonInternal, { personId: trainer.person_id });
                console.log('✅ Persona eliminada');

                // Eliminar roles y usuario usando mutation interna
                await ctx.runMutation(internal.trainers.mutations.deleteUserAndRoles, { userId: user._id });
            }

            return {
                success: true,
                message: `Entrenador ${person.name} ${person.last_name} eliminado completamente del sistema`
            };
        } catch (error) {
            console.error('Error al eliminar entrenador:', error);
            throw new Error(`Error al eliminar entrenador: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
});

// Mutaciones internas para eliminación
export const deleteTrainerInternal = internalMutation({
    args: {
        trainerId: v.id("trainers"),
    },
    handler: async (ctx, { trainerId }) => {
        await ctx.db.delete(trainerId);
        return { success: true };
    }
});

export const deleteRoleAssignment = internalMutation({
    args: {
        roleId: v.id("role_assignments"),
    },
    handler: async (ctx, { roleId }) => {
        await ctx.db.delete(roleId);
        return { success: true };
    }
});

export const getTrainerUserData = internalMutation({
    args: {
        trainerId: v.id("trainers"),
    },
    handler: async (ctx, { trainerId }) => {
        // Obtener trainer
        const trainer = await ctx.db.get(trainerId);
        if (!trainer) {
            throw new Error("Entrenador no encontrado");
        }

        // Obtener persona
        const person = await ctx.db.get(trainer.person_id);
        if (!person) {
            throw new Error("Persona no encontrada");
        }

        // Obtener usuario
        const user = await ctx.db.get(person.user_id);
        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        return {
            trainer,
            person,
            user
        };
    }
});

export const deletePersonInternal = internalMutation({
    args: {
        personId: v.id("persons"),
    },
    handler: async (ctx, { personId }) => {
        await ctx.db.delete(personId);
        return { success: true };
    }
});

export const deleteUserAndRoles = internalMutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        // Eliminar roles del usuario
        const userRoles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", userId).eq("active", true)
            )
            .collect();

        for (const role of userRoles) {
            await ctx.db.delete(role._id);
        }

        // Eliminar usuario
        await ctx.db.delete(userId);

        return { success: true };
    }
});
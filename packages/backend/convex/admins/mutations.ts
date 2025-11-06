import { mutation, action, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";
import { requireSuperAdmin } from "../branches/utils";
import { createClerkClient } from '@clerk/backend';
import { api } from "../_generated/api";
import { internal } from "../_generated/api";
import {
    createAdminSchema,
    assignAdminToBranchSchema,
    revokeAdminFromBranchSchema,
    updateAdminStatusSchema,
    validateWithZod,
} from "./validations";

// Crea un admin (sin sede). Solo SUPER_ADMIN.
export const createAdmin = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        const data = validateWithZod(createAdminSchema, args.payload, "createAdmin");
        const current = await mustGetCurrentUser(ctx);

        const now = Date.now();
        const adminId = await ctx.db.insert("admins", {
            person_id: data.person_id as Id<"persons">,
            user_id: data.user_id ? (data.user_id as Id<"users">) : undefined,
            branch_id: undefined,
            status: "ACTIVE",
            created_by_user_id: current._id as Id<"users">,
            created_at: now,
            updated_at: now,
            active: true,
        });

        return adminId;
    },
});

// Asigna admin a sede (1:1). Solo SUPER_ADMIN.
export const assignAdminToBranch = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        const data = validateWithZod(assignAdminToBranchSchema, args.payload, "assignAdminToBranch");
        const adminId = data.admin_id as Id<"admins">;
        const branchId = data.branch_id as Id<"branches">;

        const admin = await ctx.db.get(adminId);
        if (!admin || admin.active !== true) {
            throw new Error("Admin no encontrado o inactivo.");
        }

        // Enforce 1:1: la branch no debe tener otro admin asignado activo
        const already = await ctx.db
            .query("admins")
            .withIndex("by_branch", (q) => q.eq("branch_id", branchId))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (already && already._id !== adminId) {
            throw new Error("La sede ya tiene un administrador asignado.");
        }

        await ctx.db.patch(adminId, { branch_id: branchId, updated_at: Date.now() });
        return adminId;
    },
});

// Quita la sede del admin. Solo SUPER_ADMIN.
export const revokeAdminFromBranch = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        const data = validateWithZod(revokeAdminFromBranchSchema, args.payload, "revokeAdminFromBranch");
        const adminId = data.admin_id as Id<"admins">;

        const admin = await ctx.db.get(adminId);
        if (!admin || admin.active !== true) {
            throw new Error("Admin no encontrado o inactivo.");
        }

        await ctx.db.patch(adminId, { branch_id: undefined, updated_at: Date.now() });
        return adminId;
    },
});

// Actualiza estado del admin. Solo SUPER_ADMIN.
export const updateAdminStatus = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);
        const data = validateWithZod(updateAdminStatusSchema, args.payload, "updateAdminStatus");

        const adminId = data.admin_id as Id<"admins">;
        const admin = await ctx.db.get(adminId);
        if (!admin) throw new Error("Admin no encontrado.");

        await ctx.db.patch(adminId, { status: data.status, updated_at: Date.now() });
        return adminId;
    },
});

// === Crear administrador completo (user + person + admin + role_assignment) ===
export const createAdministratorComplete = action({
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
            branchId: v.optional(v.string()),
        }),
    },
    handler: async (ctx, { userData, personalData, workData }): Promise<{
        success: boolean;
        data: {
            adminId: Id<"admins">;
            personId: Id<"persons">;
            userId: Id<"users">;
            clerkUserId: string;
            temporaryPassword?: string;
            message: string;
        };
    }> => {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
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
                throw new Error("Ya existe un usuario con este correo electrónico");
            }

            // Verificar si el número de documento ya existe
            const existingPerson = await ctx.runQuery(api.admins.queries.checkPersonByDocument, {
                document_number: personalData.personDocumentNumber,
                document_type: personalData.personDocumentType
            });

            if (existingPerson) {
                throw new Error("Ya existe una persona con este número de documento");
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

            let clerkUser;
            try {
                clerkUser = await clerkClient.users.createUser(clerkUserData);
            } catch (clerkError: any) {
                // Handle race condition: if email was created between check and creation
                if (clerkError.errors && Array.isArray(clerkError.errors)) {
                    const duplicateEmailError = clerkError.errors.find(
                        (err: any) => err.code === 'form_identifier_exists' || err.message?.includes('email')
                    );
                    if (duplicateEmailError) {
                        throw new Error("Ya existe un usuario con este correo electrónico");
                    }
                }
                throw clerkError;
            }

            // 2. Crear usuario en Convex
            const userId: Id<"users"> = await ctx.runMutation(internal.admins.mutations.createUserInDB, {
                clerk_id: clerkUser.id,
                name: `${personalData.personName} ${personalData.personLastName}`,
                email: userData.userEmail,
            });

            // 3. Crear persona en Convex
            const personId: Id<"persons"> = await ctx.runMutation(internal.admins.mutations.createPersonInDB, {
                user_id: userId,
                name: personalData.personName,
                last_name: personalData.personLastName,
                born_date: personalData.personBornDate,
                phone: userData.userPhone,
                document_type: personalData.personDocumentType,
                document_number: personalData.personDocumentNumber,
            });

            // 4. Crear admin
            const adminId: Id<"admins"> = await ctx.runMutation(internal.admins.mutations.createAdminInDB, {
                person_id: personId,
                user_id: userId,
                branch_id: workData.branchId as Id<"branches"> | undefined,
            });

            // 5. Asignar rol de ADMIN
            await ctx.runMutation(internal.admins.mutations.assignRoleInDB, {
                user_id: userId,
                role: "ADMIN",
                branch_id: workData.branchId as Id<"branches"> | undefined,
            });

            // 6. Enviar email de bienvenida con credenciales
            console.log("Enviando email de bienvenida al administrador...");
            try {
                const adminName = `${personalData.personName} ${personalData.personLastName}`;

                await ctx.scheduler.runAfter(0, internal.emails.sender.sendWelcomeAdminEmail, {
                    adminName,
                    email: userData.userEmail,
                    temporaryPassword,
                });
            } catch (emailError) {
                console.error("Error enviando email de bienvenida:", emailError);
                // No fallar la creación del administrador por error de email
            }

            return {
                success: true,
                data: {
                    adminId,
                    personId,
                    userId,
                    clerkUserId: clerkUser.id,
                    ...(process.env.NODE_ENV === 'development' && { temporaryPassword }),
                    message: "Administrador creado exitosamente.",
                }
            };

        } catch (error) {
            console.error("Error creating administrator:", error);

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

            throw new Error(`Error al crear administrador: ${errorMessage}`);
        }
    },
});

// === Actualizar administrador completo ===
export const updateAdministratorComplete = action({
    args: {
        administratorId: v.id("admins"),
        userData: v.object({
            name: v.string(),
            email: v.string(),
            phone: v.string(),
        }),
        personalData: v.object({
            name: v.string(),
            last_name: v.string(),
            document_type: v.string(),
            document_number: v.string(),
            born_date: v.string(),
        }),
        workData: v.object({
            branchId: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        // Verify authentication
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const clerkSecretKey = process.env.CLERK_SECRET_KEY;
        if (!clerkSecretKey) {
            throw new Error("CLERK_SECRET_KEY no está configurado en las variables de entorno");
        }

        const clerkClient = createClerkClient({
            secretKey: clerkSecretKey
        });

        try {
            // Run the internal mutation to update the database
            const result = await ctx.runMutation(internal.admins.mutations.updateAdministratorInDB, {
                administratorId: args.administratorId,
                userData: args.userData,
                personalData: args.personalData,
                workData: args.workData,
            });

            // Update Clerk user to maintain consistency
            if (result.clerkId) {
                try {
                    const updateData: any = {
                        firstName: args.personalData.name,
                        lastName: args.personalData.last_name,
                    };

                    // Note: Changing primary email is complex in Clerk
                    // It requires creating a new email address and setting it as primary
                    // For now, we'll only update name fields
                    // Email updates should be handled separately with proper email verification

                    await clerkClient.users.updateUser(result.clerkId, updateData);
                } catch (clerkError) {
                    console.error("Failed to update Clerk user:", clerkError);
                    // Log but don't fail the entire update
                    // The database has been updated successfully
                }
            }

            return {
                success: true,
                message: "Administrador actualizado exitosamente",
            };
        } catch (error) {
            console.error("Error al actualizar administrador:", error);
            throw new Error("Error al actualizar el administrador: " + (error instanceof Error ? error.message : "Error desconocido"));
        }
    },
});

// === Eliminar administrador completo ===
export const deleteAdministratorComplete = action({
    args: {
        administratorId: v.id("admins"),
    },
    handler: async (ctx, args) => {
        // Verify authentication
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const clerkSecretKey = process.env.CLERK_SECRET_KEY;
        if (!clerkSecretKey) {
            throw new Error("CLERK_SECRET_KEY no está configurado en las variables de entorno");
        }

        const clerkClient = createClerkClient({
            secretKey: clerkSecretKey
        });

        try {
            // Run the internal mutation to delete from database
            const result = await ctx.runMutation(internal.admins.mutations.deleteAdministratorInDB, {
                administratorId: args.administratorId,
            });

            // Deactivate the Clerk user
            if (result.clerkId) {
                try {
                    // Option 1: Delete the user completely
                    await clerkClient.users.deleteUser(result.clerkId);

                    // Option 2: Ban the user (soft delete) - uncomment to use instead
                    // await clerkClient.users.updateUser(result.clerkId, { 
                    //     banned: true 
                    // });
                } catch (clerkError) {
                    console.error("Failed to deactivate Clerk user:", clerkError);
                    throw new Error("Failed to fully delete administrator - Clerk user removal failed");
                }
            }

            return {
                success: true,
                message: "Administrador eliminado exitosamente",
            };
        } catch (error) {
            console.error("Error al eliminar administrador:", error);
            throw new Error("Error al eliminar el administrador: " + (error instanceof Error ? error.message : "Error desconocido"));
        }
    },
});

// ===== MUTACIONES INTERNAS AUXILIARES =====

export const createUserInDB = internalMutation({
    args: {
        clerk_id: v.string(),
        name: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args): Promise<Id<"users">> => {
        return await ctx.db.insert("users", {
            clerk_id: args.clerk_id,
            name: args.name,
            email: args.email,
            updated_at: Date.now(),
            active: true,
        });
    },
});

export const createPersonInDB = internalMutation({
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
        return await ctx.db.insert("persons", {
            user_id: args.user_id,
            name: args.name,
            last_name: args.last_name,
            born_date: args.born_date,
            document_type: args.document_type as any,
            document_number: args.document_number,
            phone: args.phone,
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true,
        });
    },
});

export const createAdminInDB = internalMutation({
    args: {
        person_id: v.id("persons"),
        user_id: v.id("users"),
        branch_id: v.optional(v.id("branches")),
    },
    handler: async (ctx, args): Promise<Id<"admins">> => {
        // Obtener el usuario actual para assigned_by
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .first();

        if (!currentUser) {
            throw new Error("Usuario actual no encontrado");
        }

        const now = Date.now();
        return await ctx.db.insert("admins", {
            person_id: args.person_id,
            user_id: args.user_id,
            branch_id: args.branch_id,
            status: "ACTIVE",
            created_by_user_id: currentUser._id,
            created_at: now,
            updated_at: now,
            active: true,
        });
    },
});

export const assignRoleInDB = internalMutation({
    args: {
        user_id: v.id("users"),
        role: v.string(),
        branch_id: v.optional(v.id("branches")),
    },
    handler: async (ctx, args): Promise<Id<"role_assignments">> => {
        // Obtener el usuario actual para assigned_by
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .first();

        if (!currentUser) {
            throw new Error("Usuario actual no encontrado");
        }

        return await ctx.db.insert("role_assignments", {
            user_id: args.user_id,
            role: args.role as any,
            branch_id: args.branch_id,
            assigned_at: Date.now(),
            assigned_by_user_id: currentUser._id,
            active: true,
        });
    },
});

export const updateAdministratorInDB = internalMutation({
    args: {
        administratorId: v.id("admins"),
        userData: v.object({
            name: v.string(),
            email: v.string(),
            phone: v.string(),
        }),
        personalData: v.object({
            name: v.string(),
            last_name: v.string(),
            document_type: v.string(),
            document_number: v.string(),
            born_date: v.string(),
        }),
        workData: v.object({
            branchId: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args): Promise<{ clerkId: string | null }> => {
        // Verify user has SUPER_ADMIN role
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .first();

        if (!currentUser) {
            throw new Error("Usuario actual no encontrado");
        }

        // Check for SUPER_ADMIN role
        const superAdminRole = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_role", (q) => q.eq("user_id", currentUser._id).eq("role", "SUPER_ADMIN"))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!superAdminRole) {
            throw new Error("No autorizado: Se requiere rol SUPER_ADMIN");
        }

        const now = Date.now();
        let clerkId: string | null = null;

        // 1. Obtener admin
        const admin = await ctx.db.get(args.administratorId);
        if (!admin) {
            throw new Error("Administrador no encontrado");
        }

        // 2. Actualizar usuario y obtener clerk_id
        if (admin.user_id) {
            const user = await ctx.db.get(admin.user_id);
            clerkId = user?.clerk_id || null;

            await ctx.db.patch(admin.user_id, {
                name: args.userData.name,
                email: args.userData.email,
                updated_at: now,
            });
        }

        // 3. Actualizar persona
        if (admin.person_id) {
            await ctx.db.patch(admin.person_id, {
                name: args.personalData.name,
                last_name: args.personalData.last_name,
                born_date: args.personalData.born_date,
                document_type: args.personalData.document_type as "CC" | "TI" | "CE" | "PASSPORT",
                document_number: args.personalData.document_number,
                phone: args.userData.phone,
                updated_at: now,
            });
        }

        // 4. Actualizar admin
        await ctx.db.patch(args.administratorId, {
            branch_id: args.workData.branchId ? (args.workData.branchId as Id<"branches">) : undefined,
            updated_at: now,
        });

        // 5. Actualizar role_assignment
        if (admin.user_id) {
            const userId = admin.user_id;
            const roleAssignment = await ctx.db
                .query("role_assignments")
                .withIndex("by_user_role", (q) => q.eq("user_id", userId).eq("role", "ADMIN"))
                .filter((q) => q.eq(q.field("active"), true))
                .first();

            if (roleAssignment) {
                await ctx.db.patch(roleAssignment._id, {
                    branch_id: args.workData.branchId ? (args.workData.branchId as Id<"branches">) : undefined,
                });
            }
        }

        return { clerkId };
    },
});

export const deleteAdministratorInDB = internalMutation({
    args: {
        administratorId: v.id("admins"),
    },
    handler: async (ctx, args): Promise<{ clerkId: string | null }> => {
        // Verify user has SUPER_ADMIN role
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .first();

        if (!currentUser) {
            throw new Error("Usuario actual no encontrado");
        }

        // Check for SUPER_ADMIN role
        const superAdminRole = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_role", (q) => q.eq("user_id", currentUser._id).eq("role", "SUPER_ADMIN"))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!superAdminRole) {
            throw new Error("No autorizado: Se requiere rol SUPER_ADMIN");
        }

        const now = Date.now();
        let clerkId: string | null = null;

        // 1. Obtener admin
        const admin = await ctx.db.get(args.administratorId);
        if (!admin) {
            throw new Error("Administrador no encontrado");
        }

        // 2. Obtener clerk_id antes de desactivar
        if (admin.user_id) {
            const user = await ctx.db.get(admin.user_id);
            clerkId = user?.clerk_id || null;
        }

        // 3. Desactivar admin (soft delete)
        await ctx.db.patch(args.administratorId, {
            active: false,
            status: "INACTIVE",
            updated_at: now,
        });

        // 4. Desactivar usuario
        if (admin.user_id) {
            await ctx.db.patch(admin.user_id, {
                active: false,
                updated_at: now,
            });
        }

        // 5. Desactivar persona
        if (admin.person_id) {
            await ctx.db.patch(admin.person_id, {
                active: false,
                updated_at: now,
            });
        }

        // 6. Desactivar role_assignments
        if (admin.user_id) {
            const userId = admin.user_id;
            const roleAssignments = await ctx.db
                .query("role_assignments")
                .withIndex("by_user_active", (q) => q.eq("user_id", userId).eq("active", true))
                .collect();

            for (const roleAssignment of roleAssignments) {
                await ctx.db.patch(roleAssignment._id, {
                    active: false,
                });
            }
        }

        return { clerkId };
    },
});

// ===== FUNCIONES AUXILIARES =====

function generateSecurePassword(): string {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*";
    const allChars = uppercase + lowercase + digits + symbols;

    // Use crypto for secure random generation
    const getRandomChar = (chars: string): string => {
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        return chars[randomValues[0] % chars.length];
    };

    // Ensure at least one of each required character type
    let password = [
        getRandomChar(uppercase),
        getRandomChar(lowercase),
        getRandomChar(digits),
        getRandomChar(symbols)
    ];

    // Fill remaining characters
    for (let i = 4; i < 12; i++) {
        password.push(getRandomChar(allChars));
    }

    // Shuffle using Fisher-Yates with crypto
    for (let i = password.length - 1; i > 0; i--) {
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        const j = randomValues[0] % (i + 1);
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
}

import { mutation, action, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";
import {
    createClientSchema,
    updateClientSchema,
    setClientPaymentActiveSchema,
    validateWithZod,
} from "./validations";
import { assertClientUniquePerson } from "./utils";
import { getCurrentActiveAdmin } from "../admins/utils";
import { createClerkClient } from '@clerk/backend';
import { api } from "../_generated/api";
import { internal } from "../_generated/api";

// Helper: usuario actual es SUPER_ADMIN?
async function isSuperAdmin(ctx: any): Promise<boolean> {
    const user = await mustGetCurrentUser(ctx);
    const roles = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q: any) => q.eq("user_id", user._id).eq("active", true))
        .collect();
    return roles.some((r: any) => r.role === "SUPER_ADMIN");
}

// Crea cliente. Requiere: SUPER_ADMIN o ADMIN.
export const createClient = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const user = await mustGetCurrentUser(ctx);

        // permitir si es super_admin o si tiene un admin activo (cualquier branch)
        let allowed = await isSuperAdmin(ctx);
        if (!allowed) {
            const admin = await getCurrentActiveAdmin(ctx);
            if (admin) allowed = true;
        }
        if (!allowed) {
            throw new Error("Acceso denegado: requiere rol ADMIN o SUPER_ADMIN.");
        }

        const data = validateWithZod(createClientSchema, args.payload, "createClient");
        await assertClientUniquePerson(ctx, data.person_id as Id<"persons">);

        const now = Date.now();
        const clientId = await ctx.db.insert("clients", {
            person_id: data.person_id as Id<"persons">,
            user_id: data.user_id ? (data.user_id as Id<"users">) : undefined,
            status: data.status,
            is_payment_active: data.is_payment_active,
            join_date: data.join_date,
            end_date: data.end_date,
            created_by_user_id: user._id as Id<"users">,
            created_at: now,
            updated_at: now,
            active: true,
        });

        return clientId;
    },
});

// Actualiza cliente. Requiere ADMIN de alguna branch a la que el cliente esté vinculado.
export const updateClient = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(updateClientSchema, args.payload, "updateClient");
        const clientId = data.client_id as Id<"clients">;

        const client = await ctx.db.get(clientId);
        if (!client || client.active !== true) throw new Error("Cliente no encontrado o inactivo.");

        // Debe ser ADMIN de una branch relacionada al cliente
        const admin = await getCurrentActiveAdmin(ctx);
        if (!admin || !admin.branch_id) {
            throw new Error("Acceso denegado: requiere ADMIN asignado a una sede.");
        }

        const link = await ctx.db
            .query("client_branches")
            .withIndex("by_client", (q) => q.eq("client_id", clientId))
            .filter((q) => q.eq(q.field("branch_id"), admin.branch_id as Id<"branches">))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!link) {
            throw new Error("Acceso denegado: el cliente no pertenece a la sede del ADMIN.");
        }

        const patch: any = {};
        if (data.status !== undefined) patch.status = data.status;
        if (data.is_payment_active !== undefined) patch.is_payment_active = data.is_payment_active;
        if (data.join_date !== undefined) patch.join_date = data.join_date;
        if (data.end_date !== undefined) patch.end_date = data.end_date;
        patch.updated_at = Date.now();

        await ctx.db.patch(clientId, patch);
        return clientId;
    },
});

// Cambia flag de pago activo. Requiere ADMIN de la sede a la que pertenece el cliente.
export const setClientPaymentActive = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(setClientPaymentActiveSchema, args.payload, "setClientPaymentActive");
        const clientId = data.client_id as Id<"clients">;

        const admin = await getCurrentActiveAdmin(ctx);
        if (!admin || !admin.branch_id) throw new Error("Requiere ADMIN asignado a una sede.");

        const link = await ctx.db
            .query("client_branches")
            .withIndex("by_client", (q) => q.eq("client_id", clientId))
            .filter((q) => q.eq(q.field("branch_id"), admin.branch_id as Id<"branches">))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!link) throw new Error("El cliente no pertenece a su sede.");

        await ctx.db.patch(clientId, { is_payment_active: data.is_payment_active, updated_at: Date.now() });
        return clientId;
    },
});

/**
 * Mutation para actualizar únicamente el estado de pago de un cliente
 * 
 * Características:
 * - Solo actualiza el campo is_payment_active
 * - Retorna el estado actualizado completo
 * - Valida permisos según el rol del usuario
 * 
 * Permisos:
 * - SUPER_ADMIN: Acceso total
 * - ADMIN: Solo clientes de su sede
 * 
 * @returns Objeto con el estado de pago actualizado
 */
export const updateClientPaymentStatus = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(setClientPaymentActiveSchema, args.payload, "updateClientPaymentStatus");
        const clientId = data.client_id as Id<"clients">;

        // Verificar que el cliente existe y está activo
        const client = await ctx.db.get(clientId);
        if (!client || !client.active) {
            throw new Error("Cliente no encontrado o inactivo.");
        }

        // Verificar si es SUPER_ADMIN
        if (await isSuperAdmin(ctx)) {
            await ctx.db.patch(clientId, {
                is_payment_active: data.is_payment_active,
                updated_at: Date.now()
            });

            const updatedClient = await ctx.db.get(clientId);
            return {
                client_id: updatedClient!._id,
                is_payment_active: updatedClient!.is_payment_active,
                status: updatedClient!.status,
                updated_at: updatedClient!.updated_at,
            };
        }

        // Si es ADMIN, verificar que el cliente pertenezca a su sede
        const admin = await getCurrentActiveAdmin(ctx);
        if (!admin || !admin.branch_id) {
            throw new Error("Acceso denegado: requiere ADMIN asignado a una sede.");
        }

        const link = await ctx.db
            .query("client_branches")
            .withIndex("by_client", (q) => q.eq("client_id", clientId))
            .filter((q) => q.eq(q.field("branch_id"), admin.branch_id as Id<"branches">))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!link) {
            throw new Error("Acceso denegado: el cliente no pertenece a la sede del ADMIN.");
        }

        // Actualizar el estado de pago
        await ctx.db.patch(clientId, {
            is_payment_active: data.is_payment_active,
            updated_at: Date.now()
        });

        const updatedClient = await ctx.db.get(clientId);
        return {
            client_id: updatedClient!._id,
            is_payment_active: updatedClient!.is_payment_active,
            status: updatedClient!.status,
            updated_at: updatedClient!.updated_at,
        };
    },
});

/**
 * Mutation para registrar un cliente completo en el sistema
 * Este proceso incluye:
 * 1. El usuario ya está creado en Clerk (y por webhook en Convex)
 * 2. Crear la persona (con verificación de duplicados)
 * 3. Crear el contacto de emergencia
 * 4. Crear el cliente (idempotente)
 * 
 * Características:
 * - Validación de campos requeridos
 * - Idempotencia: retorna registros existentes si ya existen
 * - Manejo de errores con compensación (rollback manual)
 * - Evita personas y clientes duplicados
 */
export const registerClient = mutation({
    args: {
        clerk_user_id: v.string(),
        // Datos de la persona
        name: v.string(),
        last_name: v.string(),
        phone: v.string(),
        born_date: v.string(),
        document_type: v.union(
            v.literal("CC"),
            v.literal("TI"),
            v.literal("CE"),
            v.literal("PASSPORT")
        ),
        document_number: v.string(),
        // Datos del contacto de emergencia
        emergency_contact_name: v.string(),
        emergency_contact_phone: v.string(),
        emergency_contact_relationship: v.string(),
        // Sede seleccionada
        branch_id: v.id("branches"),
    },
    handler: async (ctx, args) => {
        // Validación de campos requeridos
        if (!args.clerk_user_id?.trim()) {
            throw new Error("clerk_user_id es obligatorio");
        }
        if (!args.name?.trim()) {
            throw new Error("El nombre es obligatorio");
        }
        if (!args.last_name?.trim()) {
            throw new Error("El apellido es obligatorio");
        }
        if (!args.phone?.trim()) {
            throw new Error("El teléfono es obligatorio");
        }
        if (!args.document_type) {
            throw new Error("El tipo de documento es obligatorio");
        }
        if (!args.document_number?.trim()) {
            throw new Error("El número de documento es obligatorio");
        }
        if (!args.emergency_contact_name?.trim()) {
            throw new Error("El nombre del contacto de emergencia es obligatorio");
        }
        if (!args.emergency_contact_phone?.trim()) {
            throw new Error("El teléfono del contacto de emergencia es obligatorio");
        }

        // Validar que la sede exista
        const branch = await ctx.db.get(args.branch_id);
        if (!branch) {
            throw new Error("La sede seleccionada no existe o no está activa");
        }

        const now = Date.now();

        // 1. Buscar el usuario por clerk_id
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", args.clerk_user_id))
            .unique();

        if (!user) {
            throw new Error("Usuario no encontrado. Por favor, espera unos segundos e intenta nuevamente.");
        }

        // 2. IDEMPOTENCIA: Verificar si ya existe un cliente para este usuario
        const existingClient = await ctx.db
            .query("clients")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (existingClient) {
            // Cliente ya existe, retornar los IDs existentes
            const existingPerson = await ctx.db.get(existingClient.person_id);
            if (!existingPerson) {
                throw new Error("Persona asociada al cliente no encontrada");
            }

            const existingEmergencyContact = await ctx.db
                .query("emergency_contact")
                .withIndex("by_person", (q) => q.eq("person_id", existingPerson._id))
                .filter((q) => q.eq(q.field("active"), true))
                .first();

            return {
                clientId: existingClient._id,
                personId: existingPerson._id,
                emergencyContactId: existingEmergencyContact?._id,
                message: "Cliente ya registrado",
            };
        }

        // 3. Verificar si existe una persona con el mismo documento
        let personId: Id<"persons">;
        let isNewPerson = false;

        if (args.document_number.trim()) {
            const existingPerson = await ctx.db
                .query("persons")
                .withIndex("by_document", (q) =>
                    q.eq("document_type", args.document_type).eq("document_number", args.document_number)
                )
                .filter((q) => q.eq(q.field("active"), true))
                .first();

            if (existingPerson) {
                // Persona ya existe, usar el ID existente
                personId = existingPerson._id;
            } else {
                // Crear nueva persona
                isNewPerson = true;
                personId = await ctx.db.insert("persons", {
                    user_id: user._id,
                    name: args.name.trim(),
                    last_name: args.last_name.trim(),
                    born_date: args.born_date,
                    phone: args.phone.trim(),
                    document_type: args.document_type,
                    document_number: args.document_number.trim(),
                    created_at: now,
                    updated_at: now,
                    active: true,
                });
            }
        } else {
            // Si no hay documento, crear persona nueva
            isNewPerson = true;
            personId = await ctx.db.insert("persons", {
                user_id: user._id,
                name: args.name.trim(),
                last_name: args.last_name.trim(),
                born_date: args.born_date,
                phone: args.phone.trim(),
                document_type: args.document_type,
                document_number: args.document_number.trim(),
                created_at: now,
                updated_at: now,
                active: true,
            });
        }

        // Variables para rollback en caso de error
        let emergencyContactId: Id<"emergency_contact"> | undefined;
        let clientId: Id<"clients"> | undefined;
        let branchLinkId: Id<"client_branches"> | undefined;

        try {
            // 4. Crear el contacto de emergencia
            emergencyContactId = await ctx.db.insert("emergency_contact", {
                person_id: personId,
                name: args.emergency_contact_name.trim(),
                phone: args.emergency_contact_phone.trim(),
                relationship: args.emergency_contact_relationship.trim(),
                active: true,
                created_at: now,
                updated_at: now,
            });

            // 5. Crear el cliente
            clientId = await ctx.db.insert("clients", {
                person_id: personId,
                user_id: user._id,
                status: "ACTIVE",
                is_payment_active: false,
                join_date: now,
                created_by_user_id: user._id,
                created_at: now,
                updated_at: now,
                active: true,
            });

            // 6. Vincular cliente con la sede seleccionada
            branchLinkId = await ctx.db.insert("client_branches", {
                client_id: clientId,
                branch_id: args.branch_id,
                created_at: now,
                updated_at: now,
                active: true,
            });

            return {
                clientId,
                personId,
                emergencyContactId,
                branchLinkId,
                message: "Cliente registrado exitosamente",
            };
        } catch (error) {
            // ROLLBACK MANUAL: Eliminar registros creados si algo falló
            // Nota: Convex no tiene transacciones multi-documento, así que hacemos compensación manual

            if (branchLinkId) {
                try {
                    await ctx.db.delete(branchLinkId);
                } catch (deleteError) {
                    console.error("Error al eliminar vínculo con sede durante rollback:", deleteError);
                }
            }

            if (clientId) {
                try {
                    await ctx.db.delete(clientId);
                } catch (deleteError) {
                    console.error("Error al eliminar cliente durante rollback:", deleteError);
                }
            }

            if (emergencyContactId) {
                try {
                    await ctx.db.delete(emergencyContactId);
                } catch (deleteError) {
                    console.error("Error al eliminar contacto de emergencia durante rollback:", deleteError);
                }
            }

            if (isNewPerson && personId) {
                try {
                    await ctx.db.delete(personId);
                } catch (deleteError) {
                    console.error("Error al eliminar persona durante rollback:", deleteError);
                }
            }

            // Re-lanzar error con mensaje claro
            throw new Error(
                `Error al registrar cliente: ${error instanceof Error ? error.message : "Error desconocido"}. Los cambios han sido revertidos.`
            );
        }
    },
});

// Action para crear cliente completo con Clerk y envío de email
export const createClientComplete = action({
    args: {
        personalData: v.object({
            personName: v.string(),
            personLastName: v.string(),
            personBornDate: v.string(),
            personDocumentType: v.string(),
            personDocumentNumber: v.string(),
            personPhone: v.string(),
            personEmail: v.string(),
        }),
        emergencyContact: v.object({
            name: v.string(),
            phone: v.string(),
            relationship: v.string(),
        }),
        branchId: v.id("branches"),
    },
    handler: async (ctx, { personalData, emergencyContact, branchId }): Promise<{
        success: boolean;
        data: {
            clientId: Id<"clients">;
            personId: Id<"persons">;
            userId: Id<"users">;
            clerkUserId: string;
            temporaryPassword: string;
            message: string;
        };
    }> => {
        // Verificar autenticación y permisos de admin
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // Verificar que el usuario tenga permisos
        const currentUser = await ctx.runQuery(internal.clients.queries.getUserByClerkId, {
            clerk_id: identity.subject
        });

        if (!currentUser) {
            throw new Error("Usuario no encontrado");
        }

        // Verificar permisos (debe ser admin o super admin)
        const roles = await ctx.runQuery(internal.clients.queries.getUserRolesInternal, {
            userId: currentUser._id
        });

        const hasPermission = roles.some((r: { role: string }) => r.role === "ADMIN" || r.role === "SUPER_ADMIN");
        if (!hasPermission) {
            throw new Error("No tienes permisos para crear clientes");
        }

        // Verificar que la clave secreta de Clerk esté disponible
        const clerkSecretKey = process.env.CLERK_SECRET_KEY;
        if (!clerkSecretKey) {
            throw new Error("CLERK_SECRET_KEY no está configurado");
        }

        const clerkClient = createClerkClient({
            secretKey: clerkSecretKey
        });

        try {
            // Verificar si el email ya existe en Clerk
            const existingUsers = await clerkClient.users.getUserList({
                emailAddress: [personalData.personEmail]
            });

            if (existingUsers.data.length > 0) {
                throw new Error("Ya existe un usuario con este correo electrónico");
            }

            // Verificar si el número de documento ya existe
            const existingPerson = await ctx.runQuery(internal.clients.queries.checkPersonByDocument, {
                document_number: personalData.personDocumentNumber
            });

            if (existingPerson) {
                throw new Error("Ya existe una persona con este número de documento");
            }

            // 1. Generar contraseña temporal
            const temporaryPassword = generateSecurePassword();

            // 2. Crear usuario en Clerk
            const clerkUser = await clerkClient.users.createUser({
                emailAddress: [personalData.personEmail],
                password: temporaryPassword,
                firstName: personalData.personName,
                lastName: personalData.personLastName,
                skipPasswordChecks: true,
            });

            let userId: Id<"users"> | undefined;
            let personId: Id<"persons"> | undefined;
            let emergencyContactId: Id<"emergency_contact"> | undefined;
            let clientId: Id<"clients"> | undefined;

            try {
                // 3. Crear usuario en Convex
                userId = await ctx.runMutation(internal.clients.mutations.createUserInDB, {
                    clerk_id: clerkUser.id,
                    name: `${personalData.personName} ${personalData.personLastName}`,
                    email: personalData.personEmail,
                });

                // 4. Crear persona en Convex
                personId = await ctx.runMutation(internal.clients.mutations.createPersonInDB, {
                    user_id: userId,
                    name: personalData.personName,
                    last_name: personalData.personLastName,
                    born_date: personalData.personBornDate,
                    phone: personalData.personPhone,
                    document_type: personalData.personDocumentType,
                    document_number: personalData.personDocumentNumber,
                });

                // 5. Crear contacto de emergencia
                emergencyContactId = await ctx.runMutation(
                    internal.clients.mutations.createEmergencyContactInDB,
                    {
                        person_id: personId,
                        name: emergencyContact.name,
                        phone: emergencyContact.phone,
                        relationship: emergencyContact.relationship,
                    }
                );

                // 6. Crear cliente
                clientId = await ctx.runMutation(internal.clients.mutations.createClientInDB, {
                    person_id: personId,
                    user_id: userId,
                    created_by_user_id: currentUser._id,
                });

                // 7. Asignar rol de CLIENT
                await ctx.runMutation(internal.clients.mutations.assignRoleInDB, {
                    user_id: userId,
                    role: "CLIENT",
                    assigned_by_user_id: currentUser._id,
                });

                // 8. Vincular cliente con sede
                await ctx.runMutation(internal.clients.mutations.linkClientToBranchInDB, {
                    client_id: clientId,
                    branch_id: branchId,
                    created_by_user_id: currentUser._id,
                });
            } catch (dbError) {
                console.error('Error en operaciones de base de datos, haciendo rollback:', dbError);

                try {
                    await clerkClient.users.deleteUser(clerkUser.id);
                    console.log('Usuario de Clerk eliminado durante rollback');
                } catch (clerkDeleteError) {
                    console.error('Error al eliminar usuario de Clerk durante rollback:', clerkDeleteError);
                }

                throw dbError;
            }

            // 9. Enviar email de bienvenida con credenciales
            console.log("Enviando email de bienvenida al cliente...");
            try {
                const clientName = `${personalData.personName} ${personalData.personLastName}`;

                await ctx.scheduler.runAfter(0, internal.emails.sender.sendWelcomeClientEmail, {
                    clientName,
                    email: personalData.personEmail,
                    temporaryPassword,
                });
            } catch (emailError) {
                console.error('Error al enviar email:', emailError);
                // No lanzar error, el cliente ya fue creado exitosamente
            }

            return {
                success: true,
                data: {
                    clientId,
                    personId,
                    userId,
                    clerkUserId: clerkUser.id,
                    temporaryPassword,
                    message: `Cliente ${personalData.personName} ${personalData.personLastName} creado exitosamente`,
                },
            };
        } catch (error) {
            console.error('Error al crear cliente:', error);

            // Mejor manejo de errores de Clerk
            if (error && typeof error === "object" && "errors" in error) {
                const clerkError = error as any;
                if (clerkError.errors && Array.isArray(clerkError.errors) && clerkError.errors.length > 0) {
                    const firstError = clerkError.errors[0];
                    throw new Error(`Error de Clerk: ${firstError.message || JSON.stringify(firstError)}`);
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

            throw new Error(`Error al crear cliente: ${errorMessage}`);
        }
    },
});

// Mutations auxiliares internas (pueden ser llamadas desde actions)
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
        phone: v.string(),
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

export const createEmergencyContactInDB = internalMutation({
    args: {
        person_id: v.id("persons"),
        name: v.string(),
        phone: v.string(),
        relationship: v.string(),
    },
    handler: async (ctx, args): Promise<Id<"emergency_contact">> => {
        return await ctx.db.insert("emergency_contact", {
            person_id: args.person_id,
            name: args.name,
            phone: args.phone,
            relationship: args.relationship,
            active: true,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
    },
});

export const createClientInDB = internalMutation({
    args: {
        person_id: v.id("persons"),
        user_id: v.id("users"),
        created_by_user_id: v.id("users"),
    },
    handler: async (ctx, args): Promise<Id<"clients">> => {
        return await ctx.db.insert("clients", {
            person_id: args.person_id,
            user_id: args.user_id,
            status: "ACTIVE",
            is_payment_active: false,
            join_date: Date.now(),
            created_by_user_id: args.created_by_user_id,
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true,
        });
    },
});

export const assignRoleInDB = internalMutation({
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

export const linkClientToBranchInDB = internalMutation({
    args: {
        client_id: v.id("clients"),
        branch_id: v.id("branches"),
        created_by_user_id: v.id("users"),
    },
    handler: async (ctx, args): Promise<Id<"client_branches">> => {
        return await ctx.db.insert("client_branches", {
            client_id: args.client_id,
            branch_id: args.branch_id,
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true,
        });
    },
});

// Función auxiliar para generar contraseña segura
function generateSecurePassword(): string {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*";
    const allChars = uppercase + lowercase + digits + symbols;

    const getRandomChar = (chars: string): string => {
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        return chars[randomValues[0] % chars.length];
    };

    let password = [
        getRandomChar(uppercase),
        getRandomChar(lowercase),
        getRandomChar(digits),
        getRandomChar(symbols)
    ];

    for (let i = 4; i < 12; i++) {
        password.push(getRandomChar(allChars));
    }

    for (let i = password.length - 1; i > 0; i--) {
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        const j = randomValues[0] % (i + 1);
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
}

// Action para eliminar cliente completo
export const deleteClientComplete = action({
    args: {
        clientId: v.id("clients"),
    },
    handler: async (ctx, { clientId }): Promise<{
        success: boolean;
        message: string;
    }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const client = await ctx.runQuery(internal.clients.internalQueries.getClientByIdInternal, {
            clientId
        });

        if (!client) {
            throw new Error("Cliente no encontrado");
        }

        const person = await ctx.runQuery(internal.clients.internalQueries.getPersonByIdInternal, {
            personId: client.person_id
        });

        if (!person) {
            throw new Error("Persona no encontrada");
        }

        const user = person.user_id
            ? await ctx.runQuery(internal.clients.internalQueries.getUserByIdInternal, {
                userId: person.user_id
            })
            : null;

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        const clerkSecretKey = process.env.CLERK_SECRET_KEY;
        if (clerkSecretKey) {
            try {
                const clerkClient = createClerkClient({
                    secretKey: clerkSecretKey
                });
                await clerkClient.users.deleteUser(user.clerk_id);
            } catch (error) {
                console.error('Error al eliminar usuario de Clerk:', error);
            }
        }

        // 1. Eliminar enlaces de cliente a sedes
        const branchLinks = await ctx.runQuery(internal.clients.internalQueries.getClientBranchLinks, {
            clientId
        });
        for (const link of branchLinks) {
            await ctx.runMutation(internal.clients.mutations.deleteBranchLinkInDB, {
                linkId: link._id
            });
        }

        // 2. Eliminar asignaciones de roles
        const roleAssignments = await ctx.runQuery(internal.clients.internalQueries.getUserRoles, {
            userId: user._id
        });
        for (const role of roleAssignments) {
            await ctx.runMutation(internal.clients.mutations.deleteRoleInDB, {
                roleId: role._id
            });
        }

        // 3. Eliminar cliente
        await ctx.runMutation(internal.clients.mutations.deleteClientInDB, {
            clientId
        });

        // 4. Eliminar contactos de emergencia
        const emergencyContacts = await ctx.runQuery(internal.clients.internalQueries.getEmergencyContacts, {
            personId: person._id
        });
        for (const contact of emergencyContacts) {
            await ctx.runMutation(internal.clients.mutations.deleteEmergencyContactInDB, {
                contactId: contact._id
            });
        }

        // 5. Eliminar persona
        await ctx.runMutation(internal.clients.mutations.deletePersonInDB, {
            personId: person._id
        });

        // 6. Eliminar usuario
        await ctx.runMutation(internal.clients.mutations.deleteUserInDB, {
            userId: user._id
        });

        return {
            success: true,
            message: `Cliente ${person.name} ${person.last_name} eliminado exitosamente`,
        };
    },
});

// Action para actualizar cliente completo
export const updateClientComplete = action({
    args: {
        clientId: v.id("clients"),
        personalData: v.object({
            personName: v.string(),
            personLastName: v.string(),
            personBornDate: v.string(),
            personDocumentType: v.string(),
            personDocumentNumber: v.string(),
            personPhone: v.string(),
        }),
        emergencyContact: v.object({
            name: v.string(),
            phone: v.string(),
            relationship: v.string(),
        }),
        clientStatus: v.union(v.literal("ACTIVE"), v.literal("INACTIVE")),
        isPaymentActive: v.boolean(),
    },
    handler: async (ctx, { clientId, personalData, emergencyContact, clientStatus, isPaymentActive }): Promise<{
        success: boolean;
        message: string;
    }> => {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // Obtener usuario actual
        const currentUser = await ctx.runQuery(internal.clients.queries.getUserByClerkId, {
            clerk_id: identity.subject
        });

        if (!currentUser) {
            throw new Error("Usuario no encontrado");
        }

        // Verificar permisos (debe ser admin o super admin)
        const roles = await ctx.runQuery(internal.clients.queries.getUserRolesInternal, {
            userId: currentUser._id
        });

        const isSuperAdmin = roles.some((r: { role: string }) => r.role === "SUPER_ADMIN");
        const isAdmin = roles.some((r: { role: string }) => r.role === "ADMIN");

        if (!isSuperAdmin && !isAdmin) {
            throw new Error("No tienes permisos para actualizar clientes");
        }

        // Obtener datos actuales del cliente
        const client = await ctx.runQuery(internal.clients.internalQueries.getClientByIdInternal, {
            clientId
        });

        if (!client) {
            throw new Error("Cliente no encontrado");
        }

        // Verificar que el admin tiene acceso a este cliente (si no es super admin)
        if (!isSuperAdmin && isAdmin) {
            // Obtener el admin asociado al usuario actual
            const person = await ctx.runQuery(internal.clients.queries.getPersonByUserId, {
                userId: currentUser._id
            });

            if (!person) {
                throw new Error("Persona no encontrada");
            }

            const admin = await ctx.runQuery(internal.clients.queries.getAdminByPersonId, {
                personId: person._id
            });

            if (!admin || !admin.branch_id) {
                throw new Error("Administrador no encontrado o sin sede asignada");
            }

            // Verificar que el cliente pertenece a la sede del admin
            const clientBranchLinks = await ctx.runQuery(internal.clients.internalQueries.getClientBranchLinks, {
                clientId
            });

            const hasAccess = clientBranchLinks.some(link => link.branch_id === admin.branch_id);
            if (!hasAccess) {
                throw new Error("No tienes permisos para editar este cliente");
            }
        }

        try {
            // 1. Actualizar datos de la persona
            await ctx.runMutation(internal.clients.mutations.updatePersonInDB, {
                personId: client.person_id,
                name: personalData.personName,
                last_name: personalData.personLastName,
                born_date: personalData.personBornDate,
                document_type: personalData.personDocumentType,
                document_number: personalData.personDocumentNumber,
                phone: personalData.personPhone,
            });

            // 2. Actualizar contacto de emergencia
            // Primero buscar si existe
            const existingContacts = await ctx.runQuery(internal.clients.internalQueries.getEmergencyContacts, {
                personId: client.person_id
            });

            if (existingContacts.length > 0) {
                // Actualizar el primero
                await ctx.runMutation(internal.clients.mutations.updateEmergencyContactInDB, {
                    contactId: existingContacts[0]._id,
                    name: emergencyContact.name,
                    phone: emergencyContact.phone,
                    relationship: emergencyContact.relationship,
                });
            } else {
                // Crear nuevo contacto de emergencia
                await ctx.runMutation(internal.clients.mutations.createEmergencyContactInDB, {
                    person_id: client.person_id,
                    name: emergencyContact.name,
                    phone: emergencyContact.phone,
                    relationship: emergencyContact.relationship,
                });
            }

            // 3. Actualizar datos del cliente
            await ctx.runMutation(internal.clients.mutations.updateClientInDB, {
                clientId,
                status: clientStatus,
                is_payment_active: isPaymentActive,
            });

            return {
                success: true,
                message: `Cliente ${personalData.personName} ${personalData.personLastName} actualizado exitosamente`,
            };
        } catch (error) {
            console.error('Error al actualizar cliente:', error);

            let errorMessage = "Error desconocido";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "string") {
                errorMessage = error;
            } else if (error && typeof error === "object" && "message" in error) {
                errorMessage = (error as { message: string }).message;
            }

            throw new Error(`Error al actualizar cliente: ${errorMessage}`);
        }
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
        phone: v.string(),
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

export const updateEmergencyContactInDB = internalMutation({
    args: {
        contactId: v.id("emergency_contact"),
        name: v.string(),
        phone: v.string(),
        relationship: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.contactId, {
            name: args.name,
            phone: args.phone,
            relationship: args.relationship,
            updated_at: Date.now(),
        });
        return { success: true };
    },
});

export const updateClientInDB = internalMutation({
    args: {
        clientId: v.id("clients"),
        status: v.union(v.literal("ACTIVE"), v.literal("INACTIVE")),
        is_payment_active: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.clientId, {
            status: args.status,
            is_payment_active: args.is_payment_active,
            updated_at: Date.now(),
        });
        return { success: true };
    },
});

export const deleteClientInDB = internalMutation({
    args: {
        clientId: v.id("clients"),
    },
    handler: async (ctx, { clientId }) => {
        await ctx.db.delete(clientId);
        return { success: true };
    },
});

export const deleteBranchLinkInDB = internalMutation({
    args: {
        linkId: v.id("client_branches"),
    },
    handler: async (ctx, { linkId }) => {
        await ctx.db.delete(linkId);
        return { success: true };
    },
});

export const deleteRoleInDB = internalMutation({
    args: {
        roleId: v.id("role_assignments"),
    },
    handler: async (ctx, { roleId }) => {
        await ctx.db.delete(roleId);
        return { success: true };
    },
});

export const deleteEmergencyContactInDB = internalMutation({
    args: {
        contactId: v.id("emergency_contact"),
    },
    handler: async (ctx, { contactId }) => {
        await ctx.db.delete(contactId);
        return { success: true };
    },
});

export const deletePersonInDB = internalMutation({
    args: {
        personId: v.id("persons"),
    },
    handler: async (ctx, { personId }) => {
        await ctx.db.delete(personId);
        return { success: true };
    },
});

export const deleteUserInDB = internalMutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        await ctx.db.delete(userId);
        return { success: true };
    },
});

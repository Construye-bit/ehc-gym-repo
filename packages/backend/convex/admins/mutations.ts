import { mutation, action, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";
import { requireSuperAdmin } from "../branches/utils";
import { createClerkClient } from '@clerk/backend';
import { Resend } from 'resend';
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
            temporaryPassword: string;
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

            const clerkUser = await clerkClient.users.createUser(clerkUserData);

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
                const resendApiKey = process.env.RESEND_API_KEY;
                if (!resendApiKey) {
                    console.log("Advertencia: RESEND_API_KEY no está configurado, saltando envío de email");
                } else {
                    const resend = new Resend(resendApiKey);
                    const adminName = `${personalData.personName} ${personalData.personLastName}`;

                    console.log(`Enviando email de bienvenida a: ${userData.userEmail}`);

                    const emailTemplate = getWelcomeAdminEmailTemplate(
                        adminName,
                        userData.userEmail,
                        temporaryPassword
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
                    }
                }
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
                    temporaryPassword, // Solo para desarrollo
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
export const updateAdministratorComplete = mutation({
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
        await requireSuperAdmin(ctx);
        const now = Date.now();

        try {
            // 1. Obtener admin
            const admin = await ctx.db.get(args.administratorId);
            if (!admin) {
                throw new Error("Administrador no encontrado");
            }

            // 2. Actualizar usuario
            if (admin.user_id) {
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
                const userId = admin.user_id; // Capturar en variable local para type narrowing
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
export const deleteAdministratorComplete = mutation({
    args: {
        administratorId: v.id("admins"),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);
        const now = Date.now();

        try {
            // 1. Obtener admin
            const admin = await ctx.db.get(args.administratorId);
            if (!admin) {
                throw new Error("Administrador no encontrado");
            }

            // 2. Desactivar admin (soft delete)
            await ctx.db.patch(args.administratorId, {
                active: false,
                status: "INACTIVE",
                updated_at: now,
            });

            // 3. Desactivar usuario
            if (admin.user_id) {
                await ctx.db.patch(admin.user_id, {
                    active: false,
                    updated_at: now,
                });
            }

            // 4. Desactivar persona
            if (admin.person_id) {
                await ctx.db.patch(admin.person_id, {
                    active: false,
                    updated_at: now,
                });
            }

            // 5. Desactivar role_assignments
            if (admin.user_id) {
                const userId = admin.user_id; // Capturar en variable local para type narrowing
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

// ===== FUNCIONES AUXILIARES =====

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

function getWelcomeAdminEmailTemplate(
    adminName: string,
    email: string,
    temporaryPassword: string
) {
    return {
        subject: "¡Bienvenido como Administrador de EHC Gym! 🏋️‍♂️",
        html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a EHC Gym</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .credential-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        .credential-item {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e5e5;
        }
        .credential-item strong {
            color: #d97706;
        }
        .password {
            font-family: 'Courier New', monospace;
            background: #f3f4f6;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            color: #dc2626;
        }
        .warning {
            background: #fef3cd;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            background: #f59e0b;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏋️‍♂️ ¡Bienvenido a EHC Gym!</h1>
        <p>Tu cuenta de administrador ha sido creada exitosamente</p>
    </div>
    
    <div class="content">
        <h2>Hola ${adminName},</h2>
        
        <p>¡Felicidades! Has sido agregado como administrador en EHC Gym. Tu cuenta ha sido creada y ya puedes acceder al sistema de gestión.</p>
        
        <div class="credential-box">
            <h3>📋 Datos de Acceso</h3>
            <div class="credential-item">
                <strong>Correo electrónico:</strong> ${email}
            </div>
            <div class="credential-item">
                <strong>Contraseña temporal:</strong><br>
                <span class="password">${temporaryPassword}</span>
            </div>
        </div>
        
        <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
                <li>Esta es una contraseña temporal generada automáticamente</li>
                <li>Por seguridad, cámbiala en tu primer inicio de sesión</li>
                <li>No compartas esta información con terceros</li>
                <li>Como administrador, tienes acceso a funciones sensibles del sistema</li>
            </ul>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/super-admin/login" class="btn">
                Iniciar Sesión Ahora
            </a>
        </div>
        
        <h3>🎯 Responsabilidades como Administrador:</h3>
        <ul>
            <li>Gestionar clientes y entrenadores de tu sede</li>
            <li>Supervisar las operaciones diarias</li>
            <li>Generar reportes y estadísticas</li>
            <li>Mantener actualizada la información de la sede</li>
        </ul>
        
        <h3>📱 Próximos pasos:</h3>
        <ol>
            <li>Inicia sesión con las credenciales proporcionadas</li>
            <li>Cambia tu contraseña temporal por una segura</li>
            <li>Completa tu perfil de administrador</li>
            <li>Familiarízate con el panel de control</li>
        </ol>
        
        <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar al super administrador.</p>
        
        <p>¡Esperamos trabajar contigo para hacer de EHC Gym el mejor gimnasio!</p>
        
        <p>Saludos cordiales,<br>
        <strong>El equipo de EHC Gym</strong></p>
    </div>
    
    <div class="footer">
        <p>Este es un correo automático, por favor no responder directamente.</p>
        <p>© ${new Date().getFullYear()} EHC Gym. Todos los derechos reservados.</p>
    </div>
</body>
</html>
        `,
        text: `
¡Bienvenido a EHC Gym!

Hola ${adminName},

¡Felicidades! Has sido agregado como administrador en EHC Gym.

DATOS DE ACCESO:
- Correo electrónico: ${email}
- Contraseña temporal: ${temporaryPassword}

IMPORTANTE:
- Esta es una contraseña temporal generada automáticamente
- Por seguridad, cámbiala en tu primer inicio de sesión
- No compartas esta información con terceros
- Como administrador, tienes acceso a funciones sensibles del sistema

RESPONSABILIDADES COMO ADMINISTRADOR:
- Gestionar clientes y entrenadores de tu sede
- Supervisar las operaciones diarias
- Generar reportes y estadísticas
- Mantener actualizada la información de la sede

PRÓXIMOS PASOS:
1. Inicia sesión con las credenciales proporcionadas
2. Cambia tu contraseña temporal por una segura
3. Completa tu perfil de administrador
4. Familiarízate con el panel de control

Enlace de acceso: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/super-admin/login

¡Esperamos trabajar contigo!

Saludos cordiales,
El equipo de EHC Gym
        `
    };
}

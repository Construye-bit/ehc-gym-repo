import { QueryCtx } from "../_generated/server";
import { mustGetCurrentUser } from "../users";
import { AccessDeniedError } from "./errors";
import { z } from "zod";
import { roleSchema, userContextSchema, validateWithZod } from './validations';

/**
 * Verifica que el usuario esté autenticado y tenga rol de SUPER_ADMIN.
 * Lanza un error si no cumple.
 */
export async function requireSuperAdmin(ctx: QueryCtx): Promise<void> {
    const user = await mustGetCurrentUser(ctx);

    // Validar campos básicos del usuario (sin _id por incompatibilidad de tipos)
    if (!user.active) {
        throw new AccessDeniedError("Usuario inactivo");
    }

    if (!user.clerk_id || typeof user.clerk_id !== 'string') {
        throw new AccessDeniedError("Usuario sin clerk_id válido");
    }

    if (!user.email || !z.string().email().safeParse(user.email).success) {
        throw new AccessDeniedError("Usuario sin email válido");
    }

    const roleAssignment = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q) =>
            q.eq("user_id", user._id).eq("active", true)
        )
        .collect();

    // Validar roles y verificar SUPER_ADMIN
    const validRoles: string[] = [];

    for (const r of roleAssignment) {
        try {
            const validatedRole = validateWithZod(roleSchema, r.role, "role validation");
            validRoles.push(validatedRole);
        } catch {
            // Ignorar roles inválidos
            continue;
        }
    }

    const isSuperAdmin = validRoles.includes("SUPER_ADMIN");

    if (!isSuperAdmin) {
        throw new AccessDeniedError("Se requiere rol de SUPER_ADMIN");
    }
}

/**
 * Verifica que el usuario esté autenticado y tenga rol de ADMIN o SUPER_ADMIN.
 * Lanza un error si no cumple.
 */
export async function requireAdmin(ctx: QueryCtx): Promise<void> {
    const user = await mustGetCurrentUser(ctx);

    // Validar campos básicos del usuario (sin _id por incompatibilidad de tipos)
    if (!user.active) {
        throw new AccessDeniedError("Usuario inactivo");
    }

    if (!user.clerk_id || typeof user.clerk_id !== 'string') {
        throw new AccessDeniedError("Usuario sin clerk_id válido");
    }

    if (!user.email || !z.string().email().safeParse(user.email).success) {
        throw new AccessDeniedError("Usuario sin email válido");
    }

    const roleAssignment = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q) =>
            q.eq("user_id", user._id).eq("active", true)
        )
        .collect();

    // Validar roles y verificar ADMIN o SUPER_ADMIN
    const validRoles: string[] = [];

    for (const r of roleAssignment) {
        try {
            const validatedRole = validateWithZod(roleSchema, r.role, "role validation");
            validRoles.push(validatedRole);
        } catch {
            // Ignorar roles inválidos
            continue;
        }
    }

    const hasAdminRole = validRoles.some(role => ["ADMIN", "SUPER_ADMIN"].includes(role));

    if (!hasAdminRole) {
        throw new AccessDeniedError("Se requiere rol de ADMIN o SUPER_ADMIN");
    }
}
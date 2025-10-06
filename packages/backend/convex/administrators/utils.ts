import { QueryCtx } from "../_generated/server";
import { mustGetCurrentUser } from "../users";
import { AccessDeniedError } from "./errors";
import { z } from "zod";

/**
 * Verifica que el usuario esté autenticado y tenga rol de SUPER_ADMIN.
 * Lanza un error si no cumple.
 */
export async function requireSuperAdmin(ctx: QueryCtx): Promise<void> {
    const user = await mustGetCurrentUser(ctx);

    // Validar campos básicos del usuario
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

    const isSuperAdmin = roleAssignment.some(r => r.role === "SUPER_ADMIN");

    if (!isSuperAdmin) {
        throw new AccessDeniedError();
    }
}

/**
 * Genera un código de empleado único para administradores
 */
export async function generateEmployeeCode(ctx: QueryCtx, attempts = 0): Promise<string> {
    if (attempts > 10) {
        throw new Error("No se pudo generar un código de empleado único");
    }

    const prefix = "ADM";
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const employeeCode = `${prefix}${randomNum}`;

    const existing = await ctx.db
        .query("administrators")
        .withIndex("by_employee_code", (q) => q.eq("employee_code", employeeCode))
        .first();

    if (!existing) {
        return employeeCode;
    }

    return generateEmployeeCode(ctx, attempts + 1);
}
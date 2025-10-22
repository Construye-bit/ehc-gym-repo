// packages/backend/convex/profiles/common/utils.ts
import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import { mustGetCurrentUser } from "../../users";

/**
 * Tipos auxiliares
 */
type Ctx = QueryCtx | MutationCtx;
type Role = "SUPER_ADMIN" | "ADMIN" | "TRAINER" | "CLIENT";

/**
 * Obtiene el usuario actual (lanza si no hay sesión)
 */
export async function getCurrentUser(ctx: Ctx) {
    return await mustGetCurrentUser(ctx);
}

/**
 * Verifica si el usuario actual tiene un rol activo.
 */
export async function hasRole(ctx: Ctx, role: Role): Promise<boolean> {
    const user = await getCurrentUser(ctx);
    const roles = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q) => q.eq("user_id", user._id).eq("active", true))
        .collect();
    return roles.some((r) => r.role === role);
}

/**
 * Requiere un rol específico; lanza si no.
 */
export async function requireRole(ctx: Ctx, role: Role): Promise<void> {
    if (!(await hasRole(ctx, role))) {
        throw new Error(`Acceso denegado: requiere rol ${role}.`);
    }
}

/**
 * ¿Es SUPER_ADMIN?
 */
export async function isSuperAdmin(ctx: Ctx): Promise<boolean> {
    return hasRole(ctx, "SUPER_ADMIN");
}

/**
 * Devuelve el admin activo del usuario actual (si existe), y su branch_id.
 * Retorna null si el usuario no es admin activo.
 */
export async function getMyAdminRecord(ctx: Ctx): Promise<
    | null
    | {
        _id: Id<"admins">;
        branch_id?: Id<"branches">;
    }
> {
    const user = await getCurrentUser(ctx);
    const admin = await ctx.db
        .query("admins")
        .withIndex("by_user", (q) => q.eq("user_id", user._id))
        .filter((q) => q.eq(q.field("status"), "ACTIVE"))
        .filter((q) => q.eq(q.field("active"), true))
        .first();
    return admin ?? null;
}

/**
 * Requiere ser SUPER_ADMIN o ADMIN de una branch específica.
 */
export async function requireAdminForBranch(ctx: Ctx, branchId: Id<"branches">) {
    if (await isSuperAdmin(ctx)) return;
    const myAdmin = await getMyAdminRecord(ctx);
    if (!myAdmin || !myAdmin.branch_id || myAdmin.branch_id !== branchId) {
        throw new Error("Acceso denegado: debes ser ADMIN de esta sede (o SUPER_ADMIN).");
    }
}

/**
 * Verifica si el ADMIN actual gestiona la branch a la que pertenece un cliente.
 * (o es SUPER_ADMIN). Usa client_branches para validar pertenencia activa.
 */
export async function requireAdminForClientBranch(ctx: Ctx, clientId: Id<"clients">) {
    if (await isSuperAdmin(ctx)) return;
    const myAdmin = await getMyAdminRecord(ctx);
    if (!myAdmin || !myAdmin.branch_id) {
        throw new Error("Acceso denegado: no eres ADMIN de ninguna sede asignada.");
    }
    const link = await ctx.db
        .query("client_branches")
        .withIndex("by_client_active", (q) => q.eq("client_id", clientId).eq("active", true))
        .filter((q) => q.eq(q.field("branch_id"), myAdmin.branch_id!))
        .first();
    if (!link) {
        throw new Error("Acceso denegado: el cliente no pertenece a tu sede.");
    }
}

/**
 * Requiere que el usuario actual sea dueño del client_id (o ADMIN de su branch, o SUPER_ADMIN).
 */
export async function requireClientOwnershipOrAdmin(ctx: Ctx, clientId: Id<"clients">) {
    const user = await getCurrentUser(ctx);
    const client = await ctx.db.get(clientId);
    if (!client) throw new Error("Cliente no encontrado.");

    // Dueño (client.user_id)
    if (client.user_id && client.user_id === user._id) return;

    // ADMIN de la branch del cliente (o SA)
    await requireAdminForClientBranch(ctx, clientId);
}

/**
 * Requiere que el usuario actual sea el trainer indicado (o ADMIN/SA).
 */
export async function requireTrainerOwnershipOrAdmin(ctx: Ctx, trainerId: Id<"trainers">) {
    const user = await getCurrentUser(ctx);
    const trainer = await ctx.db.get(trainerId);
    if (!trainer) throw new Error("Entrenador no encontrado.");

    // Dueño (trainer.user_id)
    if (trainer.user_id && trainer.user_id === user._id) return;

    // ADMIN de la branch del trainer (si tiene) o SUPER_ADMIN
    if (await isSuperAdmin(ctx)) return;

    const myAdmin = await getMyAdminRecord(ctx);
    if (!myAdmin || !myAdmin.branch_id) {
        throw new Error("Acceso denegado: no eres ADMIN asignado a ninguna sede.");
    }
    if (!trainer.branch_id || trainer.branch_id !== myAdmin.branch_id) {
        throw new Error("Acceso denegado: el entrenador no pertenece a tu sede.");
    }
}

/**
 * Rate limiting simple por usuario y tabla, contando documentos creados recientemente.
 * Usamos el índice SISTÉMICO "by_creation_time" para todas las tablas, y filtramos por created_by_user_id.
 */
export async function rateLimitRecentWrites(
    ctx: Ctx,
    params: {
        table: "client_health_metrics" | "client_progress" | "client_trainer_contracts";
        userId: Id<"users">;
        windowMs: number; // ej. 60_000
        max: number; // ej. 10
    }
) {
    const now = Date.now();
    const since = now - params.windowMs;

    const recent = await ctx.db
        .query(params.table)
        .withIndex("by_creation_time", (q) => q.gte("_creationTime", since))
        .filter((q) => q.eq(q.field("created_by_user_id"), params.userId))
        .collect();

    if (recent.length >= params.max) {
        throw new Error("Rate limit excedido: intenta nuevamente en unos minutos.");
    }
}

/**
 * Helpers varios
 */
export function clampLimit(limit: number | undefined, def = 50, max = 200) {
    if (!limit || limit < 1) return def;
    if (limit > max) return max;
    return limit;
}

export function normalizeRange(from?: number, to?: number) {
    const now = Date.now();
    const start = typeof from === "number" ? from : 0;
    const end = typeof to === "number" ? to : now;
    if (start > end) {
        return { from: end, to: start };
    }
    return { from: start, to: end };
}

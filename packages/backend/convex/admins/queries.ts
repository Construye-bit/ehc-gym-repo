import { query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { requireSuperAdmin } from "../branches/utils";
import { mustGetCurrentUser } from "../users";
import { getAdminSchema, validateWithZod } from "./validations";

// Obtener un admin por id. Solo SUPER_ADMIN.
export const getAdmin = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);
        const data = validateWithZod(getAdminSchema, args.payload, "getAdmin");
        const admin = await ctx.db.get(data.admin_id as Id<"admins">);
        if (!admin) throw new Error("Admin no encontrado.");
        return admin;
    },
});

// Listar admins sin sede asignada (branch_id undefined). Solo SUPER_ADMIN.
export const listAdminsUnassigned = query({
    args: {},
    handler: async (ctx) => {
        await requireSuperAdmin(ctx);
        const admins = await ctx.db
            .query("admins")
            .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
            .filter((q) => q.eq(q.field("active"), true))
            .filter((q) => q.eq(q.field("branch_id"), undefined as unknown as Id<"branches">))
            .collect();
        return admins;
    },
});

// Obtener admin del usuario actual (si existe y activo). Requiere sesión.
export const getAdminByUser = query({
    args: {},
    handler: async (ctx) => {
        const user = await mustGetCurrentUser(ctx);
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .filter((q) => q.eq(q.field("status"), "ACTIVE"))
            .filter((q) => q.eq(q.field("active"), true))
            .first();
        return admin ?? null;
    },
});

// === Obtener la sede del admin autenticado ===
export const getMyBranch = query({
    args: {},
    handler: async (ctx) => {
        const user = await mustGetCurrentUser(ctx);

        // Buscar admin activo del usuario actual
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .filter((q) => q.eq(q.field("status"), "ACTIVE"))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!admin || !admin.branch_id) {
            return null;
        }

        const branch = await ctx.db.get(admin.branch_id);
        return branch ?? null;
    },
});

// === Obtener todos los admins con detalles (person, user, branch) ===
export const getAllWithDetails = query({
    args: {},
    handler: async (ctx) => {
        await requireSuperAdmin(ctx);

        const admins = await ctx.db
            .query("admins")
            .filter((q) => q.eq(q.field("active"), true))
            .collect();

        const adminsWithDetails = await Promise.all(
            admins.map(async (admin) => {
                const person = admin.person_id ? await ctx.db.get(admin.person_id) : null;
                const user = admin.user_id ? await ctx.db.get(admin.user_id) : null;
                const branch = admin.branch_id ? await ctx.db.get(admin.branch_id) : null;

                return {
                    _id: admin._id,
                    person: person ? {
                        name: person.name,
                        last_name: person.last_name,
                        document_type: person.document_type,
                        document_number: person.document_number,
                        born_date: person.born_date,
                    } : undefined,
                    user: user ? {
                        name: user.name,
                        email: user.email,
                        phone: undefined as string | undefined, // El schema de users no tiene phone
                    } : undefined,
                    branch: branch ? {
                        _id: branch._id,
                        name: branch.name,
                    } : undefined,
                    rol_type: admin.branch_id ? "branch_admin" : "admin",
                    status: admin.status === "ACTIVE" ? "active" as const : "inactive" as const,
                    created_at: new Date(admin.created_at).toISOString(),
                    updated_at: new Date(admin.updated_at).toISOString(),
                };
            })
        );

        return adminsWithDetails;
    },
});

// === Obtener un admin por ID con detalles ===
export const getById = query({
    args: { administratorId: v.id("admins") },
    handler: async (ctx, { administratorId }) => {
        await requireSuperAdmin(ctx);

        const admin = await ctx.db.get(administratorId);
        if (!admin) {
            throw new Error("Admin no encontrado.");
        }

        const person = admin.person_id ? await ctx.db.get(admin.person_id) : null;
        const user = admin.user_id ? await ctx.db.get(admin.user_id) : null;
        const branch = admin.branch_id ? await ctx.db.get(admin.branch_id) : null;

        return {
            _id: admin._id,
            person: person ? {
                name: person.name,
                last_name: person.last_name,
                document_type: person.document_type,
                document_number: person.document_number,
                born_date: person.born_date,
            } : undefined,
            user: user ? {
                name: user.name,
                email: user.email,
                phone: undefined as string | undefined, // El schema de users no tiene phone
            } : undefined,
            branch: branch ? {
                _id: branch._id,
                name: branch.name,
            } : undefined,
            rol_type: admin.branch_id ? "branch_admin" : "admin",
            status: admin.status === "ACTIVE" ? "active" as const : "inactive" as const,
            created_at: new Date(admin.created_at).toISOString(),
            updated_at: new Date(admin.updated_at).toISOString(),
        };
    },
});

// === Verificar si existe una persona con el documento ===
export const checkPersonByDocument = query({
    args: {
        document_number: v.string(),
        document_type: v.optional(v.string())
    },
    handler: async (ctx, { document_number, document_type }) => {
        // Si se proporciona document_type, usar el índice
        if (document_type) {
            const person = await ctx.db
                .query("persons")
                .withIndex("by_document", (q) =>
                    q.eq("document_type", document_type as any)
                        .eq("document_number", document_number)
                )
                .first();
            return person ?? null;
        }

        // Si no se proporciona document_type, buscar en todas las personas
        // (menos eficiente pero funcional)
        const person = await ctx.db
            .query("persons")
            .filter((q) =>
                q.and(
                    q.eq(q.field("document_number"), document_number),
                    q.eq(q.field("active"), true)
                )
            )
            .first();

        return person ?? null;
    },
});

// === Obtener admin por person_id ===
export const getByPersonId = query({
    args: {
        personId: v.id("persons"),
    },
    handler: async (ctx, { personId }) => {
        return await ctx.db
            .query("admins")
            .withIndex("by_person", (q) => q.eq("person_id", personId))
            .filter((q) => q.eq(q.field("active"), true))
            .first();
    },
});

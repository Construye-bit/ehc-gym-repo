import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mustGetCurrentUser } from "../users";
import {
    getClientSchema,
    listClientsByBranchSchema,
    validateWithZod,
} from "./validations";
import { getCurrentActiveAdmin } from "../admins/utils";

// helper: es SUPER_ADMIN?
async function isSuperAdmin(ctx: any): Promise<boolean> {
    const user = await mustGetCurrentUser(ctx);
    const roles = await ctx.db
        .query("role_assignments")
        .withIndex("by_user_active", (q: any) => q.eq("user_id", user._id).eq("active", true))
        .collect();
    return roles.some((r: any) => r.role === "SUPER_ADMIN");
}

// Helper function to build client details object
async function buildClientDetails(
    ctx: any,
    client: any,
    branches: Array<{ _id: Id<"branches">, name: string }>
) {
    const person = client.person_id ? await ctx.db.get(client.person_id) : null;
    const user = client.user_id ? await ctx.db.get(client.user_id) : null;

    // Obtener contacto de emergencia
    const emergencyContact = person
        ? await ctx.db
            .query("emergency_contact")
            .withIndex("by_person", (q: any) => q.eq("person_id", person._id))
            .filter((q: any) => q.eq(q.field("active"), true))
            .first()
        : null;

    return {
        ...client,
        person: person
            ? {
                name: person.name,
                last_name: person.last_name,
                document_type: person.document_type,
                document_number: person.document_number,
                phone: person.phone,
                born_date: person.born_date,
            }
            : null,
        user: user
            ? {
                email: user.email,
            }
            : null,
        emergency_contact: emergencyContact
            ? {
                name: emergencyContact.name,
                phone: emergencyContact.phone,
                relationship: emergencyContact.relationship,
            }
            : null,
        branches,
    };
}

// Helper function to get client branches
async function getClientBranches(ctx: any, clientId: Id<"clients">) {
    const clientBranches = await ctx.db
        .query("client_branches")
        .withIndex("by_client", (q: any) => q.eq("client_id", clientId))
        .filter((q: any) => q.eq(q.field("active"), true))
        .collect();

    const branches = [];
    for (const cb of clientBranches) {
        const branch = cb.branch_id ? await ctx.db.get(cb.branch_id) : null;
        if (branch) {
            branches.push({
                _id: branch._id,
                name: branch.name,
            });
        }
    }

    return branches;
}

// Query para obtener todos los clientes con detalles (admin solo ve los de su sede)
export const getMyClientsWithDetails = query({
    args: {},
    handler: async (ctx) => {
        // Verificar autenticación
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        // Buscar usuario actual
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .first();

        if (!currentUser) {
            return [];
        }

        // Verificar si es super admin
        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", currentUser._id).eq("active", true)
            )
            .collect();

        const isSuperAdmin = roles.some(role => role.role === "SUPER_ADMIN");

        // Si es super admin, devolver todos los clientes
        if (isSuperAdmin) {
            const clients = await ctx.db
                .query("clients")
                .filter((q) => q.eq(q.field("active"), true))
                .collect();

            const clientsWithDetails = [];
            for (const client of clients) {
                const branches = await getClientBranches(ctx, client._id);
                const details = await buildClientDetails(ctx, client, branches);
                clientsWithDetails.push(details);
            }

            return clientsWithDetails;
        }

        // Si es admin regular, buscar su sede asignada
        const isAdmin = roles.some(role => role.role === "ADMIN");
        if (!isAdmin) {
            return [];
        }

        // Buscar la persona asociada al usuario
        const person = await ctx.db
            .query("persons")
            .withIndex("by_user", (q) => q.eq("user_id", currentUser._id))
            .first();

        if (!person) {
            return [];
        }

        // Buscar el admin asociado
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_person", (q) => q.eq("person_id", person._id))
            .first();

        if (!admin || !admin.branch_id) {
            return [];
        }

        // Obtener todos los client_branches de la sede del admin
        const clientBranches = await ctx.db
            .query("client_branches")
            .withIndex("by_branch", (q) => q.eq("branch_id", admin.branch_id!))
            .filter((q) => q.eq(q.field("active"), true))
            .collect();

        // Obtener la sede del admin
        const branch = await ctx.db.get(admin.branch_id);
        const branchInfo = branch ? [{ _id: branch._id, name: branch.name }] : [];

        const clientsWithDetails = [];
        for (const cb of clientBranches) {
            const client = await ctx.db.get(cb.client_id);
            if (!client || !client.active) continue;

            const details = await buildClientDetails(ctx, client, branchInfo);
            clientsWithDetails.push(details);
        }

        return clientsWithDetails;
    },
});

// Obtener cliente por id (SUPER_ADMIN libre - ADMIN solo si pertenece a su branch).
export const getClient = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(getClientSchema, args.payload, "getClient");
        const clientId = data.client_id as Id<"clients">;

        const client = await ctx.db.get(clientId);
        if (!client) throw new Error("Cliente no encontrado.");

        if (await isSuperAdmin(ctx)) {
            return client;
        }

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

        if (!link) throw new Error("Acceso denegado: el cliente no pertenece a la sede del ADMIN.");

        return client;
    },
});

// Listar clientes por branch (solo ADMIN de esa branch).
export const listClientsByBranch = query({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(listClientsByBranchSchema, args.payload, "listClientsByBranch");
        const branchId = data.branch_id as Id<"branches">;

        const admin = await getCurrentActiveAdmin(ctx);
        if (!admin || admin.branch_id !== branchId) {
            throw new Error("Acceso denegado: requiere ADMIN asignado a esta sede.");
        }

        const links = await ctx.db
            .query("client_branches")
            .withIndex("by_branch", (q) => q.eq("branch_id", branchId))
            .filter((q) => q.eq(q.field("active"), true))
            .collect();

        // Traer clientes y aplicar filtro opcional por status
        const clients = await Promise.all(
            links.map((l) => ctx.db.get(l.client_id as Id<"clients">))
        );

        const filtered = clients
            .filter((c): c is NonNullable<typeof c> => !!c)
            .filter((c) => (data.status ? c.status === data.status : true));

        return filtered;
    },
});

// Queries internas para la action createClientComplete
export const getUserByClerkId = internalQuery({
    args: {
        clerk_id: v.string(),
    },
    handler: async (ctx, { clerk_id }) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", clerk_id))
            .first();
    },
});

export const getUserRolesInternal = internalQuery({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", userId).eq("active", true)
            )
            .collect();
    },
});

export const checkPersonByDocument = internalQuery({
    args: {
        document_number: v.string(),
    },
    handler: async (ctx, { document_number }) => {
        return await ctx.db
            .query("persons")
            .withIndex("by_document", (q) => q.eq("document_type", "CC").eq("document_number", document_number))
            .first() || await ctx.db
                .query("persons")
                .filter((q) => q.eq(q.field("document_number"), document_number))
                .first();
    },
});

export const checkAdminPermissions = internalQuery({
    args: {
        clerk_id: v.string(),
    },
    handler: async (ctx, { clerk_id }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", clerk_id))
            .first();

        if (!user) {
            return { hasPermission: false, user: null };
        }

        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", user._id).eq("active", true)
            )
            .collect();

        const hasPermission = roles.some(
            (role) => role.role === "ADMIN" || role.role === "SUPER_ADMIN"
        );

        return { hasPermission, user };
    },
});

export const getPersonByUserId = internalQuery({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("persons")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .filter((q) => q.eq(q.field("active"), true))
            .first();
    },
});

export const getAdminByPersonId = internalQuery({
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

/**
 * Query para obtener el cliente del usuario autenticado actual
 * Retorna el registro de cliente completo incluyendo el estado de pago
 * 
 * Permisos:
 * - Solo el usuario autenticado puede obtener su propio cliente
 */
export const getMyClientProfile = query({
    args: {},
    handler: async (ctx) => {
        const currentUser = await mustGetCurrentUser(ctx);

        // Buscar el cliente asociado al usuario actual
        const client = await ctx.db
            .query("clients")
            .withIndex("by_user", (q) => q.eq("user_id", currentUser._id))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!client) {
            return null;
        }

        return {
            client_id: client._id,
            is_payment_active: client.is_payment_active,
            status: client.status,
            join_date: client.join_date,
            end_date: client.end_date,
        };
    },
});

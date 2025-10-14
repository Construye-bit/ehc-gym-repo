import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireSuperAdmin } from "./utils";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";

type BranchWithDetails = Doc<"branches"> & {
    address: {
        main_address: string;
        reference?: string;
        latitude?: number;
        longitude?: number;
        city_id?: Id<"cities">;
    } | null;
    city: {
        name: string;
        state_region: string;
        country: string;
        type: "CIUDAD" | "MUNICIPIO" | "PUEBLO";
        postal_code?: string;
    } | null;
    manager: {
        name: string;
        email: string;
        phone?: string;
    } | null;
    trainers: Array<Doc<"trainers"> & {
        person: {
            name: string;
            last_name: string;
            document_type: "CC" | "TI" | "CE" | "PASSPORT";
            document_number: string;
        } | null;
    }>;
};

export const getAllWithDetails = query({
    args: {},
    handler: async (ctx): Promise<BranchWithDetails[]> => {
        await requireSuperAdmin(ctx);

        const branches = await ctx.db.query("branches").collect();
        const branchesWithDetails = [];

        for (const branch of branches) {
            // Obtener la dirección y ciudad
            const address = branch.address_id
                ? await ctx.db.get(branch.address_id)
                : null;

            const city = address?.city_id
                ? await ctx.db.get(address.city_id)
                : null;

            // Obtener el administrador de la sede
            const manager = branch.manager_id
                ? await ctx.db.get(branch.manager_id)
                : null;

            // Obtener los entrenadores de esta branch usando la query interna
            const trainers = await ctx.runQuery(internal.trainers.queries.getTrainersByBranch, {
                branchId: branch._id,
            });

            branchesWithDetails.push({
                ...branch,
                address: address
                    ? {
                        main_address: address.main_address,
                        reference: address.reference,
                        latitude: address.latitude,
                        longitude: address.longitude,
                        city_id: address.city_id,
                    }
                    : null,
                city: city
                    ? {
                        name: city.name,
                        state_region: city.state_region,
                        country: city.country,
                        type: city.type,
                        postal_code: city.postal_code,
                    }
                    : null,
                manager: manager
                    ? {
                        name: manager.name,
                        email: manager.email,
                    }
                    : null,
                trainers: trainers,
            });
        }

        return branchesWithDetails;
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        await requireSuperAdmin(ctx);
        return await ctx.db.query("branches").collect();
    },
});

// Alias for compatibility with frontend
export const getAll = list;

export const getById = query({
    args: { branchId: v.id("branches") },
    handler: async (ctx, { branchId }): Promise<BranchWithDetails | null> => {
        await requireSuperAdmin(ctx);

        const branch = await ctx.db.get(branchId);
        if (!branch) {
            return null;
        }

        // Obtener la dirección y ciudad
        const address = branch.address_id
            ? await ctx.db.get(branch.address_id)
            : null;

        const city = address?.city_id
            ? await ctx.db.get(address.city_id)
            : null;

        // Obtener el administrador de la sede
        const manager = branch.manager_id
            ? await ctx.db.get(branch.manager_id)
            : null;

        // Obtener los entrenadores de esta branch usando la query interna
        const trainers = await ctx.runQuery(internal.trainers.queries.getTrainersByBranch, {
            branchId: branch._id,
        });

        return {
            ...branch,
            address: address
                ? {
                    main_address: address.main_address,
                    reference: address.reference,
                    latitude: address.latitude,
                    longitude: address.longitude,
                    city_id: address.city_id,
                }
                : null,
            city: city
                ? {
                    name: city.name,
                    state_region: city.state_region,
                    country: city.country,
                    type: city.type,
                    postal_code: city.postal_code,
                }
                : null,
            manager: manager
                ? {
                    name: manager.name,
                    email: manager.email,
                }
                : null,
            trainers: trainers,
        };
    },
});

// Query para que un administrador vea el detalle de una sede específica
export const getByIdForAdmin = query({
    args: { branchId: v.id("branches") },
    handler: async (ctx, { branchId }): Promise<BranchWithDetails | null> => {
        // Obtener el usuario actual
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // Buscar el usuario en la base de datos
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .first();

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Buscar el admin asociado a este usuario
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .filter((q) => q.eq(q.field("status"), "ACTIVE"))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!admin) {
            throw new Error("No tienes permisos de administrador");
        }

        // Verificar si es super admin o si la sede corresponde a su branch_id
        const roleAssignments = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) => q.eq("user_id", user._id).eq("active", true))
            .collect();

        const isSuperAdmin = roleAssignments.some(ra => ra.role === "SUPER_ADMIN");

        // Si no es super admin, verificar que la sede sea la asignada
        if (!isSuperAdmin && admin.branch_id !== branchId) {
            throw new Error("No tienes permiso para ver esta sede");
        }

        // Obtener la sede
        const branch = await ctx.db.get(branchId);
        if (!branch) {
            return null;
        }

        // Obtener la dirección y ciudad
        const address = branch.address_id
            ? await ctx.db.get(branch.address_id)
            : null;

        const city = address?.city_id
            ? await ctx.db.get(address.city_id)
            : null;

        // Obtener el administrador de la sede
        const manager = branch.manager_id
            ? await ctx.db.get(branch.manager_id)
            : null;

        // Obtener los entrenadores de esta branch
        const trainers = await ctx.runQuery(internal.trainers.queries.getTrainersByBranch, {
            branchId: branch._id,
        });

        return {
            ...branch,
            address: address
                ? {
                    main_address: address.main_address,
                    reference: address.reference,
                    latitude: address.latitude,
                    longitude: address.longitude,
                    city_id: address.city_id,
                }
                : null,
            city: city
                ? {
                    name: city.name,
                    state_region: city.state_region,
                    country: city.country,
                    type: city.type,
                    postal_code: city.postal_code,
                }
                : null,
            manager: manager
                ? {
                    name: manager.name,
                    email: manager.email,
                }
                : null,
            trainers: trainers,
        };
    },
});

// Query simple para obtener una sede por nombre
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

// Query simple para obtener una sede por ID
export const getBranchById = query({
    args: {
        branchId: v.id("branches"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.branchId);
    },
});

// Query para que el administrador vea solo sus sedes asignadas
export const getMyBranchesWithDetails = query({
    args: {},
    handler: async (ctx): Promise<BranchWithDetails[]> => {
        // Obtener el usuario actual
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            // Devolver array vacío si no está autenticado (sesión cargando)
            return [];
        }

        // Buscar el usuario en la base de datos
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .first();

        if (!user) {
            // Devolver array vacío si el usuario no existe en la BD
            return [];
        }

        // Buscar el admin asociado a este usuario
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .filter((q) => q.eq(q.field("status"), "ACTIVE"))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        // Si es super admin (no tiene branch_id), devolver todas las sedes
        if (!admin || !admin.branch_id) {
            // Verificar si es super admin
            const roleAssignments = await ctx.db
                .query("role_assignments")
                .withIndex("by_user_active", (q) => q.eq("user_id", user._id).eq("active", true))
                .collect();

            const isSuperAdmin = roleAssignments.some((ra) => ra.role === "SUPER_ADMIN");

            if (isSuperAdmin) {
                // Si es super admin, devolver todas las sedes
                const branches = await ctx.db.query("branches").collect();
                const branchesWithDetails = [];

                for (const branch of branches) {
                    const address = branch.address_id
                        ? await ctx.db.get(branch.address_id)
                        : null;

                    const city = address?.city_id
                        ? await ctx.db.get(address.city_id)
                        : null;

                    const manager = branch.manager_id
                        ? await ctx.db.get(branch.manager_id)
                        : null;

                    const trainers = await ctx.runQuery(internal.trainers.queries.getTrainersByBranch, {
                        branchId: branch._id,
                    });

                    branchesWithDetails.push({
                        ...branch,
                        address: address
                            ? {
                                main_address: address.main_address,
                                reference: address.reference,
                                latitude: address.latitude,
                                longitude: address.longitude,
                                city_id: address.city_id,
                            }
                            : null,
                        city: city
                            ? {
                                name: city.name,
                                state_region: city.state_region,
                                country: city.country,
                                type: city.type,
                                postal_code: city.postal_code,
                            }
                            : null,
                        manager: manager
                            ? {
                                name: manager.name,
                                email: manager.email,
                            }
                            : null,
                        trainers: trainers,
                    });
                }

                return branchesWithDetails;
            }

            // Si no es super admin y no tiene branch_id, no tiene acceso a ninguna sede
            return [];
        }

        // Si tiene branch_id, devolver solo esa sede
        const branch = await ctx.db.get(admin.branch_id);
        if (!branch) {
            return [];
        }

        const address = branch.address_id
            ? await ctx.db.get(branch.address_id)
            : null;

        const city = address?.city_id
            ? await ctx.db.get(address.city_id)
            : null;

        const manager = branch.manager_id
            ? await ctx.db.get(branch.manager_id)
            : null;

        const trainers = await ctx.runQuery(internal.trainers.queries.getTrainersByBranch, {
            branchId: branch._id,
        });

        return [{
            ...branch,
            address: address
                ? {
                    main_address: address.main_address,
                    reference: address.reference,
                    latitude: address.latitude,
                    longitude: address.longitude,
                    city_id: address.city_id,
                }
                : null,
            city: city
                ? {
                    name: city.name,
                    state_region: city.state_region,
                    country: city.country,
                    type: city.type,
                    postal_code: city.postal_code,
                }
                : null,
            manager: manager
                ? {
                    name: manager.name,
                    email: manager.email,
                }
                : null,
            trainers: trainers,
        }];
    },
});
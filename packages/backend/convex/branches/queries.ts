import { query } from "../_generated/server";
import { requireSuperAdmin } from "./utils";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";

type BranchWithDetails = Doc<"branches"> & {
    address: {
        main_address: string;
        reference?: string;
        latitude?: number;
        longitude?: number;
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
                        phone: manager.phone,
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
        return await ctx.db.query("branches").collect();
    },
});
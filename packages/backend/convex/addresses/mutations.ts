import { mutation } from "../_generated/server";
import { requireSuperAdmin } from "./utils";
import { v } from "convex/values";
import { InvalidCoordinatesError } from "./errors";

export const create = mutation({
    args: {
        city_id: v.id("cities"),
        main_address: v.string(),
        reference: v.optional(v.string()),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        // Validar coordenadas si se proporcionan
        if (args.latitude !== undefined || args.longitude !== undefined) {
            if (args.latitude === undefined || args.longitude === undefined) {
                throw new InvalidCoordinatesError("Debe proporcionar tanto latitud como longitud");
            }

            if (args.latitude < -90 || args.latitude > 90) {
                throw new InvalidCoordinatesError("La latitud debe estar entre -90 y 90");
            }

            if (args.longitude < -180 || args.longitude > 180) {
                throw new InvalidCoordinatesError("La longitud debe estar entre -180 y 180");
            }
        }

        // Verificar que la ciudad existe
        const city = await ctx.db.get(args.city_id);
        if (!city) {
            throw new Error("Ciudad no encontrada");
        }

        const now = Date.now();

        const addressId = await ctx.db.insert("addresses", {
            city_id: args.city_id,
            main_address: args.main_address,
            reference: args.reference,
            latitude: args.latitude,
            longitude: args.longitude,
            created_at: now,
            updated_at: now,
            active: true,
        });

        return { success: true, addressId };
    },
});

export const update = mutation({
    args: {
        addressId: v.id("addresses"),
        city_id: v.optional(v.id("cities")),
        main_address: v.optional(v.string()),
        reference: v.optional(v.string()),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, { addressId, ...updates }) => {
        await requireSuperAdmin(ctx);

        const address = await ctx.db.get(addressId);
        if (!address) {
            throw new Error("Dirección no encontrada");
        }

        // Validar coordenadas si se están actualizando
        if (updates.latitude !== undefined || updates.longitude !== undefined) {
            const newLat = updates.latitude !== undefined ? updates.latitude : address.latitude;
            const newLon = updates.longitude !== undefined ? updates.longitude : address.longitude;

            if ((newLat !== undefined && newLon === undefined) || (newLat === undefined && newLon !== undefined)) {
                throw new InvalidCoordinatesError("Debe proporcionar tanto latitud como longitud");
            }

            if (newLat !== undefined && newLat !== null && (newLat < -90 || newLat > 90)) {
                throw new InvalidCoordinatesError("La latitud debe estar entre -90 y 90");
            }

            if (newLon !== undefined && newLon !== null && (newLon < -180 || newLon > 180)) {
                throw new InvalidCoordinatesError("La longitud debe estar entre -180 y 180");
            }
        }

        // Verificar que la nueva ciudad existe si se está actualizando
        if (updates.city_id) {
            const city = await ctx.db.get(updates.city_id);
            if (!city) {
                throw new Error("Ciudad no encontrada");
            }
        }

        await ctx.db.patch(addressId, {
            ...updates,
            updated_at: Date.now(),
        });

        return { success: true };
    },
});

export const deleteAddress = mutation({
    args: { addressId: v.id("addresses") },
    handler: async (ctx, { addressId }) => {
        await requireSuperAdmin(ctx);

        // Verificar si hay sedes usando esta dirección
        const branchesWithAddress = await ctx.db
            .query("branches")
            .filter((q) => q.eq(q.field("address_id"), addressId))
            .first();

        if (branchesWithAddress) {
            throw new Error("No se puede eliminar la dirección porque está siendo usada por una sede");
        }

        await ctx.db.delete(addressId);
        return { success: true };
    },
});

export const deactivate = mutation({
    args: { addressId: v.id("addresses") },
    handler: async (ctx, { addressId }) => {
        await requireSuperAdmin(ctx);

        await ctx.db.patch(addressId, {
            active: false,
            updated_at: Date.now(),
        });

        return { success: true };
    },
});
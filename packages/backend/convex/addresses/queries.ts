import { query } from "../_generated/server";
import { requireSuperAdmin, requireAdmin } from "./utils";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        await requireSuperAdmin(ctx);
        return await ctx.db.query("addresses").collect();
    },
});

export const getByCity = query({
    args: {
        cityId: v.id("cities"),
    },
    handler: async (ctx, { cityId }) => {
        await requireSuperAdmin(ctx);

        return await ctx.db
            .query("addresses")
            .withIndex("by_city_active", (q) =>
                q.eq("city_id", cityId).eq("active", true)
            )
            .collect();
    },
});

export const getByCityForAdmins = query({
    args: {
        cityId: v.id("cities"),
    },
    handler: async (ctx, { cityId }) => {
        // Solo requiere autenticación, disponible para todos los admins
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        return await ctx.db
            .query("addresses")
            .withIndex("by_city_active", (q) =>
                q.eq("city_id", cityId).eq("active", true)
            )
            .collect();
    },
});

export const getAllWithDetails = query({
    args: {},
    handler: async (ctx) => {
        await requireSuperAdmin(ctx);

        const addresses = await ctx.db.query("addresses").collect();
        const addressesWithDetails = [];

        for (const address of addresses) {
            const city = address.city_id
                ? await ctx.db.get(address.city_id)
                : null;

            addressesWithDetails.push({
                ...address,
                city: city
                    ? {
                        name: city.name,
                        state_region: city.state_region,
                        country: city.country,
                        type: city.type,
                        postal_code: city.postal_code,
                    }
                    : null,
            });
        }

        return addressesWithDetails;
    },
});

export const searchByArea = query({
    args: {
        latitude: v.number(),
        longitude: v.number(),
        radiusKm: v.optional(v.number()), // Radio en kilómetros, por defecto 10km
    },
    handler: async (ctx, { latitude, longitude, radiusKm = 10 }) => {
        await requireSuperAdmin(ctx);

        // Aproximación simple para búsqueda por área
        // En producción, podrías usar una biblioteca de geolocalización más precisa
        const latDelta = radiusKm / 111; // Aproximadamente 111 km por grado de latitud
        const lonDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

        return await ctx.db
            .query("addresses")
            .filter((q) =>
                q.and(
                    q.gte(q.field("latitude"), latitude - latDelta),
                    q.lte(q.field("latitude"), latitude + latDelta),
                    q.gte(q.field("longitude"), longitude - lonDelta),
                    q.lte(q.field("longitude"), longitude + lonDelta),
                    q.eq(q.field("active"), true)
                )
            )
            .collect();
    },
});

// === QUERIES FOR ADMINISTRATORS (without requiring super admin) ===

// List all addresses (for regular admins)
export const listForAdmins = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return await ctx.db.query("addresses").collect();
    },
});
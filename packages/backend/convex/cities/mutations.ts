import { mutation } from "../_generated/server";
import { requireSuperAdmin } from "./utils";
import { v } from "convex/values";
import { CityAlreadyExistsError } from "./errors";
import { validateWithZod, createCitySchema, updateCitySchema } from "./validations";

export const create = mutation({
    args: {
        country: v.string(),
        state_region: v.string(),
        name: v.string(),
        type: v.union(v.literal("CIUDAD"), v.literal("MUNICIPIO"), v.literal("PUEBLO")),
        postal_code: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        // Validar datos con Zod
        const validatedData = validateWithZod(createCitySchema, args, "crear ciudad");

        // Verificar si ya existe una ciudad con el mismo nombre en la misma región
        const existingCity = await ctx.db
            .query("cities")
            .filter((q) =>
                q.and(
                    q.eq(q.field("name"), validatedData.name),
                    q.eq(q.field("state_region"), validatedData.state_region),
                    q.eq(q.field("country"), validatedData.country)
                )
            )
            .first();

        if (existingCity) {
            throw new CityAlreadyExistsError();
        }

        const now = Date.now();

        const cityId = await ctx.db.insert("cities", {
            country: validatedData.country,
            state_region: validatedData.state_region,
            name: validatedData.name,
            type: validatedData.type,
            postal_code: validatedData.postal_code,
            created_at: now,
            updated_at: now,
        });

        return { success: true, cityId };
    },
});

export const update = mutation({
    args: {
        cityId: v.id("cities"),
        country: v.optional(v.string()),
        state_region: v.optional(v.string()),
        name: v.optional(v.string()),
        type: v.optional(v.union(v.literal("CIUDAD"), v.literal("MUNICIPIO"), v.literal("PUEBLO"))),
        postal_code: v.optional(v.string()),
    },
    handler: async (ctx, { cityId, ...updates }) => {
        await requireSuperAdmin(ctx);

        // Validar datos con Zod
        const validatedData = validateWithZod(updateCitySchema, updates, "actualizar ciudad");

        const city = await ctx.db.get(cityId);
        if (!city) {
            throw new Error("Ciudad no encontrada");
        }

        // Si se está actualizando el nombre, verificar duplicados
        if (validatedData.name && validatedData.name !== city.name) {
            const existingCity = await ctx.db
                .query("cities")
                .filter((q) =>
                    q.and(
                        q.eq(q.field("name"), validatedData.name!),
                        q.eq(q.field("state_region"), validatedData.state_region || city.state_region),
                        q.eq(q.field("country"), validatedData.country || city.country),
                        q.neq(q.field("_id"), cityId)
                    )
                )
                .first();

            if (existingCity) {
                throw new CityAlreadyExistsError();
            }
        }

        await ctx.db.patch(cityId, {
            ...validatedData,
            updated_at: Date.now(),
        });

        return { success: true };
    },
});

export const deleteCity = mutation({
    args: { cityId: v.id("cities") },
    handler: async (ctx, { cityId }) => {
        await requireSuperAdmin(ctx);

        // Verificar si hay direcciones asociadas a esta ciudad
        const addressesInCity = await ctx.db
            .query("addresses")
            .withIndex("by_city", (q) => q.eq("city_id", cityId))
            .first();

        if (addressesInCity) {
            throw new Error("No se puede eliminar la ciudad porque tiene direcciones asociadas");
        }

        await ctx.db.delete(cityId);
        return { success: true };
    },
});
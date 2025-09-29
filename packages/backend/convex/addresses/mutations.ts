import { mutation } from "../_generated/server";
import { requireSuperAdmin } from "./utils";
import { v } from "convex/values";
import { InvalidCoordinatesError } from "./errors";
import { validateWithZod, createAddressSchema, updateAddressSchema, deactivateAddressSchema } from "./validations";
import { Id } from "../_generated/dataModel";

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

        // Validar datos con Zod (incluye validación de coordenadas)
        const validatedData = validateWithZod(createAddressSchema, args, "crear dirección");

        // Verificar que la ciudad existe
        const city = await ctx.db.get(validatedData.city_id as Id<"cities">);
        if (!city) {
            throw new Error("Ciudad no encontrada");
        }

        const now = Date.now();

        const addressId = await ctx.db.insert("addresses", {
            city_id: validatedData.city_id as Id<"cities">,
            main_address: validatedData.main_address,
            reference: validatedData.reference,
            latitude: validatedData.latitude,
            longitude: validatedData.longitude,
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

        // Validar datos con Zod (incluye validación de coordenadas)
        const validatedData = validateWithZod(updateAddressSchema, updates, "actualizar dirección");

        const address = await ctx.db.get(addressId);
        if (!address) {
            throw new Error("Dirección no encontrada");
        }

        // Verificar que la nueva ciudad existe si se está actualizando
        if (validatedData.city_id) {
            const city = await ctx.db.get(validatedData.city_id as Id<"cities">);
            if (!city) {
                throw new Error("Ciudad no encontrada");
            }
        }

        await ctx.db.patch(addressId, {
            ...validatedData,
            city_id: validatedData.city_id as Id<"cities"> | undefined,
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

        // Validar datos con Zod
        const validatedData = validateWithZod(deactivateAddressSchema, { addressId }, "desactivar dirección");

        await ctx.db.patch(validatedData.addressId as Id<"addresses">, {
            active: false,
            updated_at: Date.now(),
        });

        return { success: true };
    },
});
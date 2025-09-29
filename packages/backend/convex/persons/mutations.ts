import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { validateWithZod, createPersonSchema } from "./validations";
import { Id } from "../_generated/dataModel";

export const create = mutation({
    args: {
        user_id: v.id("users"),
        name: v.string(),
        last_name: v.string(),
        phone: v.string(),
        born_date: v.string(),
        document_type: v.union(
            v.literal("CC"),
            v.literal("TI"),
            v.literal("CE"),
            v.literal("PASSPORT")
        ),
        document_number: v.string(),
    },
    handler: async (ctx, args) => {
        // Validar datos con Zod (incluye validación de edad, teléfono, documento)
        const validatedData = validateWithZod(createPersonSchema, args, "crear persona");

        const now = Date.now();

        const person = await ctx.db.insert("persons", {
            user_id: validatedData.user_id as Id<"users">,
            name: validatedData.name,
            last_name: validatedData.last_name,
            born_date: validatedData.born_date,
            phone: validatedData.phone,
            document_type: validatedData.document_type,
            document_number: validatedData.document_number,
            created_at: now,
            updated_at: now,
            active: true,
        });
        return person;
    },
});

// Mutación para eliminar una persona
export const deletePerson = mutation({
    args: {
        personId: v.id("persons"),
    },
    handler: async (ctx, { personId }) => {
        // Validar que la persona existe
        const person = await ctx.db.get(personId);
        if (!person) {
            throw new Error("Persona no encontrada");
        }

        // Eliminar la persona
        await ctx.db.delete(personId);

        return { success: true };
    }
});

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const create = mutation({
    args: {
        person_id: v.id("persons"),
        name: v.string(),
        phone: v.string(),
        relationship: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const emergencyContactId = await ctx.db.insert("emergency_contact", {
            person_id: args.person_id as Id<"persons">,
            name: args.name,
            phone: args.phone,
            relationship: args.relationship,
            active: true,
            created_at: now,
            updated_at: now,
        });

        return emergencyContactId;
    },
});

export const update = mutation({
    args: {
        emergency_contact_id: v.id("emergency_contact"),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        relationship: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { emergency_contact_id, ...updates } = args;

        const emergencyContact = await ctx.db.get(emergency_contact_id);
        if (!emergencyContact) {
            throw new Error("Contacto de emergencia no encontrado");
        }

        const patch: any = {
            ...updates,
            updated_at: Date.now(),
        };

        await ctx.db.patch(emergency_contact_id, patch);
        return emergency_contact_id;
    },
});

export const deactivate = mutation({
    args: {
        emergency_contact_id: v.id("emergency_contact"),
    },
    handler: async (ctx, args) => {
        const emergencyContact = await ctx.db.get(args.emergency_contact_id);
        if (!emergencyContact) {
            throw new Error("Contacto de emergencia no encontrado");
        }

        await ctx.db.patch(args.emergency_contact_id, {
            active: false,
            updated_at: Date.now(),
        });

        return { success: true };
    },
});

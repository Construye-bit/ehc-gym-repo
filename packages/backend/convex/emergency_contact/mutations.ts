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
        // Authentication check
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        // Get the person record to verify ownership
        const person = await ctx.db.get(args.person_id);
        if (!person) {
            throw new Error("Persona no encontrada");
        }

        // Get user from identity
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .unique();

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Check if user owns this person OR has admin role
        const isOwner = person.user_id === user._id;

        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", user._id).eq("active", true)
            )
            .collect();

        const isAdmin = roles.some((r) => r.role === "ADMIN" || r.role === "SUPER_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new Error("No autorizado para crear contacto de emergencia para esta persona");
        }

        // Proceed with creation
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
        // Authentication check
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const { emergency_contact_id, ...updates } = args;

        const emergencyContact = await ctx.db.get(emergency_contact_id);
        if (!emergencyContact) {
            throw new Error("Contacto de emergencia no encontrado");
        }

        // Get the person record to verify ownership
        const person = await ctx.db.get(emergencyContact.person_id);
        if (!person) {
            throw new Error("Persona no encontrada");
        }

        // Get user from identity
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .unique();

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Check if user owns this person OR has admin role
        const isOwner = person.user_id === user._id;

        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", user._id).eq("active", true)
            )
            .collect();

        const isAdmin = roles.some((r) => r.role === "ADMIN" || r.role === "SUPER_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new Error("No autorizado para actualizar este contacto de emergencia");
        }

        // Proceed with update - build patch with only defined values
        const patch: any = {
            updated_at: Date.now(),
        };

        // Only add fields that are not undefined
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                patch[key] = value;
            }
        }

        await ctx.db.patch(emergency_contact_id, patch);
        return emergency_contact_id;
    },
});

export const deactivate = mutation({
    args: {
        emergency_contact_id: v.id("emergency_contact"),
    },
    handler: async (ctx, args) => {
        // Authentication check
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const emergencyContact = await ctx.db.get(args.emergency_contact_id);
        if (!emergencyContact) {
            throw new Error("Contacto de emergencia no encontrado");
        }

        // Get the person record to verify ownership
        const person = await ctx.db.get(emergencyContact.person_id);
        if (!person) {
            throw new Error("Persona no encontrada");
        }

        // Get user from identity
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .unique();

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Check if user owns this person OR has admin role
        const isOwner = person.user_id === user._id;

        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", user._id).eq("active", true)
            )
            .collect();

        const isAdmin = roles.some((r) => r.role === "ADMIN" || r.role === "SUPER_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new Error("No autorizado para desactivar este contacto de emergencia");
        }

        // Proceed with deactivation
        await ctx.db.patch(args.emergency_contact_id, {
            active: false,
            updated_at: Date.now(),
        });

        return { success: true };
    },
});

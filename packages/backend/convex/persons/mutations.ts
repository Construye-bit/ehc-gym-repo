import { mutation } from "../_generated/server";
import { v } from "convex/values";

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
        const now = Date.now();

        const person = await ctx.db.insert("persons", {
            user_id: args.user_id,
            name: args.name,
            last_name: args.last_name,
            born_date: args.born_date,
            document_type: args.document_type,
            document_number: args.document_number,
            created_at: now,
            updated_at: now,
            active: true,
        });
        return person;
    },
});

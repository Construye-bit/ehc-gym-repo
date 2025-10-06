import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import {
    linkClientToBranchSchema,
    unlinkClientFromBranchSchema,
    validateWithZod,
} from "./validations";
import { requireAdminAssignedToBranch } from "../admins/utils";
import { assertUniqueClientBranch } from "./utils";

export const linkClientToBranch = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(linkClientToBranchSchema, args.payload, "linkClientToBranch");
        const clientId = data.client_id as Id<"clients">;
        const branchId = data.branch_id as Id<"branches">;

        await requireAdminAssignedToBranch(ctx, branchId);
        await assertUniqueClientBranch(ctx, clientId, branchId);

        const now = Date.now();
        const id = await ctx.db.insert("client_branches", {
            client_id: clientId,
            branch_id: branchId,
            active: true,
            created_at: now,
            updated_at: now,
        });
        return id;
    },
});

export const unlinkClientFromBranch = mutation({
    args: { payload: v.any() },
    handler: async (ctx, args) => {
        const data = validateWithZod(unlinkClientFromBranchSchema, args.payload, "unlinkClientFromBranch");
        const clientId = data.client_id as Id<"clients">;
        const branchId = data.branch_id as Id<"branches">;

        await requireAdminAssignedToBranch(ctx, branchId);

        const link = await ctx.db
            .query("client_branches")
            .withIndex("by_client", (q) => q.eq("client_id", clientId))
            .filter((q) => q.eq(q.field("branch_id"), branchId))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

        if (!link) {
            throw new Error("Vínculo activo no encontrado.");
        }

        await ctx.db.patch(link._id, { active: false, updated_at: Date.now() });
        return link._id;
    },
});

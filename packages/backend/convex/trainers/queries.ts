import { internalQuery, query } from "../_generated/server";
import { requireSuperAdmin } from "./utils";
import type { Id } from '../_generated/dataModel';
import { v } from "convex/values";

export const getAllWithDetails = query({
    args: {},
    handler: async (ctx) => {
        await requireSuperAdmin(ctx);

        const trainers = await ctx.db.query("trainers").collect();
        const trainersWithDetails = [];

        for (const trainer of trainers) {
            const person = trainer.person_id
                ? await ctx.db.get(trainer.person_id)
                : null;

            const branch = trainer.branch_id
                ? await ctx.db.get(trainer.branch_id)
                : null;

            trainersWithDetails.push({
                ...trainer,
                person: person
                    ? {
                        name: person.name,
                        last_name: person.last_name,
                        document_type: person.document_type,
                        document_number: person.document_number,
                    }
                    : null,
                branch: branch
                    ? {
                        name: branch.name,
                    }
                    : null,
            });
        }

        return trainersWithDetails;
    },
});

export const getTrainersByBranch = internalQuery({
    args: {
        branchId: v.string(),
    },
    handler: async (ctx, { branchId }) => {
        await requireSuperAdmin(ctx);

        const trainers = await ctx.db
            .query("trainers")
            .withIndex("by_branch", (q) => q.eq("branch_id", branchId as Id<"branches">))
            .collect();

        const trainersWithDetails = [];

        for (const trainer of trainers) {
            const person = trainer.person_id
                ? await ctx.db.get(trainer.person_id)
                : null;

            trainersWithDetails.push({
                ...trainer,
                person: person
                    ? {
                        name: person.name,
                        last_name: person.last_name,
                        document_type: person.document_type,
                        document_number: person.document_number,
                    }
                    : null,
            });
        }

        return trainersWithDetails;
    },
});
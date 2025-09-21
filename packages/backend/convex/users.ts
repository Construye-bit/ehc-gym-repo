import {
    mutation,
    query,
    internalMutation,
    internalQuery,
    QueryCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { UserJSON } from "@clerk/backend";

// ====== Queries ======

/** User login status */
export const userLoginStatus = query(
    async (
        ctx
    ): Promise<
        | ["No JWT Token", null]
        | ["No Clerk User", null]
        | ["Logged In", Doc<"users">]
    > => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return ["No JWT Token", null];

        const user = await getCurrentUser(ctx);
        if (!user) return ["No Clerk User", null];

        return ["Logged In", user];
    }
);

/** Current user */
export const currentUser = query((ctx: QueryCtx) => getCurrentUser(ctx));

/** Get user by Clerk ID */
export const getUser = internalQuery({
    args: { subject: v.string() },
    async handler(ctx, args) {
        return await userQuery(ctx, args.subject);
    },
});

// ====== Mutations ======

/** Create or update user from Clerk Webhook */
export const updateOrCreateUser = internalMutation({
    args: { clerkUser: v.any() },
    async handler(ctx, { clerkUser }: { clerkUser: UserJSON }) {
        const userRecord = await userQuery(ctx, clerkUser.id);
        const now = Date.now();

        if (userRecord) {
            await ctx.db.patch(userRecord._id, {
                name: `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`,
                email: clerkUser.email_addresses[0]?.email_address || "",
                phone: clerkUser.phone_numbers?.[0]?.phone_number,
                updated_at: now,
                active: true,
            });
            return userRecord._id;
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            clerk_id: clerkUser.id,
            name: `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`,
            email: clerkUser.email_addresses[0]?.email_address || "",
            phone: clerkUser.phone_numbers?.[0]?.phone_number,
            updated_at: now,
            active: true,
        });

        // ---- Roles: first user = SUPER_ADMIN ----
        const count = await ctx.db.query("users").collect();
        const role = count.length === 1 ? "SUPER_ADMIN" : "CLIENT";

        await ctx.db.insert("role_assignments", {
            user_id: userId,
            role,
            assigned_at: now,
            active: true,
        });

        return userId;
    },
});

/** Delete user and associated roles */
export const deleteUser = internalMutation({
    args: { id: v.string() },
    async handler(ctx, { id }) {
        const userRecord = await userQuery(ctx, id);
        if (!userRecord) return;

        // Delete roles
        const roles = await ctx.db
            .query("role_assignments")
            .withIndex("by_user_active", (q) =>
                q.eq("user_id", userRecord._id).eq("active", true)
            )
            .collect();

        for (const role of roles) {
            await ctx.db.delete(role._id);
        }

        // Delete user
        await ctx.db.delete(userRecord._id);
    },
});

// ====== Helpers ======

export async function userQuery(
    ctx: QueryCtx,
    clerkUserId: string
): Promise<Doc<"users"> | null> {
    return await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", clerkUserId))
        .unique();
}

async function getCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await userQuery(ctx, identity.subject);
}

export async function mustGetCurrentUser(ctx: QueryCtx): Promise<Doc<"users">> {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Can't get current user");
    return user;
}

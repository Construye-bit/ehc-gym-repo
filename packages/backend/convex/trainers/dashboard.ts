import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Obtener estadísticas del dashboard del entrenador
 */
export const getTrainerDashboard = query({
    args: {},
    handler: async (ctx) => {
        // 1. Obtener usuario autenticado
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .unique();

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // 2. Obtener trainer asociado
        const person = await ctx.db
            .query("persons")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .first();

        if (!person) {
            throw new Error("Persona no encontrada");
        }

        const trainer = await ctx.db
            .query("trainers")
            .withIndex("by_person", (q) => q.eq("person_id", person._id))
            .first();

        if (!trainer) {
            throw new Error("Entrenador no encontrado");
        }

        // 3. Obtener publicaciones del trainer
        const posts = await ctx.db
            .query("posts")
            .withIndex("by_trainer", (q) => q.eq("trainer_id", trainer._id))
            .filter((q) => q.eq(q.field("deleted_at"), undefined))
            .collect();

        const totalPosts = posts.length;
        const totalLikes = posts.reduce((sum, post) => sum + post.likes_count, 0);

        // 4. Obtener conversaciones del trainer
        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_trainer_last_message", (q) =>
                q.eq("trainer_user_id", user._id)
            )
            .collect();

        const totalConversations = conversations.length;

        // Contar conversaciones activas (OPEN o CONTRACTED)
        const activeConversations = conversations.filter(
            (conv) => conv.status === "OPEN" || conv.status === "CONTRACTED"
        ).length;

        // 5. Contar mensajes no leídos
        let unreadMessagesCount = 0;
        for (const conversation of conversations) {
            const unreadMessages = await ctx.db
                .query("messages")
                .withIndex("by_conversation_status", (q) =>
                    q.eq("conversation_id", conversation._id).eq("status", "SENT")
                )
                .filter((q) => q.neq(q.field("author_user_id"), user._id))
                .collect();

            unreadMessagesCount += unreadMessages.length;
        }

        // 6. Obtener publicación más reciente
        const latestPost = posts.length > 0
            ? posts.sort((a, b) => b.published_at - a.published_at)[0]
            : null;

        // 7. Obtener información de la sede
        let branch = null;
        if (trainer.branch_id) {
            const branchData = await ctx.db.get(trainer.branch_id);
            if (branchData) {
                const address = await ctx.db.get(branchData.address_id);
                const city = address ? await ctx.db.get(address.city_id) : null;

                branch = {
                    _id: branchData._id,
                    name: branchData.name,
                    phone: branchData.phone,
                    status: branchData.status,
                    city: city?.name,
                };
            }
        }

        return {
            trainer_info: {
                _id: trainer._id,
                name: `${person.name} ${person.last_name}`,
                employee_code: trainer.employee_code,
                specialties: trainer.specialties,
                status: trainer.status,
                branch,
            },
            stats: {
                total_posts: totalPosts,
                total_likes: totalLikes,
                total_conversations: totalConversations,
                active_conversations: activeConversations,
                unread_messages: unreadMessagesCount,
            },
            latest_post: latestPost
                ? {
                    _id: latestPost._id,
                    title: latestPost.title,
                    likes_count: latestPost.likes_count,
                    published_at: latestPost.published_at,
                }
                : null,
        };
    },
});

/**
 * Obtener publicaciones recientes del entrenador para el dashboard
 */
export const getRecentPosts = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 5;

        // 1. Obtener usuario autenticado
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .unique();

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // 2. Obtener trainer asociado
        const person = await ctx.db
            .query("persons")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .first();

        if (!person) {
            throw new Error("Persona no encontrada");
        }

        const trainer = await ctx.db
            .query("trainers")
            .withIndex("by_person", (q) => q.eq("person_id", person._id))
            .first();

        if (!trainer) {
            throw new Error("Entrenador no encontrado");
        }

        // 3. Obtener publicaciones recientes
        const posts = await ctx.db
            .query("posts")
            .withIndex("by_trainer", (q) => q.eq("trainer_id", trainer._id))
            .filter((q) => q.eq(q.field("deleted_at"), undefined))
            .order("desc")
            .take(limit);

        return posts.map((post) => ({
            _id: post._id,
            title: post.title,
            description: post.description,
            image_url: post.image_url,
            likes_count: post.likes_count,
            published_at: post.published_at,
        }));
    },
});

/**
 * Obtener conversaciones recientes con mensajes no leídos
 */
export const getRecentConversations = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 5;

        // 1. Obtener usuario autenticado
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No autenticado");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
            .unique();

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // 2. Obtener conversaciones recientes
        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_trainer_last_message", (q) =>
                q.eq("trainer_user_id", user._id)
            )
            .order("desc")
            .take(limit);

        // 3. Enriquecer con datos del cliente y contar no leídos
        const enrichedConversations = await Promise.all(
            conversations.map(async (conversation) => {
                const clientUser = await ctx.db.get(conversation.client_user_id);
                const clientPerson = clientUser
                    ? await ctx.db
                        .query("persons")
                        .withIndex("by_user", (q) => q.eq("user_id", clientUser._id))
                        .first()
                    : null;

                // Contar mensajes no leídos
                const unreadMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation_status", (q) =>
                        q.eq("conversation_id", conversation._id).eq("status", "SENT")
                    )
                    .filter((q) => q.neq(q.field("author_user_id"), user._id))
                    .collect();

                return {
                    _id: conversation._id,
                    client_name: clientPerson
                        ? `${clientPerson.name} ${clientPerson.last_name}`
                        : "Cliente",
                    last_message_text: conversation.last_message_text,
                    last_message_at: conversation.last_message_at,
                    unread_count: unreadMessages.length,
                    status: conversation.status,
                };
            })
        );

        return enrichedConversations;
    },
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // ==================== USUARIOS Y AUTENTICACIÓN ====================

    users: defineTable({
        clerk_id: v.string(),
        name: v.string(),
        email: v.string(),
        updated_at: v.number(),
        active: v.boolean(),
    })
        .index("by_email", ["email"])
        .index("by_clerk_id", ["clerk_id"]), // <-- agrega este índice

    persons: defineTable({
        user_id: v.id("users"), // Conecta con users si es necesario
        name: v.string(),
        last_name: v.string(),
        born_date: v.string(),
        document_type: v.union(v.literal("CC"), v.literal("TI"), v.literal("CE"), v.literal("PASSPORT")),
        document_number: v.string(),
        phone: v.optional(v.string()),
        created_at: v.number(),
        updated_at: v.number(),
        active: v.boolean(),
    })
        .index("by_document", ["document_type", "document_number"])
        .index("by_user", ["user_id"]),

    emergency_contact: defineTable({
        person_id: v.id("persons"),
        name: v.string(),
        phone: v.string(),
        relationship: v.string(), // "padre", "madre", "esposo/a", "hermano/a", etc.
        active: v.boolean(),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_person", ["person_id"])
        .index("by_person_active", ["person_id", "active"]),

    // Asignaciones de rol (RBAC) - Mejorado
    role_assignments: defineTable({
        user_id: v.id("users"),
        role: v.union(v.literal("CLIENT"), v.literal("TRAINER"), v.literal("ADMIN"), v.literal("SUPER_ADMIN")),
        branch_id: v.optional(v.id("branches")), // Para administradores de sede
        assigned_at: v.number(),
        assigned_by_user_id: v.optional(v.id("users")),
        expires_at: v.optional(v.number()), // Para roles temporales
        active: v.boolean(),
    })
        .index("by_user_active", ["user_id", "active"])
        .index("by_user_role", ["user_id", "role"])
        .index("by_role", ["role"])
        .index("by_branch", ["branch_id"]),


    // ==================== DIRECCIONES ====================
    cities: defineTable({
        country: v.string(),
        state_region: v.string(),
        name: v.string(),
        type: v.union(v.literal("CIUDAD"), v.literal("MUNICIPIO"), v.literal("PUEBLO")),
        postal_code: v.optional(v.string()),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_name", ["name"])
        .index("by_postal_code", ["postal_code"]),

    addresses: defineTable({
        city_id: v.id("cities"),
        main_address: v.string(), // "Calle 19 # 11-44"
        reference: v.optional(v.string()), // "Frente al parque"
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        created_at: v.number(),
        updated_at: v.number(),
        active: v.boolean(),
    })
        .index("by_city", ["city_id"])
        .index("by_city_active", ["city_id", "active"])
        .index("by_coordinates", ["latitude", "longitude"]),

    // ==================== SEDES ====================

    branches: defineTable({
        name: v.string(),
        address_id: v.id("addresses"),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        opening_time: v.string(), // "06:00"
        closing_time: v.string(), // "22:00"
        max_capacity: v.number(),
        current_capacity: v.optional(v.number()), // Para control en tiempo real
        status: v.union(
            v.literal("ACTIVE"),
            v.literal("INACTIVE"),
            v.literal("UNDER_CONSTRUCTION"),
            v.literal("TEMPORARILY_CLOSED")
        ),
        opening_date: v.optional(v.number()),
        manager_id: v.optional(v.id("users")), // Administrador de la sede
        created_by_user_id: v.id("users"), // Quien creó la sede (debe ser super admin)
        created_at: v.number(),
        updated_at: v.number(),
        metadata: v.optional(v.object({
            has_parking: v.optional(v.boolean()),
            has_pool: v.optional(v.boolean()),
            has_sauna: v.optional(v.boolean()),
            has_spa: v.optional(v.boolean()),
            has_locker_rooms: v.optional(v.boolean()),
            wifi_available: v.optional(v.boolean()),
        })),
    })
        .index("by_address", ["address_id"])
        .index("by_status", ["status"])
        .index("by_manager", ["manager_id"])
        .index("by_creator", ["created_by_user_id"]),

    // ==================== ENTRENADORES ====================

    trainers: defineTable({
        person_id: v.id("persons"),
        user_id: v.optional(v.id("users")), // Si el entrenador tiene cuenta de usuario
        branch_id: v.optional(v.id("branches")),
        employee_code: v.string(), // Código único de empleado
        specialties: v.array(v.string()), // ["Yoga", "CrossFit", "Pilates"]
        hire_date: v.number(),
        contract_end_date: v.optional(v.number()),
        salary: v.optional(v.number()),
        hourly_rate: v.optional(v.number()),
        work_schedule: v.optional(v.object({
            monday: v.optional(v.object({ start: v.string(), end: v.string() })),
            tuesday: v.optional(v.object({ start: v.string(), end: v.string() })),
            wednesday: v.optional(v.object({ start: v.string(), end: v.string() })),
            thursday: v.optional(v.object({ start: v.string(), end: v.string() })),
            friday: v.optional(v.object({ start: v.string(), end: v.string() })),
            saturday: v.optional(v.object({ start: v.string(), end: v.string() })),
            sunday: v.optional(v.object({ start: v.string(), end: v.string() })),
        })),
        status: v.union(
            v.literal("ACTIVE"),
            v.literal("INACTIVE"),
            v.literal("ON_VACATION"),
        ),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_person", ["person_id"])
        .index("by_user", ["user_id"])
        .index("by_branch", ["branch_id"])
        .index("by_branch_status", ["branch_id", "status"])
        .index("by_employee_code", ["employee_code"])
        .index("by_status", ["status"])
        .index("by_specialty", ["specialties"]),


    // ==================== ADMINISTRADORES ====================
    admins: defineTable({
        person_id: v.id("persons"),
        user_id: v.optional(v.id("users")),
        branch_id: v.optional(v.id("branches")),
        status: v.union(v.literal("ACTIVE"), v.literal("INACTIVE")),
        created_by_user_id: v.id("users"),
        created_at: v.number(),
        updated_at: v.number(),
        active: v.boolean(),
    })
        .index("by_person", ["person_id"])
        .index("by_user", ["user_id"])
        .index("by_branch", ["branch_id"])
        .index("by_status", ["status"])
        .index("by_creator", ["created_by_user_id"]),


    // ==================== CLIENTES ====================
    clients: defineTable({
        person_id: v.id("persons"),
        user_id: v.optional(v.id("users")),
        status: v.union(v.literal("ACTIVE"), v.literal("INACTIVE")),
        is_payment_active: v.boolean(),
        join_date: v.number(),
        end_date: v.optional(v.number()),
        created_by_user_id: v.optional(v.id("users")),
        created_at: v.number(),
        updated_at: v.number(),
        active: v.boolean(),
    })
        .index("by_person", ["person_id"])
        .index("by_user", ["user_id"])
        .index("by_status", ["status"])
        .index("by_payment_active", ["is_payment_active"])
        .index("by_creator", ["created_by_user_id"]),


    // ==================== RELACIÓN CLIENTE–SEDE (múltiples sedes) ====================
    client_branches: defineTable({
        client_id: v.id("clients"),
        branch_id: v.id("branches"),
        active: v.boolean(),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_client", ["client_id"])
        .index("by_branch", ["branch_id"])
        .index("by_client_active", ["client_id", "active"])
        .index("by_branch_active", ["branch_id", "active"]),


    // ==================== INVITACIONES (invitar amigo) ====================
    invitations: defineTable({
        inviter_client_id: v.id("clients"),
        invitee_name: v.string(),
        invitee_email: v.optional(v.string()),
        invitee_phone: v.optional(v.string()),
        preferred_branch_id: v.optional(v.id("branches")),
        token: v.string(),
        status: v.union(
            v.literal("PENDING"),
            v.literal("REDEEMED"),
            v.literal("EXPIRED"),
            v.literal("CANCELED")
        ),
        expires_at: v.number(),
        active: v.boolean(),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_inviter_client", ["inviter_client_id"])
        .index("by_token", ["token"])
        .index("by_preferred_branch", ["preferred_branch_id"])
        .index("by_status", ["status"]),


    // ==================== EJEMPLO SIMPLE ====================
    todos: defineTable({
        text: v.string(),
        completed: v.boolean(),
    }),
});
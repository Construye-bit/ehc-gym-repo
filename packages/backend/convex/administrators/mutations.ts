import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { requireSuperAdmin } from "./utils";
import { generateEmployeeCode } from "./utils";
import { AdminNotFoundError, AdminInactiveError, DuplicateEmployeeCodeError, DuplicateDocumentError } from "./errors";

export const create = mutation({
    args: {
        personal_data: v.object({
            first_name: v.string(),
            last_name: v.string(),
            document_type: v.union(v.literal("CC"), v.literal("TI"), v.literal("CE"), v.literal("PASSPORT")),
            document_number: v.string(),
            phone: v.optional(v.string())
        }),
        user_data: v.object({
            clerk_id: v.optional(v.string()),
            email: v.string()
        }),
        admin_data: v.object({
            branch_id: v.optional(v.id("branches")),
            employee_code: v.optional(v.string()),
            hiring_date: v.number(),
            contract_end_date: v.optional(v.number()),
            salary: v.optional(v.number())
        })
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        // Verificar si ya existe una persona con ese documento
        const existingPerson = await ctx.db
            .query("persons")
            .withIndex("by_document", (q) => 
                q.eq("document_type", args.personal_data.document_type)
                 .eq("document_number", args.personal_data.document_number)
            )
            .first();

        if (existingPerson) {
            throw new Error("Ya existe una persona registrada con ese número de documento");
        }

        // Generar código de empleado único si no se proporciona
        const employeeCode = args.admin_data.employee_code || await generateEmployeeCode(ctx);

        // Verificar si ya existe un administrador con ese código
        const existingAdmin = await ctx.db
            .query("administrators")
            .withIndex("by_employee_code", q => q.eq("employee_code", employeeCode))
            .first();

        if (existingAdmin) {
            throw new DuplicateEmployeeCodeError();
        }

        // Crear usuario
        const userId = await ctx.db.insert("users", {
            clerk_id: args.user_data.clerk_id || "",
            email: args.user_data.email,
            active: true,
            name: `${args.personal_data.first_name} ${args.personal_data.last_name}`,
            updated_at: Date.now()
        });

        // Crear persona
        const personId = await ctx.db.insert("persons", {
            user_id: userId,
            name: args.personal_data.first_name,
            last_name: args.personal_data.last_name,
            document_type: args.personal_data.document_type,
            document_number: args.personal_data.document_number,
            phone: args.personal_data.phone,
            born_date: new Date().toISOString(), // TODO: Add to schema
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true
        });

        // Crear administrador
        const adminId = await ctx.db.insert("administrators", {
            person_id: personId,
            branch_id: args.admin_data.branch_id,
            employee_code: employeeCode,
            hire_date: args.admin_data.hiring_date,
            contract_end_date: args.admin_data.contract_end_date,
            salary: args.admin_data.salary,
            status: "ACTIVE",
            created_at: Date.now(),
            updated_at: Date.now()
        });

        // Asignar rol de ADMIN
        await ctx.db.insert("role_assignments", {
            user_id: userId,
            role: "ADMIN",
            branch_id: args.admin_data.branch_id,
            assigned_at: Date.now(),
            active: true,
        });

        return {
            user_id: userId,
            person_id: personId,
            admin_id: adminId
        };
    },
});

export const update = mutation({
    args: {
        admin_id: v.id("administrators"),
        personal_data: v.optional(v.object({
            first_name: v.optional(v.string()),
            last_name: v.optional(v.string()),
            document_type: v.optional(v.union(v.literal("CC"), v.literal("TI"), v.literal("CE"), v.literal("PASSPORT"))),
            document_number: v.optional(v.string()),
            phone: v.optional(v.string())
        })),
        user_data: v.optional(v.object({
            clerk_id: v.optional(v.string()),
            email: v.optional(v.string())
        })),
        admin_data: v.optional(v.object({
            branch_id: v.optional(v.id("branches")),
            employee_code: v.optional(v.string()),
            hiring_date: v.optional(v.number()),
            contract_end_date: v.optional(v.number()),
            salary: v.optional(v.number()),
            status: v.optional(v.union(v.literal("ACTIVE"), v.literal("INACTIVE"), v.literal("ON_VACATION")))
        }))
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        // Obtener administrador
        const admin = await ctx.db.get(args.admin_id);
        if (!admin) {
            throw new AdminNotFoundError();
        }

        // Actualizar datos del administrador
        if (args.admin_data) {
            await ctx.db.patch(args.admin_id, args.admin_data);
        }

        // Actualizar datos de persona
        if (args.personal_data) {
            await ctx.db.patch(admin.person_id, args.personal_data);
        }

        // Actualizar datos de usuario
        if (args.user_data && admin.person_id) {
            const person = await ctx.db.get(admin.person_id);
            if (person && person.user_id) {
                await ctx.db.patch(person.user_id, args.user_data);
            }
        }

        return { success: true };
    }
});

export const deactivate = mutation({
    args: { 
        admin_id: v.id("administrators") 
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);

        const admin = await ctx.db.get(args.admin_id);
        if (!admin) {
            throw new AdminNotFoundError();
        }

        if (admin.status === "INACTIVE") {
            throw new AdminInactiveError();
        }

        // Desactivar administrador
        await ctx.db.patch(args.admin_id, {
            status: "INACTIVE",
            updated_at: Date.now()
        });

        // Desactivar usuario asociado
        const person = await ctx.db.get(admin.person_id);
        if (person && person.user_id) {
            await ctx.db.patch(person.user_id, {
                active: false,
                updated_at: Date.now()
            });
        }

        return { success: true };
    }
});
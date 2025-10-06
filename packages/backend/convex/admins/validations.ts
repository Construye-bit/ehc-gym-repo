import { z } from "zod";

// ===== ENUNS / CONSTANTES =====
export const adminStatusSchema = z.enum(["ACTIVE", "INACTIVE"], {
    message: "El estado debe ser ACTIVE o INACTIVE",
});

// ===== ESQUEMAS DE VALIDACIÓN =====
export const createAdminSchema = z.object({
    person_id: z.string().min(1, "person_id es requerido"),
    user_id: z.string().min(1, "user_id no puede estar vacío").optional(),
});

export const assignAdminToBranchSchema = z.object({
    admin_id: z.string().min(1, "admin_id es requerido"),
    branch_id: z.string().min(1, "branch_id es requerido"),
});

export const revokeAdminFromBranchSchema = z.object({
    admin_id: z.string().min(1, "admin_id es requerido"),
});

export const updateAdminStatusSchema = z.object({
    admin_id: z.string().min(1, "admin_id es requerido"),
    status: adminStatusSchema,
});

export const getAdminSchema = z.object({
    admin_id: z.string().min(1, "admin_id es requerido"),
});

// ===== FUNCIÓN AUXILIAR PARA VALIDACIÓN =====
export function validateWithZod<T>(schema: z.ZodSchema<T>, data: unknown, context: string): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue =>
                `${issue.path.join(".")}: ${issue.message}`
            ).join(", ");
            throw new Error(`Validación fallida en ${context}: ${errorMessages}`);
        }
        throw new Error(`Error de validación en ${context}: ${error}`);
    }
}

// ===== TIPOS DERIVADOS =====
export type CreateAdminData = z.infer<typeof createAdminSchema>;
export type AssignAdminToBranchData = z.infer<typeof assignAdminToBranchSchema>;
export type RevokeAdminFromBranchData = z.infer<typeof revokeAdminFromBranchSchema>;
export type UpdateAdminStatusData = z.infer<typeof updateAdminStatusSchema>;
export type GetAdminData = z.infer<typeof getAdminSchema>;

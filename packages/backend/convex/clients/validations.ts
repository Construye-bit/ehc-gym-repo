import { z } from "zod";

// ===== ENUNS / CONSTANTES =====
export const clientStatusSchema = z.enum(["ACTIVE", "INACTIVE"], {
    message: "El estado debe ser ACTIVE o INACTIVE",
});

// ===== ESQUEMAS DE VALIDACIÓN =====
export const createClientSchema = z.object({
    person_id: z.string().min(1, "person_id es requerido"),
    user_id: z.string().min(1, "user_id no puede estar vacío").optional(),
    status: clientStatusSchema,
    is_payment_active: z.boolean(),
    join_date: z.number(),
    end_date: z.number().optional(),
}).refine(data => {
    if (data.join_date !== undefined && data.end_date !== undefined) {
        return data.end_date >= data.join_date;
    }
    return true;
}, {
    message: "end_date no puede ser anterior a join_date",
    path: ["end_date"],
});

export const updateClientSchema = z.object({
    client_id: z.string().min(1, "client_id es requerido"),
    status: clientStatusSchema.optional(),
    is_payment_active: z.boolean().optional(),
    join_date: z.number().optional(),
    end_date: z.number().optional(),
}).refine(data => {
    if (data.join_date !== undefined && data.end_date !== undefined) {
        return data.end_date >= data.join_date;
    }
    return true;
}, {
    message: "end_date no puede ser anterior a join_date",
    path: ["end_date"],
});

export const getClientSchema = z.object({
    client_id: z.string().min(1, "client_id es requerido"),
});

export const listClientsByBranchSchema = z.object({
    branch_id: z.string().min(1, "branch_id es requerido"),
    status: clientStatusSchema.optional(),
});

export const setClientPaymentActiveSchema = z.object({
    client_id: z.string().min(1, "client_id es requerido"),
    is_payment_active: z.boolean(),
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
export type CreateClientData = z.infer<typeof createClientSchema>;
export type UpdateClientData = z.infer<typeof updateClientSchema>;
export type GetClientData = z.infer<typeof getClientSchema>;
export type ListClientsByBranchData = z.infer<typeof listClientsByBranchSchema>;
export type SetClientPaymentActiveData = z.infer<typeof setClientPaymentActiveSchema>;

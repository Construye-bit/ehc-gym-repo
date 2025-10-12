import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN =====
export const linkClientToBranchSchema = z.object({
    client_id: z.string().min(1, "client_id es requerido"),
    branch_id: z.string().min(1, "branch_id es requerido"),
});

export const unlinkClientFromBranchSchema = z.object({
    client_id: z.string().min(1, "client_id es requerido"),
    branch_id: z.string().min(1, "branch_id es requerido"),
});

export const listClientBranchesSchema = z.object({
    client_id: z.string().min(1, "client_id es requerido"),
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
export type LinkClientToBranchData = z.infer<typeof linkClientToBranchSchema>;
export type UnlinkClientFromBranchData = z.infer<typeof unlinkClientFromBranchSchema>;
export type ListClientBranchesData = z.infer<typeof listClientBranchesSchema>;

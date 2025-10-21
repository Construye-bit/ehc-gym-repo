import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN =====

export const getPublicTrainersSchema = z.object({
  specialty: z.string().optional(),
  branchId: z.string().optional(),
  limit: z
    .number()
    .int()
    .min(1, "El límite debe ser al menos 1")
    .max(50, "El límite no puede exceder 50")
    .optional()
    .default(20),
  cursor: z.number().optional(),
});

// ===== FUNCIÓN AUXILIAR PARA VALIDACIÓN =====
export function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      throw new Error(`Validación fallida en ${context}: ${errorMessages}`);
    }
    throw new Error(`Error de validación en ${context}: ${error}`);
  }
}

// ===== TIPOS DERIVADOS =====
export type GetPublicTrainersData = z.infer<typeof getPublicTrainersSchema>;

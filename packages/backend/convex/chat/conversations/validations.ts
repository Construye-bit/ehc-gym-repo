import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN =====

export const createOrGetConversationSchema = z.object({
  trainerId: z.string().min(1, "El ID del entrenador es requerido"),
});

export const listMyConversationsSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1, "El límite debe ser al menos 1")
    .max(50, "El límite no puede exceder 50")
    .optional()
    .default(20),
  cursor: z.number().optional(),
});

export const markContractSchema = z.object({
  conversationId: z.string().min(1, "El ID de la conversación es requerido"),
  valid_until: z.number().positive("La fecha de expiración debe ser positiva"),
});

export const getConversationSchema = z.object({
  conversationId: z.string().min(1, "El ID de la conversación es requerido"),
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
export type CreateOrGetConversationData = z.infer<
  typeof createOrGetConversationSchema
>;
export type ListMyConversationsData = z.infer<typeof listMyConversationsSchema>;
export type MarkContractData = z.infer<typeof markContractSchema>;
export type GetConversationData = z.infer<typeof getConversationSchema>;

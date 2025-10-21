import { z } from "zod";

// ===== ESQUEMAS DE VALIDACIÓN =====

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, "El ID de la conversación es requerido"),
  text: z
    .string()
    .min(1, "El mensaje no puede estar vacío")
    .max(500, "El mensaje no puede exceder 500 caracteres")
    .trim(),
});

export const getMessagesSchema = z.object({
  conversationId: z.string().min(1, "El ID de la conversación es requerido"),
  limit: z
    .number()
    .int()
    .min(1, "El límite debe ser al menos 1")
    .max(100, "El límite no puede exceder 100")
    .optional()
    .default(50),
  cursor: z.number().optional(),
});

export const markAsReadSchema = z.object({
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
export type SendMessageData = z.infer<typeof sendMessageSchema>;
export type GetMessagesData = z.infer<typeof getMessagesSchema>;
export type MarkAsReadData = z.infer<typeof markAsReadSchema>;
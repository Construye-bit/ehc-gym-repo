import { z } from "zod";
import { INVITATION_ERRORS } from "./errors";

// ===== CONSTANTES =====
export const MAX_INVITATIONS_PER_MONTH = 5;

// ===== REGLAS =====
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[0-9\s\-\+\(\)]{10,15}$/;

// ===== ESQUEMAS DE VALIDACIÓN =====
export const inviteFriendSchema = z.object({
    inviter_client_id: z.string().min(1, "inviter_client_id es requerido"),
    invitee_name: z.string()
        .min(1, "El nombre del invitado es requerido")
        .max(100, "El nombre del invitado no puede exceder 100 caracteres"),
    invitee_email: z.string()
        .regex(emailRegex, "El correo electrónico no es válido")
        .max(100, "El correo electrónico no puede exceder 100 caracteres")
        .optional(),
    invitee_phone: z.string()
        .refine(
            (val) => !val || val === "" || phoneRegex.test(val),
            "El número de teléfono no es válido (10-15 dígitos)"
        )
        .optional(),
    invitee_document_number: z.string()
        .min(1, "El número de documento es requerido")
        .max(20, "El número de documento no puede exceder 20 caracteres")
        .regex(/^[0-9]+$/, "El número de documento solo puede contener números"),
    preferred_branch_id: z.string().min(1, "preferred_branch_id no puede estar vacío").optional(),
})
    .refine(
        (data) => Boolean(data.invitee_email) || Boolean(data.invitee_phone),
        { message: "Debe proporcionar email o teléfono del invitado", path: ["invitee_email"] }
    );

export const cancelInvitationSchema = z.object({
    invitation_id: z.string().min(1, "invitation_id es requerido"),
});

export const redeemInvitationSchema = z.object({
    invitation_id: z.string().min(1, "invitation_id es requerido"),
});

// listar por branch o por invitador
export const listInvitationsByBranchSchema = z.object({
    branch_id: z.string().min(1, "branch_id es requerido"),
});
export const listInvitationsByInviterSchema = z.object({
    inviter_client_id: z.string().min(1, "inviter_client_id es requerido"),
});

export const getInvitationByIdSchema = z.object({
    invitation_id: z.string().min(1, "invitation_id es requerido"),
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
            throw new Error(INVITATION_ERRORS.VALIDATION_FAILED(context, errorMessages));
        }
        throw new Error(INVITATION_ERRORS.VALIDATION_ERROR(context, error));
    }
}

// ===== TIPOS DERIVADOS =====
export type InviteFriendData = z.infer<typeof inviteFriendSchema>;
export type CancelInvitationData = z.infer<typeof cancelInvitationSchema>;
export type RedeemInvitationData = z.infer<typeof redeemInvitationSchema>;
export type ListInvitationsByBranchData = z.infer<typeof listInvitationsByBranchSchema>;
export type ListInvitationsByInviterData = z.infer<typeof listInvitationsByInviterSchema>;
export type GetInvitationByIdData = z.infer<typeof getInvitationByIdSchema>;

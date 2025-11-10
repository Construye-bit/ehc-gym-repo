import { createTool, type ToolCtx } from "@convex-dev/agent";
import { z } from "zod";
import { api } from "../../_generated/api";

/**
 * Tool: Obtener el perfil completo del cliente autenticado
 * Incluye: usuario, persona, cliente, preferencias, métricas de salud, contacto de emergencia
 */
export const getClientProfileTool = createTool({
    description:
        "Obtiene el perfil completo del cliente autenticado actual, incluyendo información personal, preferencias de entrenamiento, métricas de salud más recientes y contacto de emergencia",
    args: z.object({}),
    async handler(ctx: ToolCtx, _args: Record<string, never>): Promise<unknown> {
        const profile = await ctx.runQuery(
            api.profiles.client.queries.getMyClientProfile,
            {}
        );

        if (!profile) {
            return {
                error: "No se encontró el perfil del cliente",
            };
        }

        return {
            user: {
                email: profile.user.email,
                name: profile.user.name,
            },
            person: {
                name: profile.person.name,
                last_name: profile.person.last_name,
                phone: profile.person.phone,
                born_date: profile.person.born_date,
                document_type: profile.person.document_type,
                document_number: profile.person.document_number,
            },
            client: {
                status: profile.client.status,
                is_payment_active: profile.client.is_payment_active,
                join_date: profile.client.join_date,
            },
            preferences: profile.preferences
                ? {
                    preferred_time_range: profile.preferences.preferred_time_range,
                    routine_type: profile.preferences.routine_type,
                    goal: profile.preferences.goal,
                    notes: profile.preferences.notes,
                }
                : null,
            latestHealth: profile.latestHealth
                ? {
                    measured_at: profile.latestHealth.measured_at,
                    weight_kg: profile.latestHealth.weight_kg,
                    height_cm: profile.latestHealth.height_cm,
                    bmi: profile.latestHealth.bmi,
                    body_fat_pct: profile.latestHealth.body_fat_pct,
                    notes: profile.latestHealth.notes,
                }
                : null,
            emergencyContact: profile.emergencyContact
                ? {
                    name: profile.emergencyContact.name,
                    phone: profile.emergencyContact.phone,
                    relationship: profile.emergencyContact.relationship,
                }
                : null,
        };
    },
});

/**
 * Tool: Obtener métricas de salud del cliente
 * Permite obtener el historial de métricas de salud (peso, IMC, grasa corporal, etc.)
 */
export const getHealthMetricsTool = createTool({
    description:
        "Obtiene el historial de métricas de salud del cliente autenticado, como peso, altura, IMC y porcentaje de grasa corporal. Útil para dar seguimiento al progreso físico del cliente",
    args: z.object({
        limit: z
            .number()
            .optional()
            .describe("Número máximo de métricas a obtener (por defecto 20)"),
        from: z
            .number()
            .optional()
            .describe("Timestamp desde el cual obtener métricas"),
        to: z.number().optional().describe("Timestamp hasta el cual obtener métricas"),
    }),
    async handler(ctx: ToolCtx, args: { limit?: number; from?: number; to?: number }): Promise<unknown> {
        const result = await ctx.runQuery(
            api.profiles.client.queries.listHealthMetrics,
            {
                payload: {
                    limit: args.limit,
                    from: args.from,
                    to: args.to,
                },
            }
        );

        return {
            metrics: result.items.map((metric: any) => ({
                measured_at: metric.measured_at,
                weight_kg: metric.weight_kg,
                height_cm: metric.height_cm,
                bmi: metric.bmi,
                body_fat_pct: metric.body_fat_pct,
                notes: metric.notes,
            })),
            hasMore: result.nextCursor !== null,
        };
    },
});

/**
 * Tool: Obtener el progreso del cliente
 * Permite consultar hitos, mediciones y avances de rutinas del cliente
 */
export const getClientProgressTool = createTool({
    description:
        "Obtiene el historial de progreso del cliente, incluyendo hitos alcanzados, mediciones de rendimiento (RM, tiempos) y avances en rutinas. Útil para analizar la evolución del cliente",
    args: z.object({
        limit: z
            .number()
            .optional()
            .describe("Número máximo de registros de progreso a obtener (por defecto 20)"),
        from: z
            .number()
            .optional()
            .describe("Timestamp desde el cual obtener registros"),
        to: z
            .number()
            .optional()
            .describe("Timestamp hasta el cual obtener registros"),
    }),
    async handler(ctx: ToolCtx, args: { limit?: number; from?: number; to?: number }): Promise<unknown> {
        const result = await ctx.runQuery(api.profiles.client.queries.listProgress, {
            payload: {
                limit: args.limit,
                from: args.from,
                to: args.to,
            },
        });

        return {
            progress: result.items.map((item: any) => ({
                kind: item.kind,
                metric_key: item.metric_key,
                metric_value: item.metric_value,
                title: item.title,
                description: item.description,
                recorded_at: item.recorded_at,
            })),
            hasMore: result.nextCursor !== null,
        };
    },
});

/**
 * Tool: Obtener contratos del cliente con entrenadores
 * Permite consultar los contratos activos o históricos con entrenadores
 */
export const getClientContractsTool = createTool({
    description:
        "Obtiene los contratos del cliente con entrenadores, ya sean activos, inactivos o bloqueados. Útil para saber con qué entrenadores trabaja o ha trabajado el cliente",
    args: z.object({
        status: z
            .enum(["ACTIVE", "INACTIVE", "BLOCKED"])
            .optional()
            .describe("Filtrar contratos por estado (ACTIVE, INACTIVE, BLOCKED)"),
        limit: z
            .number()
            .optional()
            .describe("Número máximo de contratos a obtener (por defecto 20)"),
    }),
    async handler(ctx: ToolCtx, args: { status?: "ACTIVE" | "INACTIVE" | "BLOCKED"; limit?: number }): Promise<unknown> {
        const result = await ctx.runQuery(
            api.profiles.client.queries.listMyContracts,
            {
                payload: {
                    status: args.status,
                    limit: args.limit,
                },
            }
        );

        return {
            contracts: result.items.map((contract: any) => ({
                trainer_id: contract.trainer_id,
                status: contract.status,
                start_at: contract.start_at,
                end_at: contract.end_at,
                notes: contract.notes,
            })),
            hasMore: result.nextCursor !== null,
        };
    },
});

/**
 * Todas las tools disponibles para el agente de chat
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const chatTools: any = {
    getClientProfile: getClientProfileTool,
    getHealthMetrics: getHealthMetricsTool,
    getClientProgress: getClientProgressTool,
    getClientContracts: getClientContractsTool,
};

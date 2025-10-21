import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getPublicTrainersSchema, validateWithZod } from "./validations";

/**
 * Obtener catálogo público de entrenadores activos
 * Soporta filtros por especialidad, sede y paginación
 */
export const getPublicTrainers = query({
  args: {
    specialty: v.optional(v.string()),
    branchId: v.optional(v.id("branches")),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Validar datos de entrada
    const validatedData = validateWithZod(
      getPublicTrainersSchema,
      args,
      "getPublicTrainers"
    );
    const limit = validatedData.limit!;

    // 2. Construir query base: solo entrenadores ACTIVE
    let trainersQuery = ctx.db
      .query("trainers")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"));

    // 3. Obtener todos los entrenadores activos
    let trainers = await trainersQuery.collect();

    // 4. Aplicar filtro por sede si existe
    if (validatedData.branchId) {
      trainers = trainers.filter(
        (t) => t.branch_id === (validatedData.branchId as Id<"branches">)
      );
    }

    // 5. Aplicar filtro por especialidad si existe
    if (validatedData.specialty) {
      trainers = trainers.filter((t) =>
        t.specialties.some((s) =>
          s.toLowerCase().includes(validatedData.specialty!.toLowerCase())
        )
      );
    }

    // 6. Ordenar por fecha de creación descendente
    trainers.sort((a, b) => b.created_at - a.created_at);

    // 7. Aplicar paginación con cursor
    if (validatedData.cursor !== undefined) {
      trainers = trainers.filter((t) => t.created_at < validatedData.cursor!);
    }

    // 8. Limitar resultados
    const paginatedTrainers = trainers.slice(0, limit);

    // 9. Enriquecer con datos de persona y sede
    const enrichedTrainers = await Promise.all(
      paginatedTrainers.map(async (trainer) => {
        const person = trainer.person_id
          ? await ctx.db.get(trainer.person_id)
          : null;

        const user = trainer.user_id ? await ctx.db.get(trainer.user_id) : null;

        const branch = trainer.branch_id
          ? await ctx.db.get(trainer.branch_id)
          : null;

        return {
          trainer_id: trainer._id,
          name: person ? `${person.name} ${person.last_name}` : "Entrenador",
          specialties: trainer.specialties,
          branch: branch
            ? {
                _id: branch._id,
                name: branch.name,
              }
            : null,
          user_id: user?._id,
          created_at: trainer.created_at,
        };
      })
    );

    // 10. Retornar con cursor de paginación
    return {
      trainers: enrichedTrainers,
      nextCursor:
        paginatedTrainers.length === limit
          ? paginatedTrainers[paginatedTrainers.length - 1].created_at
          : null,
    };
  },
});

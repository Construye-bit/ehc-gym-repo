import { query } from "../../_generated/server";
import { getAuthenticatedTrainerData } from "../common/utils";

/**
 * (Trainer) Obtiene el perfil del entrenador autenticado.
 * Path: profiles/trainer/queries:getMyTrainerProfile
 *
 * CORREGIDO: Ahora devuelve user, person, trainer y la sucursal (branch).
 */
export const getMyTrainerProfile = query({
  args: {}, // Sin payload
  handler: async (ctx) => {
    // getAuthenticatedTrainerData ya nos da { user, trainer, person }
    const { user, trainer, person } = await getAuthenticatedTrainerData(ctx);

    // Buscamos la sucursal (branch) si existe
    const branch = trainer.branch_id
      ? await ctx.db.get(trainer.branch_id)
      : null;

    // Retorna el DTO extendido
    return {
      user,
      trainer,
      person,
      branch: branch || null, // Devolvemos la sucursal completa o null
    };
  },
});
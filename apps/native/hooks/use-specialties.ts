import { useQuery } from "convex/react";
import api from "@/api";

/**
 * Hook para obtener las especialidades únicas de todos los entrenadores activos
 * Usa query pública que no requiere autenticación
 */
export const useSpecialties = () => {
  const specialties = useQuery(api.trainers.queries.getActiveSpecialties);

  return {
    specialties: specialties ?? [],
    isLoading: specialties === undefined,
  };
};


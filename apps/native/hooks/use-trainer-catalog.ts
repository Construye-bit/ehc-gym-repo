import { useQuery } from "convex/react";
import api from "@/api";
import { useState, useMemo } from "react";

export interface TrainerCatalogFilters {
  specialty?: string;
  branchId?: string;
  availableNow?: boolean;
}

export const useTrainerCatalog = (filters: TrainerCatalogFilters = {}) => {
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  
  // Usar la ruta directa al archivo de queries
  const result = useQuery(
    api.chat.trainer_catalog.queries.getPublicTrainers,
    {
      specialty: filters.specialty,
      branchId: filters.branchId as any,
      cursor,
      limit: 10,
    }
  );

  const trainers = useMemo(() => {
    if (!result) return [];
    
    let filtered = result.trainers;
    
    // Filtro de disponibilidad (frontend)
    if (filters.availableNow) {
      filtered = filtered.filter((trainer) => {
        // Aquí deberías implementar la lógica de disponibilidad
        // Por ahora retornamos todos
        return true;
      });
    }
    
    return filtered;
  }, [result, filters.availableNow]);

  const loadMore = () => {
    if (result?.nextCursor !== null) {
      setCursor(result?.nextCursor);
    }
  };

  return {
    trainers,
    isLoading: result === undefined,
    hasMore: result?.nextCursor !== null,
    loadMore,
  };
};
import { useQuery } from "convex/react";
import api from "@/api";
import { useState, useMemo } from "react";

export interface TrainerCatalogFilters {
  specialties?: string[]; // Cambiado a array
  branchId?: string;
  availableNow?: boolean;
}

export const useTrainerCatalog = (filters: TrainerCatalogFilters = {}) => {
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  
  // Usar la ruta directa al archivo de queries
  const result = useQuery(
    api.chat.trainer_catalog.queries.getPublicTrainers,
    {
      specialty: filters.specialties?.[0], // Por ahora usamos la primera especialidad
      branchId: filters.branchId as any,
      cursor,
      limit: 10,
    }
  );

  const trainers = useMemo(() => {
    if (!result) return [];
    
    let filtered = result.trainers;
    
    // Filtro de especialidades múltiples (frontend)
    if (filters.specialties && filters.specialties.length > 0) {
      filtered = filtered.filter((trainer) => {
        // El entrenador debe tener al menos una de las especialidades seleccionadas
        return trainer.specialties.some((specialty) =>
          filters.specialties!.includes(specialty)
        );
      });
    }
    
    // Filtro de disponibilidad (frontend)
    if (filters.availableNow) {
      filtered = filtered.filter((trainer) => {
        // Aquí deberías implementar la lógica de disponibilidad
        // Por ahora retornamos todos
        return true;
      });
    }
    
    return filtered;
  }, [result, filters.specialties, filters.availableNow]);

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
import { useQuery } from 'convex/react';
import api from '@/api';

/**
 * Hook para obtener las sedes activas disponibles
 * Usado en el formulario de registro
 */
export function useActiveBranches() {
    const branches = useQuery(api.branches.queries.getActiveBranches);

    // Convertir las sedes a formato de opciones para el Select
    const branchOptions = branches?.map(branch => {
        let label = branch.name;

        // Agregar información de ubicación si está disponible
        if (branch.city) {
            label += ` - ${branch.city.name}`;
            if (branch.city.state_region) {
                label += `, ${branch.city.state_region}`;
            }
        }

        return {
            label,
            value: branch._id,
        };
    }) || [];

    return {
        branches,
        branchOptions,
        isLoading: branches === undefined,
    };
}

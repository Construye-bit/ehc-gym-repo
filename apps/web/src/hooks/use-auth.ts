import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from "@ehc-gym2/backend/convex/_generated/api";

export type Role = "CLIENT" | "TRAINER" | "ADMIN" | "SUPER_ADMIN";

/**
 * Hook personalizado para manejar la autenticación y autorización del usuario
 * 
 * @returns {Object} Objeto con información del usuario, persona, roles y funciones de autorización
 * @returns {boolean} isAuthenticated - Indica si el usuario está autenticado
 * @returns {boolean} isLoading - Indica si está cargando la información del usuario
 * @returns {Object|null} user - Información del usuario de Clerk
 * @returns {Object|null} person - Información de la persona asociada al usuario
 * @returns {Array<Role>} roles - Array con los roles del usuario
 * @returns {Function} hasRole - Función para verificar si el usuario tiene un rol específico
 * @returns {Function} hasAnyRole - Función para verificar si el usuario tiene alguno de los roles especificados
 * @returns {Function} hasAllRoles - Función para verificar si el usuario tiene todos los roles especificados
 * @returns {boolean} isSuperAdmin - Indica si el usuario es super administrador
 * @returns {boolean} isAdmin - Indica si el usuario es administrador o super administrador
 * @returns {boolean} isTrainer - Indica si el usuario es entrenador
 * @returns {boolean} isClient - Indica si el usuario es cliente
 */
export function useAuth() {
    // Obtener información de autenticación de Clerk
    const { isSignedIn, isLoaded: isClerkLoaded, user: clerkUser } = useUser();

    // Obtener información completa del usuario desde Convex
    const userWithRoles = useQuery(
        api.role_assignments.queries.getCurrentUserWithRoles,
        isSignedIn ? {} : "skip"
    );

    const isLoading = !isClerkLoaded || (isSignedIn && userWithRoles === undefined);
    const isAuthenticated = isSignedIn && !!userWithRoles?.user;

    // Extraer datos del usuario
    const person = userWithRoles?.person ?? null;
    const roles = (userWithRoles?.roles ?? []) as Role[];

    /**
     * Verifica si el usuario tiene un rol específico
     * @param {Role} role - El rol a verificar
     * @returns {boolean} true si el usuario tiene el rol
     */
    const hasRole = (role: Role): boolean => {
        return roles.includes(role);
    };

    /**
     * Verifica si el usuario tiene al menos uno de los roles especificados
     * @param {Role[]} requiredRoles - Array de roles a verificar
     * @returns {boolean} true si el usuario tiene al menos uno de los roles
     */
    const hasAnyRole = (requiredRoles: Role[]): boolean => {
        return requiredRoles.some((role) => roles.includes(role));
    };

    /**
     * Verifica si el usuario tiene todos los roles especificados
     * @param {Role[]} requiredRoles - Array de roles a verificar
     * @returns {boolean} true si el usuario tiene todos los roles
     */
    const hasAllRoles = (requiredRoles: Role[]): boolean => {
        return requiredRoles.every((role) => roles.includes(role));
    };

    // Helpers para roles comunes
    const isSuperAdmin = hasRole("SUPER_ADMIN");
    const isAdmin = hasAnyRole(["ADMIN", "SUPER_ADMIN"]);
    const isTrainer = hasRole("TRAINER");
    const isClient = hasRole("CLIENT");

    return {
        // Estado de autenticación
        isAuthenticated,
        isLoading,

        // Datos del usuario
        user: clerkUser,
        person,

        // Roles
        roles,

        // Funciones de autorización
        hasRole,
        hasAnyRole,
        hasAllRoles,

        // Helpers de roles
        isSuperAdmin,
        isAdmin,
        isTrainer,
        isClient,

        // Información adicional de Clerk
        isSignedIn,
    };
}

import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

type UserRole = "CLIENT" | "TRAINER" | "ADMIN" | "SUPER_ADMIN";

interface RouteGuardProps {
    children: ReactNode;
    /**
     * Lista de roles permitidos para acceder a esta ruta.
     * Si no se especifica, permite cualquier usuario autenticado.
     */
    allowedRoles?: UserRole[];
    /**
     * Si es true, requiere específicamente el rol SUPER_ADMIN (no permite ADMIN).
     * Solo se usa si allowedRoles no está definido.
     */
    requireSuperAdmin?: boolean;
    /**
     * Ruta a la que redirigir si el usuario no tiene permisos.
     * Por defecto redirige según el caso.
     */
    redirectTo?: string;
}

/**
 * Componente unificado para proteger rutas basado en roles de usuario.
 * 
 * Casos de uso:
 * - <RouteGuard requireSuperAdmin={true}> - Solo SUPER_ADMIN
 * - <RouteGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}> - ADMIN o SUPER_ADMIN
 * - <RouteGuard allowedRoles={["CLIENT"]}> - Solo clientes
 * - <RouteGuard> - Cualquier usuario autenticado
 */
export function RouteGuard({
    children,
    allowedRoles,
    requireSuperAdmin = false,
    redirectTo,
}: RouteGuardProps) {
    const { isAuthenticated, isLoading, isSuperAdmin, isAdmin, isTrainer, isClient } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            // Si no está autenticado, redirigir al login
            if (!isAuthenticated) {
                navigate({ to: redirectTo || "/auth/login" });
                return;
            }

            // Si se especificaron roles permitidos
            if (allowedRoles && allowedRoles.length > 0) {
                const hasAllowedRole =
                    (allowedRoles.includes("SUPER_ADMIN") && isSuperAdmin) ||
                    (allowedRoles.includes("ADMIN") && isAdmin) ||
                    (allowedRoles.includes("TRAINER") && isTrainer) ||
                    (allowedRoles.includes("CLIENT") && isClient);

                if (!hasAllowedRole) {
                    // Redirigir según el rol del usuario
                    if (isClient || isTrainer) {
                        navigate({ to: redirectTo || "/redirect-to-mobile" });
                    } else if (isAdmin && !allowedRoles.includes("ADMIN")) {
                        navigate({ to: redirectTo || "/admin" });
                    } else {
                        navigate({ to: redirectTo || "/auth/login" });
                    }
                    return;
                }
            }
            // Si se usa requireSuperAdmin (compatibilidad con código antiguo)
            else if (requireSuperAdmin) {
                if (!isSuperAdmin) {
                    if (isAdmin) {
                        navigate({ to: redirectTo || "/admin" });
                    } else if (isClient || isTrainer) {
                        navigate({ to: redirectTo || "/redirect-to-mobile" });
                    } else {
                        navigate({ to: redirectTo || "/auth/login" });
                    }
                    return;
                }
            }
            // Si no se especificaron roles, verificar que al menos sea admin
            else {
                // Por defecto, las rutas protegidas son para admins
                if (!isAdmin && !isSuperAdmin) {
                    if (isClient || isTrainer) {
                        navigate({ to: redirectTo || "/redirect-to-mobile" });
                    } else {
                        navigate({ to: redirectTo || "/auth/login" });
                    }
                    return;
                }
            }
        }
    }, [
        isLoading,
        isAuthenticated,
        isSuperAdmin,
        isAdmin,
        isTrainer,
        isClient,
        allowedRoles,
        requireSuperAdmin,
        redirectTo,
        navigate,
    ]);

    // Mostrar loading mientras verifica
    if (isLoading) {
        return (
            <div className="flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                    <p className="mt-4 text-gray-600">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    // Verificar permisos antes de renderizar
    let hasPermission = isAuthenticated;

    if (allowedRoles && allowedRoles.length > 0) {
        hasPermission =
            (allowedRoles.includes("SUPER_ADMIN") && isSuperAdmin) ||
            (allowedRoles.includes("ADMIN") && isAdmin) ||
            (allowedRoles.includes("TRAINER") && isTrainer) ||
            (allowedRoles.includes("CLIENT") && isClient);
    } else if (requireSuperAdmin) {
        hasPermission = isSuperAdmin;
    } else {
        hasPermission = isAdmin || isSuperAdmin;
    }

    if (!hasPermission) {
        return null;
    }

    return <>{children}</>;
}

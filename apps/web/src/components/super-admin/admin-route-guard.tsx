import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

interface AdminRouteGuardProps {
    children: ReactNode;
    requireSuperAdmin?: boolean;
}

/**
 * Guard para proteger rutas de administración
 * - Si requireSuperAdmin=true: Solo permite SUPER_ADMIN
 * - Si requireSuperAdmin=false: Permite ADMIN y SUPER_ADMIN
 * - Redirige clientes/entrenadores a /redirect-to-mobile
 * - Redirige no autenticados a /super-admin/login
 */
export function AdminRouteGuard({ children, requireSuperAdmin = false }: AdminRouteGuardProps) {
    const { isAuthenticated, isLoading, isSuperAdmin, isAdmin, isTrainer, isClient } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            // Si no está autenticado, redirigir al login
            if (!isAuthenticated) {
                navigate({ to: "/super-admin/login" });
                return;
            }

            // Si es cliente o entrenador, redirigir a la página de descarga de app móvil
            if (isTrainer || isClient) {
                navigate({ to: "/redirect-to-mobile" });
                return;
            }

            // Si requiere super admin específicamente y no lo es, pero es admin
            // redirigir a la zona de admin
            if (requireSuperAdmin && !isSuperAdmin && isAdmin) {
                navigate({ to: "/admin" });
                return;
            }

            // Si requiere super admin y no lo es (ni admin tampoco)
            if (requireSuperAdmin && !isSuperAdmin) {
                navigate({ to: "/super-admin/login" });
                return;
            }

            // Si no requiere super admin, pero no es ni admin ni super admin
            if (!requireSuperAdmin && !isAdmin && !isSuperAdmin) {
                navigate({ to: "/super-admin/login" });
            }
        }
    }, [isLoading, isAuthenticated, isSuperAdmin, isAdmin, isTrainer, isClient, requireSuperAdmin, navigate]);

    // Mostrar loading mientras verifica
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                    <p className="mt-4 text-gray-600">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    // Si no está autenticado o no tiene los permisos adecuados
    if (!isAuthenticated || (!isAdmin && !isSuperAdmin) || (requireSuperAdmin && !isSuperAdmin)) {
        return null;
    }

    return <>{children}</>;
}
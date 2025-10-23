import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: Array<"CLIENT" | "TRAINER" | "ADMIN" | "SUPER_ADMIN">;
    redirectTo?: string;
}

/**
 * Componente para proteger rutas basado en roles de usuario
 * 
 * @param {ReactNode} children - Contenido a renderizar si el usuario tiene acceso
 * @param {Array} allowedRoles - Roles permitidos para acceder a la ruta
 * @param {string} redirectTo - Ruta a la que redirigir si no tiene acceso (por defecto: /redirect-to-mobile)
 */
export function ProtectedRoute({
    children,
    allowedRoles = ["ADMIN", "SUPER_ADMIN"],
    redirectTo = "/redirect-to-mobile",
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, hasAnyRole, roles } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            // Si no está autenticado, redirigir al dashboard/auth/login
            if (!isAuthenticated) {
                navigate({ to: "/dashboard" });
                return;
            }

            // Si está autenticado pero no tiene los roles permitidos
            if (!hasAnyRole(allowedRoles)) {
                navigate({ to: redirectTo });
            }
        }
    }, [isLoading, isAuthenticated, hasAnyRole, allowedRoles, navigate, redirectTo]);

    // Mostrar loading mientras verifica
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                    <p className="mt-4 text-gray-600">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    // Si no está autenticado o no tiene los roles, no renderizar nada
    // (el useEffect ya se encargó de la redirección)
    if (!isAuthenticated || !hasAnyRole(allowedRoles)) {
        return null;
    }

    // Si todo está bien, renderizar el contenido
    return <>{children}</>;
}

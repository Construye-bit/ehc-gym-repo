import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface SuperAdminRouteGuardProps {
    children: ReactNode;
}

export function SuperAdminRouteGuard({ children }: SuperAdminRouteGuardProps) {
    const { isAuthenticated } = useAdminAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: "/admin/login" });
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return null; // o un componente de loading
    }

    return <>{children}</>;
}
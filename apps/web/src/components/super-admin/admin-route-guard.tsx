import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface AdminRouteGuardProps {
    children: ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
    const { isAuthenticated } = useAdminAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: "/super-admin/login" });
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return null; // o un componente de loading
    }

    return <>{children}</>;
}
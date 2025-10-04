import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { AdminRouteGuard } from "@/components/super-admin/admin-route-guard";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminDashboardHeader } from "@/components/super-admin/admin-dashboard-header";
import { AdminDashboardCards } from "@/components/super-admin/admin-dashboard-cards";
import { AdminPageLoader } from "@/components/super-admin/admin-page-loader";

export const Route = createFileRoute("/super-admin/dashboard")({
    component: AdminDashboardRoute,
    pendingComponent: () => <AdminPageLoader message="Preparando dashboard..." />,
});

function AdminDashboardRoute() {
    const { logout } = useAdminAuth();

    return (
        <AdminRouteGuard>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
                <AdminDashboardHeader onLogout={logout} />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            ¡HOLA, GERENTE!
                        </h1>
                        <p className="text-xl text-gray-700">
                            ¿QUÉ QUIERES HACER HOY?
                        </p>
                    </div>

                    <AdminDashboardCards />
                </main>
            </div>
        </AdminRouteGuard>
    );
}
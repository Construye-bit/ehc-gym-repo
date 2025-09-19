import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminDashboardHeader } from "@/components/admin/admin-dashboard-header";
import { AdminDashboardCards } from "@/components/admin/admin-dashboard-cards";
import { AdminPageLoader } from "@/components/admin/admin-page-loader";

// Función para simular carga (solo para testing)
const simulateLoading = () => new Promise(resolve => setTimeout(resolve, 1200));

export const Route = createFileRoute("/admin/dashboard")({
    component: AdminDashboardRoute,
    pendingComponent: () => <AdminPageLoader message="Preparando dashboard..." />,
    loader: async () => {
        // Simular carga de datos (solo para testing)
        await simulateLoading();
        return {};
    }
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
                            ¡HOLA, ADMINISTRADOR!
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
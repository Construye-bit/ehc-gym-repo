import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardCards } from "../../components/commons/dashboard-cards";
import { AdminDashboardHeader } from "../../components/admin/admin-dashboard-header";
import { AdminRouteGuard } from "../../components/admin/admin-route-guard";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export const Route = createFileRoute("/admin/")({
    component: AdminDashboard,
});

function AdminDashboard() {
    const { logout } = useAdminAuth();

    return (
        <AdminRouteGuard requireSuperAdmin={false}>
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
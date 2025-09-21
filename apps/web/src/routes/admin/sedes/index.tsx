import { createFileRoute } from "@tanstack/react-router";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminDashboardHeader } from "@/components/admin/admin-dashboard-header";
import { SedesManagementContent } from "@/components/admin/sedes/sedes-management-content";
import { AdminPageLoader } from "@/components/admin/admin-page-loader";

// Función para simular carga (solo para testing)
const simulateLoading = () => new Promise(resolve => setTimeout(resolve, 1500));

export const Route = createFileRoute("/admin/sedes/")({
    component: SedesManagementRoute,
    pendingComponent: () => <AdminPageLoader message="Cargando gestión de sedes..." />,
    loader: async () => {
        // Simular carga de datos (solo para testing)
        await simulateLoading();
        return {};
    }
});

function SedesManagementRoute() {
    const { logout } = useAdminAuth();

    return (
        <AdminRouteGuard>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
                <AdminDashboardHeader onLogout={logout} />
                <SedesManagementContent />
            </div>
        </AdminRouteGuard>
    );
}
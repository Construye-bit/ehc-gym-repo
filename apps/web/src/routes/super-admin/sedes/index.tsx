import { createFileRoute } from "@tanstack/react-router";
import { AdminRouteGuard } from "@/components/super-admin/admin-route-guard";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminDashboardHeader } from "@/components/super-admin/admin-dashboard-header";
import { SedesManagementContent } from "@/components/super-admin/sedes/sedes-management-content";
import { AdminPageLoader } from "@/components/super-admin/admin-page-loader";

export const Route = createFileRoute("/super-admin/sedes/")({
    component: SedesManagementRoute,
    pendingComponent: () => <AdminPageLoader message="Cargando gestión de sedes..." />,
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
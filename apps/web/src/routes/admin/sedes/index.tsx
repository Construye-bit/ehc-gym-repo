import { createFileRoute } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminDashboardHeader } from "@/components/admin/admin-dashboard-header";
import { SedesManagementContent } from "@/components/admin/sedes/sedes-management-content";
import { AdminPageLoader } from "@/components/admin/admin-page-loader";

export const Route = createFileRoute("/admin/sedes/")({
    component: SedesManagementRoute,
    pendingComponent: () => <AdminPageLoader message="Cargando gestión de sedes..." />,
});

function SedesManagementRoute() {
    const { logout } = useAdminAuth();

    return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
                <AdminDashboardHeader/>
                <SedesManagementContent/>
            </div>
    );
}
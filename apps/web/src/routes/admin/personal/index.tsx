import { createFileRoute } from "@tanstack/react-router";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminDashboardHeader } from "@/components/admin/admin-dashboard-header";
import { PersonalManagementContent } from "@/components/admin/personal/personal-management-content";
import { AdminPageLoader } from "@/components/admin/admin-page-loader";

export const Route = createFileRoute("/admin/personal/")({
    component: PersonalManagementRoute,
    pendingComponent: () => <AdminPageLoader message="Cargando gestión de personal..." />,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            sedeId: search.sedeId as string,
            sedeName: search.sedeName as string,
        };
    }
});

function PersonalManagementRoute() {
    const { logout } = useAdminAuth();
    const { sedeId, sedeName } = Route.useSearch();

    return (
        <AdminRouteGuard>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 page-transition">
                <AdminDashboardHeader onLogout={logout} />
                <PersonalManagementContent sedeId={sedeId} sedeName={sedeName} />
            </div>
        </AdminRouteGuard>
    );
}
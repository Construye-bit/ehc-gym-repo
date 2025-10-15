import { createFileRoute } from "@tanstack/react-router";
import { AdminRouteGuard } from "@/components/super-admin/admin-route-guard";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminDashboardHeader } from "@/components/super-admin/admin-dashboard-header";
import { AdministratorsManagementContent } from "@/components/super-admin/administrators/administrators-management-content";
import { AdminPageLoader } from "@/components/super-admin/admin-page-loader";

export const Route = createFileRoute("/super-admin/administrators/")({
  component: AdministratorsManagementRoute,
  pendingComponent: () => <AdminPageLoader message="Cargando gestión de administradores..." />,
});

function AdministratorsManagementRoute() {
  const { logout } = useAdminAuth();

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <AdminDashboardHeader onLogout={logout} />
        <AdministratorsManagementContent />
      </div>
    </AdminRouteGuard>
  );
}
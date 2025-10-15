import { createFileRoute } from "@tanstack/react-router";
import { AdminRouteGuard } from "@/components/super-admin/admin-route-guard";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminDashboardHeader } from "@/components/super-admin/admin-dashboard-header";
import NewAdministratorContent from "@/components/super-admin/administrators/new-administrator-content";
import { AdminPageLoader } from "@/components/super-admin/admin-page-loader";

export const Route = createFileRoute("/super-admin/administrators/new")({
  component: NewAdministratorRoute,
  pendingComponent: () => <AdminPageLoader message="Cargando nuevo administrador..." />,
});

function NewAdministratorRoute() {
  const { logout } = useAdminAuth();

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <AdminDashboardHeader onLogout={logout} />
        <NewAdministratorContent />
      </div>
    </AdminRouteGuard>
  );
}
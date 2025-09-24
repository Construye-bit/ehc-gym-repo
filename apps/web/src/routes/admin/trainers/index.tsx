import { createFileRoute } from "@tanstack/react-router";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminDashboardHeader } from "@/components/admin/admin-dashboard-header";
import { TrainersManagementContent } from "@/components/admin/trainers/trainers-management-content";
import { AdminPageLoader } from "@/components/admin/admin-page-loader";

const simulateLoading = () => new Promise(resolve => setTimeout(resolve, 1500));

export const Route = createFileRoute("/admin/trainers/")({
  component: TrainersManagementRoute,
  pendingComponent: () => <AdminPageLoader message="Cargando gestión de entrenadores..." />,
  loader: async () => {
    await simulateLoading();
    return {};
  }
});

function TrainersManagementRoute() {
  const { logout } = useAdminAuth();

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <AdminDashboardHeader onLogout={logout} />
        <TrainersManagementContent />
      </div>
    </AdminRouteGuard>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminDashboardHeader } from "@/components/admin/admin-dashboard-header";
import NewTrainerContent from "@/components/admin/trainers/new-trainer-content";
import { AdminPageLoader } from "@/components/admin/admin-page-loader";

const simulateLoading = () => new Promise(resolve => setTimeout(resolve, 1500));

export const Route = createFileRoute("/admin/trainers/new")({
  component: NewTrainerRoute,
  pendingComponent: () => <AdminPageLoader message="Cargando nuevo entrenador..." />,
  loader: async () => {
    await simulateLoading();
    return {};
  }
});

function NewTrainerRoute() {
  const { logout } = useAdminAuth();

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <AdminDashboardHeader onLogout={logout} />
        <NewTrainerContent />
      </div>
    </AdminRouteGuard>
  );
}


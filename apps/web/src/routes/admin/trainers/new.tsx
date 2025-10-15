import { createFileRoute } from "@tanstack/react-router";
import { AdminRouteGuard } from "@/components/super-admin/admin-route-guard";
import { AdminDashboardHeader } from "@/components/admin/admin-dashboard-header";
import NewTrainerContent from "@/components/admin/trainers/new-trainer-content";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export const Route = createFileRoute("/admin/trainers/new")({
  component: NewTrainerRoute,
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
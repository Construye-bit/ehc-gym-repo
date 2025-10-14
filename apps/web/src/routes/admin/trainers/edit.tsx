import { createFileRoute } from "@tanstack/react-router";
import { AdminRouteGuard } from "@/components/super-admin/admin-route-guard";
import { AdminDashboardHeader } from "@/components/admin/admin-dashboard-header";
import EditTrainerForm from "@/components/admin/trainers/edit-trainer-form";
import { useAdminAuth } from "@/hooks/use-admin-auth";

type TrainerEditSearchParams = {
  trainerId: string;
};

export const Route = createFileRoute("/admin/trainers/edit")({
  component: EditTrainerRoute,
  validateSearch: (search: Record<string, unknown>): TrainerEditSearchParams => {
    return {
      trainerId: (search.trainerId as string) || "",
    };
  },
});

function EditTrainerRoute() {
  const { trainerId } = Route.useSearch();
  const { logout } = useAdminAuth();

  if (!trainerId) {
    return (
      <AdminRouteGuard>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ID de entrenador no válido</h1>
            <p className="text-gray-600">No se ha proporcionado un ID de entrenador válido para editar.</p>
          </div>
        </div>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminDashboardHeader onLogout={logout} />
        <EditTrainerForm trainerId={trainerId} />
      </div>
    </AdminRouteGuard>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import EditTrainerForm from "@/components/admin/trainers/edit-trainer-form";

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

  // Proteger ruta con autenticación de admin
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cargando...</h1>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (!trainerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ID de entrenador no válido</h1>
          <p className="text-gray-600">No se ha proporcionado un ID de entrenador válido para editar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EditTrainerForm trainerId={trainerId as any} />
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
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

  if (!trainerId) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">ID de entrenador no válido</h1>
        <p className="text-gray-600">No se ha proporcionado un ID de entrenador válido para editar.</p>
      </div>
    );
  }

  return <EditTrainerForm trainerId={trainerId} />;
}
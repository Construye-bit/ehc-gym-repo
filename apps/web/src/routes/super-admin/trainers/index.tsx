import { createFileRoute } from "@tanstack/react-router";
import { TrainersManagementContent } from "@/components/super-admin/trainers/trainers-management-content";
import { PageLoader } from "@/components/shared/page-loader";

export const Route = createFileRoute("/super-admin/trainers/")({
  component: TrainersManagementRoute,
  pendingComponent: () => <PageLoader variant="admin" message="Cargando gestión de entrenadores..." showProgress />,
});

function TrainersManagementRoute() {
  return <TrainersManagementContent />;
}
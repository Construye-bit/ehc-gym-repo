import { createFileRoute } from "@tanstack/react-router";
import NewTrainerContent from "@/components/super-admin/trainers/new-trainer-content";
import { PageLoader } from "@/components/shared/page-loader";

export const Route = createFileRoute("/super-admin/trainers/new")({
  component: NewTrainerRoute,
  pendingComponent: () => <PageLoader variant="admin" message="Cargando nuevo entrenador..." showProgress />,
});

function NewTrainerRoute() {
  return <NewTrainerContent />;
}


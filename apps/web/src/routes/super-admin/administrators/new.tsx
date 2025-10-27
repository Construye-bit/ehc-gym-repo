import { createFileRoute } from "@tanstack/react-router";
import NewAdministratorContent from "@/components/super-admin/administrators/new-administrator-content";
import { PageLoader } from "@/components/shared/page-loader";

export const Route = createFileRoute("/super-admin/administrators/new")({
  component: NewAdministratorRoute,
  pendingComponent: () => <PageLoader variant="admin" message="Cargando nuevo administrador..." showProgress />,
});

function NewAdministratorRoute() {
  return <NewAdministratorContent />;
}
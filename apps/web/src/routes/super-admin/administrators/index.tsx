import { createFileRoute } from "@tanstack/react-router";
import { AdministratorsManagementContent } from "@/components/super-admin/administrators/administrators-management-content";
import { PageLoader } from "@/components/shared/page-loader";

export const Route = createFileRoute("/super-admin/administrators/")({
  component: AdministratorsManagementRoute,
  pendingComponent: () => <PageLoader variant="admin" message="Cargando gestión de administradores..." showProgress />,
});

function AdministratorsManagementRoute() {
  return <AdministratorsManagementContent />;
}
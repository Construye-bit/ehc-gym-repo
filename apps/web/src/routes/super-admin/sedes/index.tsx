import { createFileRoute } from "@tanstack/react-router";
import { SedesManagementContent } from "@/components/super-admin/sedes/sedes-management-content";
import { PageLoader } from "@/components/shared/page-loader";

export const Route = createFileRoute("/super-admin/sedes/")({
    component: SedesManagementRoute,
    pendingComponent: () => <PageLoader variant="admin" message="Cargando gestión de sedes..." showProgress />,
});

function SedesManagementRoute() {
    return <SedesManagementContent />;
}
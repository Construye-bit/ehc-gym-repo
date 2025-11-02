import { createFileRoute } from "@tanstack/react-router";
import { InvitationsManagementContent } from "@/components/admin/invitations/invitations-management-content";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { PageLoader } from "@/components/shared/page-loader";
import { useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";

export const Route = createFileRoute("/admin/invitations/")({
  component: InvitationsPage,
});

function InvitationsPage() {
  const { adminData, isLoading } = useAdminAuth();

  // Obtener el admin actual
  const currentAdmin = useQuery(
    api.admins.queries.getCurrentAdmin,
    adminData?.clerk_id ? { payload: { clerk_id: adminData.clerk_id } } : "skip"
  );

  // Verificar si es super-admin
  const isSuperAdmin = useQuery(api.admins.queries.isSuperAdmin);

  if (isLoading || currentAdmin === undefined || isSuperAdmin === undefined) {
    return <PageLoader />;
  }

  // Si no tiene branch asignada y NO es super-admin, mostrar mensaje
  if (!currentAdmin?.branch_id && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              Sin sede asignada
            </h2>
            <p className="text-yellow-700">
              Necesitas tener una sede asignada para gestionar invitaciones.
              Contacta al super administrador.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Invitaciones
          </h1>
          <p className="text-gray-600 mt-2">
            {isSuperAdmin
              ? "Administra las invitaciones de amigos (todas las sedes)"
              : "Administra las invitaciones de amigos de tu sede"}
          </p>
        </div>

        <InvitationsManagementContent
          branchId={currentAdmin?.branch_id}
          isSuperAdmin={isSuperAdmin}
        />
      </main>
    </div>
  );
}

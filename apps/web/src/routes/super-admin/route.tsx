import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminHeader } from "@/components/shared/admin-header";
import { RouteGuard } from "@/components/shared/route-guard";

export const Route = createFileRoute("/super-admin")({
  component: SuperAdminLayout,
});

function SuperAdminLayout() {
  return (
    <RouteGuard allowedRoles={["SUPER_ADMIN"]}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <AdminHeader type="super-admin" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </RouteGuard>
  );
}
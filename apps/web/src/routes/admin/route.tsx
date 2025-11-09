import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminHeader } from "@/components/shared/admin-header";
import { RouteGuard } from "@/components/shared/route-guard";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RouteGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50">
        <AdminHeader type="admin" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </RouteGuard>
  );
}
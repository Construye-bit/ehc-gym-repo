import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AdminRouteGuard } from "@/components/super-admin/admin-route-guard";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminDashboardHeader } from "@/components/super-admin/admin-dashboard-header";
import { PersonalManagementContent } from "@/components/super-admin/personal/personal-management-content";
import { AdminPageLoader } from "@/components/super-admin/admin-page-loader";

const searchSchema = z.object({
    sedeId: z.string().optional(),
    sedeName: z.string().optional(),
});

export const Route = createFileRoute("/super-admin/personal/")({
    component: PersonalManagementRoute,
    pendingComponent: () => <AdminPageLoader message="Cargando gestión de personal..." />,
    validateSearch: (search: Record<string, unknown>) => {
        const result = searchSchema.safeParse(search);
        if (result.success) {
            return {
                sedeId: result.data.sedeId || undefined,
                sedeName: result.data.sedeName || undefined,
            };
        } else {
            console.error('Invalid search params:', result.error);
            return {
                sedeId: undefined,
                sedeName: undefined,
            };
        }
    }
});

function PersonalManagementRoute() {
    const { logout } = useAdminAuth();
    const { sedeId, sedeName } = Route.useSearch();

    return (
        <AdminRouteGuard>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 page-transition">
                <AdminDashboardHeader onLogout={logout} />
                <PersonalManagementContent sedeId={sedeId} sedeName={sedeName} />
            </div>
        </AdminRouteGuard>
    );
}
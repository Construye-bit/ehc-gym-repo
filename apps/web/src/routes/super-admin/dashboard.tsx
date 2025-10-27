import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardCards } from "@/components/shared/dashboard-cards";
import { PageLoader } from "@/components/shared/page-loader";

export const Route = createFileRoute("/super-admin/dashboard")({
    component: AdminDashboardRoute,
    pendingComponent: () => <PageLoader variant="admin" message="Preparando dashboard..." showProgress />,
});

function AdminDashboardRoute() {
    return (
        <>
            <div className="mb-8">
                <p className="text-xl text-gray-700 font-bold">
                    ¿QUÉ QUIERES HACER HOY?
                </p>
            </div>

            <AdminDashboardCards />
        </>
    );
}
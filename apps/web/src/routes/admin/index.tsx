import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardCards } from "../../components/shared/dashboard-cards";

export const Route = createFileRoute("/admin/")({
    component: AdminDashboard,
});

function AdminDashboard() {
    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    ¡HOLA, ADMINISTRADOR!
                </h1>
                <p className="text-xl text-gray-700">
                    ¿QUÉ QUIERES HACER HOY?
                </p>
            </div>

            <AdminDashboardCards />
        </>
    );
}
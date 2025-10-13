import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginForm } from "@/components/super-admin/admin-login-form";

export const Route = createFileRoute("/super-admin/login")({
    component: AdminLoginRoute,
});

function AdminLoginRoute() {
    return <AdminLoginForm />;
}

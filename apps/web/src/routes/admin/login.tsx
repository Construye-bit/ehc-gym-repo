import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const Route = createFileRoute("/admin/login")({
    component: AdminLoginRoute,
});

function AdminLoginRoute() {
    return <AdminLoginForm />;
}
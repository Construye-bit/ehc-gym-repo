import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/auth/login")({
    component: AdminLoginRoute,
});

function AdminLoginRoute() {
    return <AdminLoginForm />;
}

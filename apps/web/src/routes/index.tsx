import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import { useAdminAuth } from "../hooks/use-admin-auth";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const { isAuthenticated, isLoading } = useAdminAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading) {
			if (isAuthenticated) {
				navigate({ to: "/super-admin/dashboard" });
			} else {
				navigate({ to: "/dashboard" });
			}
		}
	}, [isAuthenticated, isLoading, navigate]);

	// Mostrar un estado de carga mientras se verifica la autenticación
	if (isLoading) {
		return (
			<div className="container mx-auto max-w-3xl px-4 py-2">
				<div className="flex items-center justify-center py-8">
					<span className="text-muted-foreground">Cargando...</span>
				</div>
			</div>
		);
	}

	return null;
}

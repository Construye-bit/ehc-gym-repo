import { createFileRoute } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import EditAdministratorForm from "@/components/super-admin/administrators/edit-administrator-form";

type AdministratorEditSearchParams = {
  administratorId: string;
};

export const Route = createFileRoute("/super-admin/administrators/edit")({
  component: EditAdministratorRoute,
  validateSearch: (search: Record<string, unknown>): AdministratorEditSearchParams => {
    return {
      administratorId: (search.administratorId as string) || "",
    };
  },
});

function EditAdministratorRoute() {
  const search = Route.useSearch();
  return <EditAdministratorForm administratorId={search.administratorId} />;
}
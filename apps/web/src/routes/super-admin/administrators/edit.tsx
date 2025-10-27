import { createFileRoute } from "@tanstack/react-router";
import EditAdministratorForm from "@/components/super-admin/administrators/edit-administrator-form";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";

type AdministratorEditSearchParams = {
  administratorId: Id<"admins">;
};

export const Route = createFileRoute("/super-admin/administrators/edit")({
  component: EditAdministratorRoute,
  validateSearch: (search: Record<string, unknown>): AdministratorEditSearchParams => {
    const administratorId = search.administratorId as Id<"admins">;
    if (!administratorId) {
      throw new Error("administratorId is required");
    }
    return {
      administratorId,
    };
  },
});

function EditAdministratorRoute() {
  const search = Route.useSearch();
  return <EditAdministratorForm administratorId={search.administratorId} />;
}
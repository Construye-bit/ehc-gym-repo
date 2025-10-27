import { createFileRoute } from "@tanstack/react-router";
import NewTrainerContent from "@/components/admin/trainers/new-trainer-content";

export const Route = createFileRoute("/admin/trainers/new")({
  component: NewTrainerRoute,
});

function NewTrainerRoute() {
  return <NewTrainerContent />;
}
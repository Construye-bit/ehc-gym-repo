import { createFileRoute } from "@tanstack/react-router";
import { TrainersManagementContent } from "@/components/admin/trainers/trainers-management-content";

export const Route = createFileRoute("/admin/trainers/")({
  component: TrainersManagementRoute,
});

function TrainersManagementRoute() {
  return <TrainersManagementContent />;
}
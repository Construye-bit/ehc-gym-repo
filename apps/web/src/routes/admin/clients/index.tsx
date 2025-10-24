import { ClientsManagementContent } from '@/components/admin/clients/clients-management-content';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/clients/')({
  component: ClientsManagementComponent,
});

function ClientsManagementComponent() {
  return <ClientsManagementContent />;
}
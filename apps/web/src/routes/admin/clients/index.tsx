import { AdminDashboardHeader } from '@/components/admin/admin-dashboard-header';
import { ClientsManagementContent } from '@/components/admin/clients/clients-management-content';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/clients/')({
  component: ClientsManagementComponent,
});

function ClientsManagementComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <AdminDashboardHeader />
      <ClientsManagementContent />
    </div>
  );
}
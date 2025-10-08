import { createFileRoute } from '@tanstack/react-router'
import EditSedeForm from '@/components/super-admin/sedes/edit-sede-form'
import { z } from 'zod'

const searchSchema = z.object({
  branchId: z.string(),
})

export const Route = createFileRoute('/super-admin/sedes/edit')({
  validateSearch: searchSchema,
  component: EditSedeRoute,
})

function EditSedeRoute() {
  const { branchId } = Route.useSearch();

  if (!branchId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">No se especificó la sede a editar</p>
        </div>
      </div>
    );
  }

  return <EditSedeForm branchId={branchId} />;
}
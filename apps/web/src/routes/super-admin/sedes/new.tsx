import { createFileRoute } from '@tanstack/react-router'
import NewSedeForm from '@/components/super-admin/sedes/new-sede-form'

export const Route = createFileRoute('/super-admin/sedes/new')({
  component: NewSedeForm
})
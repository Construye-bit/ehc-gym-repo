import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useQuery, useAction } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { Edit, Trash2, Loader2, Search } from "lucide-react";
import { ClientCreateModal } from "@/components/admin/clients/clients-create-modal";
import { ClientDetailModal } from "@/components/admin/clients/clients-details-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Tipos
interface Client {
  _id: Id<"clients">;
  status: 'ACTIVE' | 'INACTIVE';
  is_payment_active: boolean;
  join_date: number;
  person?: {
    name: string;
    last_name: string;
    document_type: string;
    document_number: string;
    phone?: string;
    born_date: string;
  } | null;
  user?: {
    email: string;
  } | null;
  branches: Array<{
    _id: Id<"branches">;
    name: string;
  }>;
}

type ClientStatus = Client['status'];

// Constantes
const PAGE_SIZE = 8;
const STATUS_STYLES: Record<ClientStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700 px-2 py-1 rounded text-xs",
  INACTIVE: "bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
};

const STATUS_LABELS: Record<ClientStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo"
};

// Componente de fila de cliente
interface ClientRowProps {
  client: Client;
  index: number;
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  isDeleting?: boolean;
}

const ClientRow: React.FC<ClientRowProps> = ({
  client,
  index,
  onViewClient,
  onEditClient,
  onDeleteClient,
  isDeleting = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConfirmDelete = () => {
    onDeleteClient(client);
    setDialogOpen(false);
  };

  return (
    <tr key={client._id} className="hover:bg-yellow-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900">
        {index + 1}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {client.person ? `${client.person.name} ${client.person.last_name}` : "-"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {client.person?.document_number || "-"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {client.person?.phone || "-"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {client.branches.length > 0 ? client.branches.map(b => b.name).join(", ") : "-"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {client.join_date ? new Date(client.join_date).toLocaleDateString('es-ES') : "-"}
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={STATUS_STYLES[client.status]}>
          {STATUS_LABELS[client.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => onViewClient(client)}
            size="sm"
            variant="outline"
            disabled={isDeleting}
            className="hover:bg-blue-50 border-blue-200 disabled:opacity-50 text-black hover:text-gray-900"
          >
            Ver
          </Button>
          <Button
            onClick={() => onEditClient(client)}
            size="sm"
            disabled={isDeleting}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 disabled:hover:bg-gray-400 text-gray-900 font-semibold p-2"
          >
            <Edit size={16} />
          </Button>
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:hover:bg-red-300 text-white font-semibold p-2"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente al cliente{" "}
                  <strong>{client.person?.name} {client.person?.last_name}</strong>{" "}
                  y todos sus datos asociados del sistema.
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
};

// Componente de cabecera de tabla
const TableHeader: React.FC = () => {
  const headers = [
    "Ítem",
    "Nombre",
    "Documento",
    "Teléfono",
    "Sede",
    "Fecha de Ingreso",
    "Estado",
    "Acciones"
  ];

  return (
    <thead className="bg-gray-50">
      <tr>
        {headers.map((header, index) => (
          <th
            key={index}
            className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

// Componente de estado vacío
const EmptyState: React.FC = () => (
  <tr>
    <td colSpan={8} className="px-4 py-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="text-gray-400 text-lg">📋</div>
        <p className="text-gray-500 text-sm">No hay clientes para mostrar</p>
      </div>
    </td>
  </tr>
);

// Componente de estado de carga
const LoadingState: React.FC = () => (
  <>
    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
      <tr key={i}>
        <td className="px-4 py-3">
          <Skeleton className="h-4 w-8" />
        </td>
        <td className="px-4 py-3">
          <Skeleton className="h-4 w-32" />
        </td>
        <td className="px-4 py-3">
          <Skeleton className="h-4 w-24" />
        </td>
        <td className="px-4 py-3">
          <Skeleton className="h-4 w-24" />
        </td>
        <td className="px-4 py-3">
          <Skeleton className="h-4 w-16" />
        </td>
        <td className="px-4 py-3">
          <Skeleton className="h-4 w-20" />
        </td>
        <td className="px-4 py-3">
          <Skeleton className="h-6 w-20 rounded-full" />
        </td>
        <td className="px-4 py-3 text-right">
          <Skeleton className="h-8 w-12 ml-auto" />
        </td>
      </tr>
    ))}
  </>
);

// Componente de paginación
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  clients: Client[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  clients,
}) => {
  return (
    <div className="flex justify-between items-center py-4 px-6 border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="hover:bg-yellow-50 hover:border-yellow-200"
        >
          Anterior
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="hover:bg-yellow-50 hover:border-yellow-200"
        >
          Siguiente
        </Button>
      </div>

      <div className="text-sm text-gray-600">
        Página <span className="font-medium">{currentPage}</span> de{" "}
        <span className="font-medium">{totalPages}</span>
      </div>

      <div className="text-sm text-gray-500">
        Mostrando {Math.min((currentPage - 1) * PAGE_SIZE + 1, clients.length)} -{" "}
        {Math.min(currentPage * PAGE_SIZE, clients.length)} de{" "}
        {clients.length} clientes
      </div>
    </div>
  );
};

// Componente principal
export function ClientsManagementContent() {
  // Usar la query que filtra clientes por sede asignada del admin
  const clients = useQuery(api.clients.queries.getMyClientsWithDetails, {}) ?? [];
  const deleteClientAction = useAction(api.clients.mutations.deleteClientComplete);

  const [currentPage, setCurrentPage] = useState(1);
  const [deletingClientId, setDeletingClientId] = useState<Id<"clients"> | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === "" ||
      client.person?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.person?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.person?.document_number.includes(searchTerm);

    const matchesBranch = selectedBranch === "all" ||
      client.branches.some(b => b._id === selectedBranch);

    return matchesSearch && matchesBranch;
  });

  // Obtener lista única de sedes
  const uniqueBranches = Array.from(
    new Map(
      clients.flatMap(c => c.branches).map(b => [b._id, b])
    ).values()
  );

  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE);
  const currentClients = filteredClients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleViewClient = (client: Client) => {
    setSelectedClientId(client._id);
    setIsDetailsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    // TODO: Implementar edición de cliente
    toast.info("La función de edición estará disponible próximamente");
  };

  const handleDeleteClient = async (client: Client) => {
    try {
      setDeletingClientId(client._id);

      const result = await deleteClientAction({
        clientId: client._id
      });

      if (result.success) {
        toast.success(result.message, {
          duration: 5000,
        });
      } else {
        throw new Error('La eliminación no fue exitosa');
      }
    } catch (error) {
      console.error('Error al eliminar cliente:', error);

      let errorMessage = 'Error al eliminar el cliente';
      if (error instanceof Error) {
        if (error.message.includes('No autenticado')) {
          errorMessage = 'No tienes permisos para realizar esta acción';
        } else if (error.message.includes('No tienes permisos')) {
          errorMessage = 'No tienes permisos suficientes para eliminar clientes';
        } else if (error.message.includes('no encontrado')) {
          errorMessage = 'El cliente no fue encontrado';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setDeletingClientId(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedClientId(null);
  };

  return (
    <div className="min-h-full w-full p-8 bg-gradient-to-br from-yellow-50 to-yellow-50">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600">
            Administra y visualiza información de todos los clientes
          </p>
        </div>
        <div>
          <Button
            size="lg"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors"
          >
            + Agregar Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-4 p-4 shadow-sm border-0 bg-white">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar por nombre o documento..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <div className="w-64">
            <Select value={selectedBranch} onValueChange={(value) => {
              setSelectedBranch(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las sedes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las sedes</SelectItem>
                {uniqueBranches.map(branch => (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card className="shadow-sm border-0 bg-white overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border-0">
            <TableHeader />
            <tbody className="bg-white divide-y divide-gray-100">
              {clients === undefined ? (
                <LoadingState />
              ) : currentClients.length > 0 ? (
                currentClients.map((client, index) => (
                  <ClientRow
                    key={client._id}
                    client={client}
                    index={(currentPage - 1) * PAGE_SIZE + index}
                    onViewClient={handleViewClient}
                    onEditClient={handleEditClient}
                    onDeleteClient={handleDeleteClient}
                    isDeleting={deletingClientId === client._id}
                  />
                ))
              ) : (
                <EmptyState />
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            clients={filteredClients}
          />
        )}
      </Card>

      {/* Modal de detalles del cliente */}
      <ClientDetailModal
        open={isDetailsModalOpen}
        onOpenChange={(open) => {
          setIsDetailsModalOpen(open);
          if (!open) setSelectedClientId(null);
        }}
        client={currentClients.find(c => c._id === selectedClientId) || null}
      />

      {/* Modal de creación de cliente */}
      <ClientCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          // Refrescar la lista de clientes cuando se crea uno nuevo
          // El query se actualizará automáticamente gracias a la reactividad de Convex
        }}
      />
    </div>
  );
}

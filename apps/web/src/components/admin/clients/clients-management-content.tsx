"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientDetailModal } from "@/components/admin/clients/clients-details-modal";
import { ClientEditModal } from "@/components/admin/clients/clients-edit-modal";
import {ClientCreateModal} from "@/components/admin/clients/clients-create-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  FileSpreadsheet,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

export function ClientsManagementContent() {
  // DATOS QUEMADOS - Reemplazar con datos reales de la base de datos
  // Basado en el schema: clients + persons + client_branches
  const mockClients = [
    {
      id: "1",
      item: 1,
      name: "Juan Pérez García",
      document: "CC 1234567890",
      phone: "+57 300 123 4567",
      email: "juan.perez@email.com",
      branch: "Sede Norte",
      status: "ACTIVE",
      is_payment_active: true,
      join_date: "2025-01-15",
    },
    {
      id: "2",
      item: 2,
      name: "María López Rodríguez",
      document: "CC 9876543210",
      phone: "+57 310 987 6543",
      email: "maria.lopez@email.com",
      branch: "Sede Sur",
      status: "ACTIVE",
      is_payment_active: false,
      join_date: "2025-02-20",
    },
  ];
  const [clients, setClients] = useState(mockClients); 
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof mockClients[0] | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<typeof mockClients[0] | null>(null);
  // TODO: Implementar funciones reales
  const handleExportPDF = () => {
    console.log("TODO: Exportar a PDF");
  };

  const handleExportExcel = () => {
    console.log("TODO: Exportar a Excel");
  };

/**
 * handleEdit
 * - Busca el cliente en los datos mock
 * - Abre el modal de edición pasándole el cliente
 */
  const handleEdit = (clientId: string) => {
    console.log("Editar cliente", clientId);
    const client = mockClients.find((c) => c.id === clientId) ?? null;
    console.log("Cliente encontrado para editar:", client);
    setSelectedClientForEdit(client);
    setIsEditOpen(true);
  };
  const handleSaveClient = (updatedClient: typeof mockClients[0]) => {
  console.log("Cliente actualizado (mock):", updatedClient);
  // Si quieres mantener la lista en memoria actualizable, cambia mockClients por un estado:
  // const [clients, setClients] = useState<Client[]>(mockClients);
  // y aquí: setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  // Por ahora dejamos solo el console.log porque dijiste que no hay backend.
  };


  const handleDelete = (clientId: string) => {
    console.log("TODO: Eliminar cliente", clientId);
  };

  /**
   * handleView
   * - Busca el cliente en los datos mock y abre el modal pasando el objeto
   */
  const handleView = (clientId: string) => {
    console.log("Ver detalles cliente", clientId);
    const client = mockClients.find((c) => c.id === clientId) ?? null;
    console.log("Cliente encontrado para modal:", client);
    setSelectedClient(client);
    setIsViewOpen(true);
  };

  const handleNewClient = () => {
    console.log("Crear nuevo cliente (abrir modal)");
    setIsCreateOpen(true);
  };
  const handleSaveNewClient = (newClientPartial: Omit<typeof mockClients[number], "id" | "item"> & { id?: string; item?: number }) => {
  // generar id/item simples: puedes mejorar con UUID si lo deseas
  const nextItem = clients.length > 0 ? Math.max(...clients.map((c) => c.item)) + 1 : 1;
  const nextId = String(Date.now()); // id simple basado en timestamp
  const newClient = {
    ...newClientPartial,
    id: nextId,
    item: nextItem,
  } as typeof mockClients[number];

  setClients((prev) => [...prev, newClient]);
  console.log("Nuevo cliente agregado (mock):", newClient);
};

  const handleDateFromChange = (value: string) => {
    console.log("TODO: Filtrar desde fecha", value);
  };

  const handleDateToChange = (value: string) => {
    console.log("TODO: Filtrar hasta fecha", value);
  };

  const handleSearch = (value: string) => {
    console.log("TODO: Buscar", value);
  };

  const handlePageSizeChange = (value: string) => {
    console.log("TODO: Cambiar tamaño de página", value);
  };

  return (
    <>
      <div className="p-6 space-y-6 min-h-screen">
        {/* Filtros superiores */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <Input
                type="date"
                defaultValue="2025-01-01"
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <Input
                type="date"
                defaultValue="2025-12-31"
                onChange={(e) => handleDateToChange(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="bg-red-400 hover:bg-red-500 text-white"
                size="lg"
                onClick={handleExportPDF}
              >
                <FileText className="w-5 h-5" />
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
                onClick={handleExportExcel}
              >
                <FileSpreadsheet className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header con controles */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Mostrar</span>
              <Select defaultValue="10" onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20 bg-black text-white border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">registros</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handleNewClient}
              >
                Nuevo
              </Button>
              <Input
                placeholder="Buscar..."
                className="w-48"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ítem</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Documento</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Teléfono</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sede</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha Ingreso</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Acción</th>
                </tr>
              </thead>
              <tbody>
                {mockClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{client.item}</td>
                    <td className="px-4 py-3 text-sm">{client.name}</td>
                    <td className="px-4 py-3 text-sm">{client.document}</td>
                    <td className="px-4 py-3 text-sm">{client.phone}</td>
                    <td className="px-4 py-3 text-sm">{client.branch}</td>
                    <td className="px-4 py-3 text-sm">{client.join_date}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        client.status === "ACTIVE" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {client.status === "ACTIVE" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-cyan-600 hover:bg-cyan-50"
                          onClick={() => handleEdit(client.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-yellow-600 hover:bg-yellow-50"
                          onClick={() => handleView(client.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="p-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Mostrando 1 a {mockClients.length} de {mockClients.length} registros
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white px-6"
                size="sm"
              >
                1
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Componente modal separado */}
      <ClientDetailModal
        open={isViewOpen}
        onOpenChange={(open) => {
          setIsViewOpen(open);
          if (!open) setSelectedClient(null);
        }}
        client={selectedClient}
      />
      <ClientEditModal
      open={isEditOpen}
      onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) setSelectedClientForEdit(null);
      }}
      client={selectedClientForEdit}
      onSave={handleSaveClient}
    />
    <ClientCreateModal
    open={isCreateOpen}
    onOpenChange={(open) => {
      setIsCreateOpen(open);
    }}
    onSave={(partial) => {
      handleSaveNewClient(partial as any);
    }}
    />
    </>

  );
}

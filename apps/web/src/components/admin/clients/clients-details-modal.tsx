"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";

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

interface ClientDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

/**
 * ClientDetailModal
 * - Componente stateless que muestra los datos del cliente recibidos por props
 */
export function ClientDetailModal({
  open,
  onOpenChange,
  client,
}: ClientDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalle del cliente</DialogTitle>
          <DialogDescription>
            Información general del cliente y datos de contacto.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col col-span-2">
            <span className="text-xs text-gray-500">Nombre Completo</span>
            <span className="text-sm font-medium">
              {client?.person ? `${client.person.name} ${client.person.last_name}` : "—"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Tipo de Documento</span>
            <span className="text-sm font-medium">{client?.person?.document_type ?? "—"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Número de Documento</span>
            <span className="text-sm font-medium">{client?.person?.document_number ?? "—"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Teléfono</span>
            <span className="text-sm font-medium">{client?.person?.phone ?? "—"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Email</span>
            <span className="text-sm font-medium">{client?.user?.email ?? "—"}</span>
          </div>

          <div className="flex flex-col col-span-2">
            <span className="text-xs text-gray-500">Sede(s)</span>
            <span className="text-sm font-medium">
              {client?.branches && client.branches.length > 0
                ? client.branches.map(b => b.name).join(", ")
                : "—"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Estado</span>
            <span
              className={`text-sm font-medium inline-block px-2 py-1 rounded-full ${client?.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              {client?.status === "ACTIVE" ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Pago activo</span>
            <span className="text-sm font-medium">
              {client ? (client.is_payment_active ? "Sí" : "No") : "—"}
            </span>
          </div>

          <div className="flex flex-col col-span-2">
            <span className="text-xs text-gray-500">Fecha de ingreso</span>
            <span className="text-sm font-medium">
              {client?.join_date ? new Date(client.join_date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : "—"}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

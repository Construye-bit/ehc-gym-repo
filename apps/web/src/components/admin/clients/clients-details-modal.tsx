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

interface Client {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  branch: string;
  status: string;
  is_payment_active: boolean;
  join_date: string;
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
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">ID</span>
            <span className="text-sm font-medium">{client?.id ?? "—"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Nombre</span>
            <span className="text-sm font-medium">{client?.name ?? "—"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Documento</span>
            <span className="text-sm font-medium">{client?.document ?? "—"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Teléfono</span>
            <span className="text-sm font-medium">{client?.phone ?? "—"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Email</span>
            <span className="text-sm font-medium">{client?.email ?? "—"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Sede</span>
            <span className="text-sm font-medium">{client?.branch ?? "—"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Estado</span>
            <span
              className={`text-sm font-medium inline-block px-2 py-1 rounded-full ${
                client?.status === "ACTIVE"
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
              {client?.is_payment_active ? "Sí" : "No"}
            </span>
          </div>

          <div className="flex flex-col col-span-2">
            <span className="text-xs text-gray-500">Fecha de ingreso</span>
            <span className="text-sm font-medium">{client?.join_date ?? "—"}</span>
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

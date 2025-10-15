"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // si no lo tienes, puedes sustituir por un <span>
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

interface ClientEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSave: (updated: Client) => void;
}

/**
 * ClientEditModal
 * - Componente stateless que recibe client y devuelve los cambios con onSave.
 * - Internamente maneja un pequeño form controlado.
 */
export function ClientEditModal({
  open,
  onOpenChange,
  client,
  onSave,
}: ClientEditModalProps) {
  // local form state (se inicializa desde props.client)
  const [form, setForm] = useState<Client | null>(null);

  // cada vez que cambie client, re-inicializamos el form
  useEffect(() => {
    if (client) {
      // clonar para que no mutemos el objeto original
      setForm({ ...client });
    } else {
      setForm(null);
    }
  }, [client]);

  const handleChange = (field: keyof Client, value: any) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = () => {
    if (!form) return;

    // Basic validation
    if (!form.name?.trim()) {
      alert("El nombre es requerido");
      return;
    }
    if (!form.email?.trim() || !form.email.includes("@")) {
      alert("Email inválido");
      return;
    }
    if (!form.document?.trim()) {
      alert("El documento es requerido");
      return;
    }

    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            Actualiza la información del cliente. (Mock — sin conexión al backend)
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-500">Nombre</Label>
            <Input
              value={form?.name ?? ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Documento</Label>
            <Input
              value={form?.document ?? ""}
              onChange={(e) => handleChange("document", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Teléfono</Label>
            <Input
              value={form?.phone ?? ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Email</Label>
            <Input
              value={form?.email ?? ""}
              onChange={(e) => handleChange("email", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Sede</Label>
            <Input
              value={form?.branch ?? ""}
              onChange={(e) => handleChange("branch", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Fecha de ingreso</Label>
            <Input
              type="date"
              value={form?.join_date ?? ""}
              onChange={(e) => handleChange("join_date", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Estado</Label>
            <Input
              value={form?.status ?? ""}
              onChange={(e) => handleChange("status", e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_payment_active"
              checked={form?.is_payment_active ?? false}
              onChange={(e) =>
                handleChange("is_payment_active", e.target.checked)
              }
              className="h-4 w-4"
            />
            <Label htmlFor="is_payment_active" className="text-xs text-gray-500">
              Pago activo
            </Label>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

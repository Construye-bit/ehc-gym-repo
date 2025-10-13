"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // si no existe, sustituir por span
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
  item: number;
  name: string;
  document: string;
  phone: string;
  email: string;
  branch: string;
  status: string;
  is_payment_active: boolean;
  join_date: string;
}

interface ClientCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newClient: Client) => void;
}

/**
 * ClientCreateModal
 * - Form simple para crear un nuevo cliente (mock)
 * - Devuelve el objeto creado mediante onSave
 */
export function ClientCreateModal({ open, onOpenChange, onSave }: ClientCreateModalProps) {
  const [form, setForm] = useState<Omit<Client, "id" | "item">>({
    name: "",
    document: "",
    phone: "",
    email: "",
    branch: "",
    status: "ACTIVE",
    is_payment_active: false,
    join_date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
  });

  useEffect(() => {
    if (!open) {
      // resetear form cuando se cierre
      setForm({
        name: "",
        document: "",
        phone: "",
        email: "",
        branch: "",
        status: "ACTIVE",
        is_payment_active: false,
        join_date: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open]);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validaciones mínimas
    if (!form.name.trim()) {
      // podrías mostrar un toast o error, por ahora console.log
      console.warn("El nombre es requerido");
      return;
    }

    // Construir objeto a retornar (id/item serán asignados por el parent)
    // Aquí devolvemos el objeto sin id/item — parent se encarga de asignarlos.
    onSave({
      id: "", // parent reemplaza
      item: 0, // parent reemplaza
      name: form.name,
      document: form.document,
      phone: form.phone,
      email: form.email,
      branch: form.branch,
      status: form.status,
      is_payment_active: form.is_payment_active,
      join_date: form.join_date,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear nuevo cliente</DialogTitle>
          <DialogDescription>
            Ingresa los datos básicos del cliente. (Mock — sin conexión al backend)
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-500">Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Documento</Label>
            <Input
              value={form.document}
              onChange={(e) => handleChange("document", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Teléfono</Label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Email</Label>
            <Input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Sede</Label>
            <Input
              value={form.branch}
              onChange={(e) => handleChange("branch", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Fecha de ingreso</Label>
            <Input
              type="date"
              value={form.join_date}
              onChange={(e) => handleChange("join_date", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Estado</Label>
            <Input
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Pago activo (true/false)</Label>
            <Input
              value={String(form.is_payment_active)}
              onChange={(e) => handleChange("is_payment_active", e.target.value === "true")}
              placeholder="true or false"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Crear</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

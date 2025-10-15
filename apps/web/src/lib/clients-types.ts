import { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";

export interface Client {
  _id: Id<"clients">;
  person_id: Id<"persons">;
  user_id?: Id<"users">;
  status: "ACTIVE" | "INACTIVE";
  is_payment_active: boolean;
  join_date: number;
  end_date?: number;
  created_by_user_id: Id<"users">;
  created_at: number;
  updated_at: number;
  active: boolean;
}

export interface ClientFormData {
  personName: string;
  personLastName: string;
  personDocumentType: "CC" | "TI" | "CE" | "PASSPORT";
  personDocumentNumber: string;
  personPhone: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  isPaymentActive: boolean;
  joinDate: string;
  endDate?: string;
}

export type FormErrors = Partial<Record<keyof ClientFormData, string>>;
// Tipos para el formulario
export interface FormErrors {
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    personName?: string;
    personLastName?: string;
    personBornDate?: string;
    personDocumentType?: string;
    personDocumentNumber?: string;
    branch?: string;
    rolType?: string;
}

// Tipo para documentos
export type DocumentType = {
    value: string;
    label: string;
};

// Tipo para administradores
export interface Administrator {
    _id: string;
    person?: {
        name: string;
        last_name: string;
        document_type: string;
        document_number: string;
        born_date: string;
    };
    user?: {
        name: string;
        email: string;
        phone: string;
    };
    branch?: {
        _id: string;
        name: string;
    };
    rol_type: string;
    status: "active" | "inactive";
    created_at: string;
    updated_at: string;
}
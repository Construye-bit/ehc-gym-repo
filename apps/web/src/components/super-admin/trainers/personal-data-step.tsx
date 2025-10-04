import React from "react";
import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import type { PersonalData } from "@/lib/validations/trainers";
import type { FormErrors } from "@/lib/trainer-types";
import { DOCUMENT_TYPES } from "@/lib/trainer-constants";

interface PersonalDataStepProps {
    personalData: PersonalData;
    errors: FormErrors;
    onUpdate: (field: keyof PersonalData, value: string) => void;
}

export function PersonalDataStep({ personalData, errors, onUpdate }: PersonalDataStepProps) {
    return (
        <FormSection
            icon={<CreditCard size={20} />}
            title="Datos Personales"
            description="Información personal del entrenador"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    label="Nombre"
                    required
                    error={errors.personName}
                >
                    <Input
                        className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                        placeholder="Juan"
                        value={personalData.personName}
                        onChange={(e) => onUpdate('personName', e.target.value)}
                    />
                </FormField>

                <FormField
                    label="Apellido"
                    required
                    error={errors.personLastName}
                >
                    <Input
                        className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                        placeholder="Pérez"
                        value={personalData.personLastName}
                        onChange={(e) => onUpdate('personLastName', e.target.value)}
                    />
                </FormField>

                <FormField
                    label="Fecha de nacimiento"
                    required
                    error={errors.personBornDate}
                >
                    <Input
                        className="border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400"
                        type="date"
                        value={personalData.personBornDate}
                        onChange={(e) => onUpdate('personBornDate', e.target.value)}
                    />
                </FormField>

                <FormField label="Tipo de documento" required error={errors.personDocumentType}>
                    <Select
                        value={personalData.personDocumentType}
                        onValueChange={(value) => onUpdate('personDocumentType', value)}
                    >
                        <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400">
                            <SelectValue placeholder="Selecciona un tipo de documento" className="text-gray-500" />
                        </SelectTrigger>
                        <SelectContent>
                            {DOCUMENT_TYPES.map((doc) => (
                                <SelectItem key={doc.value} value={doc.value}>
                                    {doc.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField
                    label="Número de documento"
                    required
                    error={errors.personDocumentNumber}
                >
                    <Input
                        className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                        placeholder="12345678"
                        value={personalData.personDocumentNumber}
                        onChange={(e) => onUpdate('personDocumentNumber', e.target.value)}
                    />
                </FormField>
            </div>
        </FormSection>
    );
}

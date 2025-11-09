import React from "react";
import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BasicInfoData, FormErrors } from "@/lib/sede-types";
import { SEDE_STATUSES } from "@/lib/sede-constants";

interface BasicInfoStepProps {
    basicInfo: BasicInfoData;
    errors: FormErrors;
    onUpdate: (field: keyof BasicInfoData, value: string) => void;
}

export function BasicInfoStep({ basicInfo, errors, onUpdate }: BasicInfoStepProps) {
    return (
        <FormSection
            icon={<Building2 size={20} />}
            title="Información Básica"
            description="Datos generales de la sede"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    label="Nombre de la Sede"
                    required
                    error={errors.name}
                >
                    <Input
                        className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                        placeholder="Ej: EHC Gym Centro"
                        value={basicInfo.name}
                        onChange={(e) => onUpdate("name", e.target.value)}
                    />
                </FormField>

                <FormField
                    label="Estado"
                    required
                    error={errors.status}
                >
                    <Select
                        value={basicInfo.status}
                        onValueChange={(value) => onUpdate("status", value)}
                    >
                        <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400">
                            <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                            {SEDE_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField
                    label="Capacidad Máxima"
                    required
                    error={errors.max_capacity}
                >
                    <Input
                        type="number"
                        min="1"
                        className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                        placeholder="100"
                        value={basicInfo.max_capacity}
                        onChange={(e) => onUpdate("max_capacity", e.target.value)}
                    />
                </FormField>
            </div>
        </FormSection>
    );
}
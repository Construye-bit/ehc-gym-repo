import React from "react";
import { Building2 } from "lucide-react";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { SpecialtyTags } from "@/components/ui/specialty-tags";
import type { WorkData } from "@/lib/validations/trainers";
import type { FormErrors } from "@/lib/trainer-types";

// Tipo simplificado de branch para el formulario
type SimpleBranch = {
    _id: Id<"branches">;
    name: string;
    status: "ACTIVE" | "INACTIVE" | "UNDER_CONSTRUCTION" | "TEMPORARILY_CLOSED";
};

interface WorkDataStepProps {
    workData: WorkData;
    errors: FormErrors;
    branches: SimpleBranch[] | undefined;
    onUpdate: (field: keyof WorkData, value: string | string[]) => void;
    onAddSpecialty: (specialty: string) => void;
    onRemoveSpecialty: (index: number) => void;
}

export function WorkDataStep({
    workData,
    errors,
    branches,
    onUpdate,
    onAddSpecialty,
    onRemoveSpecialty
}: WorkDataStepProps) {
    return (
        <FormSection
            icon={<Building2 size={20} />}
            title="Datos Laborales"
            description="Información laboral y especialidades"
        >
            <div className="grid grid-cols-1 gap-6">
                <FormField
                    label="Sede"
                    required
                    error={errors.branch}
                >
                    <Select
                        value={workData.branch}
                        onValueChange={(value) => onUpdate('branch', value)}
                    >
                        <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400">
                            <SelectValue placeholder="Selecciona una sede" className="text-gray-500" />
                        </SelectTrigger>
                        <SelectContent>
                            {branches === undefined ? (
                                <SelectItem value="__loading__" disabled>
                                    Cargando sedes...
                                </SelectItem>
                            ) : branches.filter(branch => branch.status === "ACTIVE").length === 0 ? (
                                <SelectItem value="__no_branches__" disabled>
                                    No hay sedes disponibles
                                </SelectItem>
                            ) : (
                                branches
                                    .filter(branch => branch.status === "ACTIVE")
                                    .map((branch) => (
                                        <SelectItem key={branch._id} value={branch.name}>
                                            {branch.name}
                                        </SelectItem>
                                    ))
                            )}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField label="Especialidades">
                    <SpecialtyTags
                        specialties={workData.specialties}
                        onAdd={onAddSpecialty}
                        onRemove={onRemoveSpecialty}
                    />
                </FormField>
            </div>
        </FormSection>
    );
}

import React from "react";
import { Building2 } from "lucide-react";
import type { Doc } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import type { WorkData } from "@/lib/validations/administrators";
import type { FormErrors } from "@/lib/administrator-types";

interface WorkDataStepProps {
    workData: WorkData;
    errors: FormErrors;
    branches?: Doc<"branches">[];
    onUpdate: (field: keyof WorkData, value: string) => void;
}

export function WorkDataStep({
    workData,
    errors,
    branches = [],
    onUpdate,
}: WorkDataStepProps) {
    return (
        <FormSection
            icon={<Building2 size={20} />}
            title="Datos Laborales"
            description="Información sobre la sede asignada"
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
                            <SelectValue placeholder="Selecciona una sede" />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map((branch) => (
                                <SelectItem key={branch._id} value={branch._id}>
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
            </div>
        </FormSection>
    );
}
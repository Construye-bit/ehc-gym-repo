import React from "react";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import type { UserData } from "@/lib/validations/trainers";
import type { FormErrors } from "@/lib/trainer-types";

interface UserDataStepProps {
    userData: UserData;
    errors: FormErrors;
    onUpdate: (field: keyof UserData, value: string) => void;
}

export function UserDataStep({ userData, errors, onUpdate }: UserDataStepProps) {
    return (
        <FormSection
            icon={<User size={20} />}
            title="Datos de Usuario"
            description="Información de acceso al sistema"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    label="Nombre de usuario"
                    required
                    error={errors.userName}
                >
                    <Input
                        className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                        placeholder="usuario123"
                        value={userData.userName}
                        onChange={(e) => onUpdate('userName', e.target.value)}
                    />
                </FormField>

                <FormField
                    label="Correo electrónico"
                    required
                    error={errors.userEmail}
                >
                    <Input
                        className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                        type="email"
                        placeholder="usuario@example.com"
                        value={userData.userEmail}
                        onChange={(e) => onUpdate('userEmail', e.target.value)}
                    />
                </FormField>

                <FormField
                    label="Número de celular"
                    error={errors.userPhone}
                >
                    <Input
                        className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                        placeholder="300 123 4567"
                        value={userData.userPhone}
                        onChange={(e) => onUpdate('userPhone', e.target.value)}
                    />
                </FormField>
            </div>
        </FormSection>
    );
}

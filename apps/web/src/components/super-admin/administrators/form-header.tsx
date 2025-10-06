import React from "react";

interface FormHeaderProps {
    currentStep: number;
    totalSteps: number;
}

export function FormHeader({ currentStep, totalSteps }: FormHeaderProps) {
    return (
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
                Nuevo Administrador
            </h2>
            <p className="text-gray-600 mt-1">
                Paso {currentStep} de {totalSteps}
            </p>
        </div>
    );
}
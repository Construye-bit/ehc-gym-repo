import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { STEP_TITLES } from "@/lib/trainer-constants";

interface FormHeaderProps {
    currentStep: number;
    totalSteps: number;
}

export function FormHeader({ currentStep, totalSteps }: FormHeaderProps) {
    // Validar y obtener el título del paso con fallback
    const stepTitle = STEP_TITLES[currentStep as keyof typeof STEP_TITLES] ?? 'Paso desconocido';

    // Log warning si el paso está fuera de los límites para debugging
    if (!STEP_TITLES[currentStep as keyof typeof STEP_TITLES]) {
        console.warn(`FormHeader: currentStep ${currentStep} is out of bounds for STEP_TITLES array`);
    }

    return (
        <div className="flex items-center gap-4 mb-8">
            <Link to="/admin/trainers">
                <Button
                    variant="outline"
                    className="flex items-center gap-2 cursor-pointer bg-white border-gray-300 text-gray-700 hover:bg-yellow-100 hover:border-yellow-400 hover:text-black transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span>Volver</span>
                </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Entrenador</h1>
                <p className="text-gray-600 mt-1">
                    Paso {currentStep} de {totalSteps}: {stepTitle}
                </p>
            </div>
        </div>
    );
}

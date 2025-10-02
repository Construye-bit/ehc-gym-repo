import React from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormNavigationProps {
    currentStep: number;
    totalSteps: number;
    isLoading: boolean;
    onPrev: () => void;
    onNext: () => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export function FormNavigation({
    currentStep,
    totalSteps,
    isLoading,
    onPrev,
    onNext,
    onSubmit,
    onCancel,
}: FormNavigationProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <div>
                {currentStep > 1 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onPrev}
                        className="flex items-center gap-2 border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Anterior
                    </Button>
                )}
            </div>

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 cursor-pointer hover:text-gray-900 transition-colors"
                    onClick={onCancel}
                >
                    Cancelar
                </Button>

                {currentStep < totalSteps ? (
                    <Button
                        type="button"
                        onClick={onNext}
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600"
                    >
                        Siguiente
                        <ArrowRight size={16} />
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={onSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 disabled:bg-gray-400 disabled:border-gray-400"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Crear Entrenador
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}

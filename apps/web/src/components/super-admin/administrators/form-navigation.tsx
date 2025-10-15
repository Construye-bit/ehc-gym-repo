import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

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
    onCancel
}: FormNavigationProps) {
    return (
        <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                    <div>
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onPrev}
                                className="flex items-center gap-2 border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-900 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Anterior
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Link to="/super-admin/administrators">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-900 transition-colors"
                            >
                                Cancelar
                            </Button>
                        </Link>

                        {currentStep < totalSteps ? (
                            <Button
                                type="button"
                                onClick={onNext}
                                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold"
                            >
                                Siguiente
                                <ArrowRight size={16} />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={onSubmit}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold disabled:bg-yellow-300"
                            >
                                {isLoading ? "Guardando..." : "Guardar"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
import React from "react";
import { ArrowLeft, ArrowRight, Building2, MapPin, Clock, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FormHeader } from "./form-header";
import { FormNavigation } from "./form-navigation";
import { BasicInfoStep } from "./steps/basic-info-step";
import { LocationContactStep } from "./steps/location-contact-step";
import { ScheduleAmenitiesStep } from "./steps/schedule-amenities-step";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { useEditSedeForm } from "@/hooks/use-edit-sede-form";
import { TOTAL_STEPS } from "@/lib/sede-constants";

interface EditSedeFormProps {
    branchId: string;
}

export default function EditSedeForm({ branchId }: EditSedeFormProps) {
    const {
        currentStep,
        isLoading,
        isInitializing,
        errors,
        basicInfo,
        locationContact,
        scheduleAmenities,
        cities,
        addresses,
        branchDetails,
        updateBasicInfo,
        updateLocationContact,
        updateScheduleAmenities,
        updateMetadata,
        handleNext,
        handlePrev,
        handleSubmit,
        navigate,
    } = useEditSedeForm(branchId);

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <BasicInfoStep
                        basicInfo={basicInfo}
                        errors={errors}
                        onUpdate={updateBasicInfo}
                    />
                );

            case 2:
                return (
                    <LocationContactStep
                        locationContact={locationContact}
                        errors={errors}
                        cities={cities}
                        addresses={addresses}
                        onUpdate={updateLocationContact}
                    />
                );

            case 3:
                return (
                    <ScheduleAmenitiesStep
                        scheduleAmenities={scheduleAmenities}
                        errors={errors}
                        onUpdateSchedule={updateScheduleAmenities}
                        onUpdateMetadata={updateMetadata}
                    />
                );

            default:
                return null;
        }
    };

    const handleCancel = () => {
        navigate({ to: '/super-admin/sedes' });
    };

    // Renderizar estado de carga inicial
    if (branchDetails === undefined || isInitializing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/super-admin/sedes">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 cursor-pointer bg-white border-gray-300 text-gray-700 hover:bg-yellow-100 hover:border-yellow-400 hover:text-black transition-colors"
                            >
                                <ArrowLeft size={18} />
                                <span>Volver</span>
                            </Button>
                        </Link>
                        <div>
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>

                    <Card className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Si no se encontró la sede
    if (branchDetails === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Sede no encontrada</h1>
                    <p className="text-gray-600 mb-6">La sede que intentas editar no existe o no tienes permisos para acceder.</p>
                    <Link to="/super-admin/sedes">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 cursor-pointer bg-white border-gray-300 text-gray-700 hover:bg-yellow-100 hover:border-yellow-400 hover:text-black transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span>Volver a Sedes</span>
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/super-admin/sedes">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 cursor-pointer bg-white border-gray-300 text-gray-700 hover:bg-yellow-100 hover:border-yellow-400 hover:text-black transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span>Volver</span>
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Editar Sede</h1>
                        <p className="text-gray-600 mt-1">
                            Paso {currentStep} de {TOTAL_STEPS}: {
                                currentStep === 1 ? 'Información Básica' :
                                currentStep === 2 ? 'Ubicación y Contacto' : 'Horarios y Amenidades'
                            }
                        </p>
                        {branchDetails && (
                            <p className="text-sm text-gray-500">
                                Editando: {branchDetails.name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Progress Steps */}
                <ProgressSteps currentStep={currentStep} totalSteps={TOTAL_STEPS} />

                {/* Form Content */}
                <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    {renderStepContent()}
                    
                    <div className="mt-8">
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                            <div>
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrev}
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
                                    onClick={handleCancel}
                                >
                                    Cancelar
                                </Button>

                                {currentStep < TOTAL_STEPS ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600"
                                    >
                                        Siguiente
                                        <ArrowRight size={16} />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 disabled:bg-gray-400 disabled:border-gray-400"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                Actualizando...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                Actualizar Sede
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
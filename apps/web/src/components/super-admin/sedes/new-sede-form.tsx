import React from "react";
import { Card } from "@/components/ui/card";
import { FormHeader } from "./form-header";
import { FormNavigation } from "./form-navigation";
import { BasicInfoStep } from "./steps/basic-info-step";
import { LocationContactStep } from "./steps/location-contact-step";
import { ScheduleAmenitiesStep } from "./steps/schedule-amenities-step";
import { useSedeForm } from "../../../hooks/use-sede-form";
import { TOTAL_STEPS } from "../../../lib/sede-constants";

export default function NewSedeForm() {
    const {
        currentStep,
        isLoading,
        errors,
        basicInfo,
        locationContact,
        scheduleAmenities,
        cities,
        addresses,
        updateBasicInfo,
        updateLocationContact,
        updateScheduleAmenities,
        updateMetadata,
        handleNext,
        handlePrev,
        handleSubmit,
        navigate,
    } = useSedeForm();

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
            <div className="max-w-4xl mx-auto">
                <FormHeader currentStep={currentStep} totalSteps={TOTAL_STEPS} />

                {/* Indicador de progreso */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                                    step <= currentStep
                                        ? "bg-yellow-500"
                                        : "bg-gray-200"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    {renderStepContent()}
                    
                    <div className="mt-8">
                        <FormNavigation
                            currentStep={currentStep}
                            totalSteps={TOTAL_STEPS}
                            isLoading={isLoading}
                            onPrev={handlePrev}
                            onNext={handleNext}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
import React from "react";
import { ProgressSteps } from "@/components/ui/progress-steps";
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
        <div className="min-h-screen bg-yellow-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <FormHeader currentStep={currentStep} totalSteps={TOTAL_STEPS} />

                {/* Progress Steps */}
                <ProgressSteps currentStep={currentStep} totalSteps={TOTAL_STEPS} />

                {/* Form Content */}
                <div className="mb-6">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
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
        </div>
    );
}
import React from "react";
import { ProgressSteps } from "@/components/ui/progress-steps";

// Custom hook
import { useAdministratorForm } from "@/hooks/use-administrator-form";

// Components
import { FormHeader } from "./form-header";
import { FormNavigation } from "./form-navigation";
import { UserDataStep } from "./user-data-step";
import { PersonalDataStep } from "./personal-data-step";
import { WorkDataStep } from "./work-data-step";

// Constants
import { TOTAL_STEPS } from "@/lib/administrator-constants";

export default function NewAdministratorForm() {
    // Usar el hook personalizado que contiene toda la lógica
    const {
        currentStep,
        isLoading,
        errors,
        userData,
        personalData,
        workData,
        branches,
        updateUserData,
        updatePersonalData,
        updateWorkData,
        handleNext,
        handlePrev,
        handleSubmit,
        resetForm,
        navigate,
    } = useAdministratorForm();

    // Renderizar contenido por paso
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <UserDataStep
                        userData={userData}
                        errors={errors}
                        onUpdate={updateUserData}
                    />
                );

            case 2:
                return (
                    <PersonalDataStep
                        personalData={personalData}
                        errors={errors}
                        onUpdate={updatePersonalData}
                    />
                );

            case 3:
                return (
                    <WorkDataStep
                        workData={workData}
                        errors={errors}
                        branches={branches}
                        onUpdate={updateWorkData}
                    />
                );

            default:
                return null;
        }
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
                    onCancel={() => {
                        resetForm();
                        navigate({ to: "/super-admin/administrators" });
                    }}
                />
            </div>
        </div>
    );
}
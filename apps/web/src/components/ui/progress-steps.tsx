import * as React from "react";
import { Check } from "lucide-react";

interface ProgressStepsProps {
    currentStep: number;
    totalSteps: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep, totalSteps }) => {
    return (
        <div className="flex items-center justify-center mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <React.Fragment key={step}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step <= currentStep
                        ? 'bg-yellow-600 border-yellow-600 text-white'
                        : 'bg-white border-gray-300 text-gray-500'
                        }`}>
                        {step < currentStep ? (
                            <Check size={20} />
                        ) : (
                            <span className="text-sm font-medium">{step}</span>
                        )}
                    </div>
                    {step < totalSteps && (
                        <div className={`w-16 h-0.5 mx-2 ${step < currentStep ? 'bg-yellow-600' : 'bg-gray-300'
                            }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export { ProgressSteps };
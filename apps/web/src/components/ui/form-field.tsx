import * as React from "react";
import { Label } from "./label";

interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required = false, error, children }) => (
    <div className="space-y-2">
        <Label className="text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {children}
        {error && (
            <p className="text-sm text-red-600">{error}</p>
        )}
    </div>
);

export { FormField };
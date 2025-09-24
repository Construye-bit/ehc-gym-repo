import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";

interface FormSectionProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ icon, title, description, children }) => (
    <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                    {icon}
                </div>
                <div>
                    {title}
                    {description && (
                        <p className="text-sm font-normal text-gray-500 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            {children}
        </CardContent>
    </Card>
);

export { FormSection };
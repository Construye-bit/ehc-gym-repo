import React from "react";
import { Clock, Sparkles, Car, Waves, Wind, Wifi, Shirt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ScheduleAmenitiesData, FormErrors } from "@/lib/sede-types";

interface ScheduleAmenitiesStepProps {
    scheduleAmenities: ScheduleAmenitiesData;
    errors: FormErrors;
    onUpdateSchedule: (field: keyof ScheduleAmenitiesData, value: string) => void;
    onUpdateMetadata: (field: keyof ScheduleAmenitiesData['metadata'], value: boolean) => void;
}

export function ScheduleAmenitiesStep({
    scheduleAmenities,
    errors,
    onUpdateSchedule,
    onUpdateMetadata
}: ScheduleAmenitiesStepProps) {
    const amenities = [
        { key: "has_parking" as const, label: "Parqueadero", icon: Car },
        { key: "has_pool" as const, label: "Piscina", icon: Waves },
        { key: "has_sauna" as const, label: "Sauna", icon: Wind },
        { key: "has_spa" as const, label: "Spa", icon: Sparkles },
        { key: "has_locker_rooms" as const, label: "Vestideros", icon: Shirt },
        { key: "wifi_available" as const, label: "WiFi", icon: Wifi },
    ];

    return (
        <>
            <FormSection
                icon={<Clock size={20} />}
                title="Horarios de Operación"
                description="Define el horario de apertura y cierre"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        label="Hora de Apertura"
                        required
                        error={errors.opening_time}
                    >
                        <Input
                            type="time"
                            className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400"
                            value={scheduleAmenities.opening_time}
                            onChange={(e) => onUpdateSchedule("opening_time", e.target.value)}
                        />
                    </FormField>

                    <FormField
                        label="Hora de Cierre"
                        required
                        error={errors.closing_time}
                    >
                        <Input
                            type="time"
                            className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400"
                            value={scheduleAmenities.closing_time}
                            onChange={(e) => onUpdateSchedule("closing_time", e.target.value)}
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection
                icon={<Sparkles size={20} />}
                title="Amenidades"
                description="Selecciona las amenidades disponibles en la sede"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {amenities.map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-yellow-50 transition-colors">
                            <Checkbox
                                id={key}
                                checked={scheduleAmenities.metadata[key]}
                                onCheckedChange={(checked) => onUpdateMetadata(key, checked as boolean)}
                                className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                            />
                            <Label
                                htmlFor={key}
                                className="flex items-center gap-2 text-gray-700 cursor-pointer"
                            >
                                <Icon size={18} className="text-yellow-600" />
                                {label}
                            </Label>
                        </div>
                    ))}
                </div>
            </FormSection>
        </>
    );
}
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScheduleAmenitiesData, FormErrors } from "@/lib/sede-types";
import { Car, Waves, Wind, Sparkles, Wifi, Shirt } from "lucide-react";

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
        { key: "has_locker_rooms" as const, label: "Vestidores", icon: Shirt },
        { key: "wifi_available" as const, label: "WiFi", icon: Wifi },
    ];

    return (
        <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                    <CardTitle className="text-gray-800">Horarios de Operación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="opening_time" className="text-gray-700 font-semibold">
                                Hora de Apertura *
                            </Label>
                            <Input
                                id="opening_time"
                                type="time"
                                value={scheduleAmenities.opening_time}
                                onChange={(e) => onUpdateSchedule("opening_time", e.target.value)}
                                className={`bg-white ${errors.opening_time ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.opening_time && <p className="text-sm text-red-500">{errors.opening_time}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="closing_time" className="text-gray-700 font-semibold">
                                Hora de Cierre *
                            </Label>
                            <Input
                                id="closing_time"
                                type="time"
                                value={scheduleAmenities.closing_time}
                                onChange={(e) => onUpdateSchedule("closing_time", e.target.value)}
                                className={`bg-white ${errors.closing_time ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.closing_time && <p className="text-sm text-red-500">{errors.closing_time}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                    <CardTitle className="text-gray-800">Amenidades</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </div>
    );
}
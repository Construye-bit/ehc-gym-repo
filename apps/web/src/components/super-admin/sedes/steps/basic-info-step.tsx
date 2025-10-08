import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { BasicInfoData, FormErrors } from "@/lib/sede-types";
import { SEDE_STATUSES } from "@/lib/sede-constants";

interface BasicInfoStepProps {
    basicInfo: BasicInfoData;
    errors: FormErrors;
    onUpdate: (field: keyof BasicInfoData, value: string) => void;
}

export function BasicInfoStep({ basicInfo, errors, onUpdate }: BasicInfoStepProps) {
    return (
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-semibold">
                        Nombre de la Sede *
                    </Label>
                    <Input
                        id="name"
                        value={basicInfo.name}
                        onChange={(e) => onUpdate("name", e.target.value)}
                        placeholder="Ej: EHC Gym Centro"
                        className={`bg-white ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status" className="text-gray-700 font-semibold">
                        Estado *
                    </Label>
                    <Select
                        value={basicInfo.status}
                        onValueChange={(value) => onUpdate("status", value)}
                    >
                        <SelectTrigger className={`bg-white ${errors.status ? "border-red-500" : "border-gray-300"}`}>
                            <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                            {SEDE_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="max_capacity" className="text-gray-700 font-semibold">
                        Capacidad Máxima *
                    </Label>
                    <Input
                        id="max_capacity"
                        type="number"
                        min="1"
                        value={basicInfo.max_capacity}
                        onChange={(e) => onUpdate("max_capacity", e.target.value)}
                        placeholder="100"
                        className={`bg-white ${errors.max_capacity ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.max_capacity && <p className="text-sm text-red-500">{errors.max_capacity}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
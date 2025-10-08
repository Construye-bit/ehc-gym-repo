import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { LocationContactData, FormErrors } from "@/lib/sede-types";

interface LocationContactStepProps {
    locationContact: LocationContactData;
    errors: FormErrors;
    cities: any[];
    addresses: any[];
    onUpdate: (field: keyof LocationContactData, value: string) => void;
}

export function LocationContactStep({
    locationContact,
    errors,
    cities,
    addresses,
    onUpdate
}: LocationContactStepProps) {
    // Filtrar direcciones por ciudad seleccionada
    const filteredAddresses = useMemo(() => {
        if (!locationContact.cityId) return [];
        return addresses.filter(addr => addr.city_id === locationContact.cityId);
    }, [locationContact.cityId, addresses]);

    return (
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="cityId" className="text-gray-700 font-semibold">
                        Ciudad *
                    </Label>
                    <Select
                        value={locationContact.cityId}
                        onValueChange={(value) => {
                            onUpdate("cityId", value);
                            onUpdate("addressId", ""); // Resetear dirección al cambiar ciudad
                        }}
                    >
                        <SelectTrigger className={`bg-white ${errors.cityId ? "border-red-500" : "border-gray-300"}`}>
                            <SelectValue placeholder="Selecciona una ciudad" />
                        </SelectTrigger>
                        <SelectContent>
                            {cities.map((city) => (
                                <SelectItem key={city._id} value={city._id}>
                                    {city.name}, {city.state_region}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.cityId && <p className="text-sm text-red-500">{errors.cityId}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="addressId" className="text-gray-700 font-semibold">
                        Dirección *
                    </Label>
                    <Select
                        value={locationContact.addressId}
                        onValueChange={(value) => onUpdate("addressId", value)}
                        disabled={!locationContact.cityId}
                    >
                        <SelectTrigger className={`bg-white ${errors.addressId ? "border-red-500" : "border-gray-300"}`}>
                            <SelectValue placeholder={
                                locationContact.cityId 
                                    ? "Selecciona una dirección" 
                                    : "Primero selecciona una ciudad"
                            } />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredAddresses.map((address) => (
                                <SelectItem key={address._id} value={address._id}>
                                    {address.main_address}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.addressId && <p className="text-sm text-red-500">{errors.addressId}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-semibold">
                        Teléfono
                    </Label>
                    <Input
                        id="phone"
                        value={locationContact.phone}
                        onChange={(e) => onUpdate("phone", e.target.value)}
                        placeholder="Ej: 3001234567"
                        className={`bg-white ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-semibold">
                        Correo Electrónico
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={locationContact.email}
                        onChange={(e) => onUpdate("email", e.target.value)}
                        placeholder="sede@ehcgym.com"
                        className={`bg-white ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
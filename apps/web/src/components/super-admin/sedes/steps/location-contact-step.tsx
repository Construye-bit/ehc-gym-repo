import React, { useMemo, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AddCityModal } from "../add-city-modal";
import { AddAddressModal } from "../add-address-modal";
import type { LocationContactData, FormErrors } from "@/lib/sede-types";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";

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
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // Filtrar direcciones por ciudad seleccionada
    const filteredAddresses = useMemo(() => {
        if (!locationContact.cityId) return [];
        return addresses.filter(addr => addr.city_id === locationContact.cityId);
    }, [locationContact.cityId, addresses]);

    const handleCityAdded = (cityId: string) => {
        onUpdate("cityId", cityId);
        setIsCityModalOpen(false);
    };

    const handleAddressAdded = (addressId: string) => {
        onUpdate("addressId", addressId);
        setIsAddressModalOpen(false);
    };

    return (
        <FormSection
            icon={<MapPin size={20} />}
            title="Ubicación y Contacto"
            description="Información de localización y datos de contacto"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    label="Ciudad"
                    required
                    error={errors.cityId}
                >
                    <div className="flex gap-2">
                        <Select
                            value={locationContact.cityId}
                            onValueChange={(value) => {
                                onUpdate("cityId", value);
                                onUpdate("addressId", ""); // Resetear dirección al cambiar ciudad
                            }}
                        >
                            <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400">
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
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => setIsCityModalOpen(true)}
                            className="shrink-0"
                            title="Añadir nueva ciudad"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </FormField>

                <FormField
                    label="Dirección"
                    required
                    error={errors.addressId}
                >
                    <div className="flex gap-2">
                        <Select
                            value={locationContact.addressId}
                            onValueChange={(value) => onUpdate("addressId", value)}
                            disabled={!locationContact.cityId}
                        >
                            <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-400">
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
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => setIsAddressModalOpen(true)}
                            disabled={!locationContact.cityId}
                            className="shrink-0"
                            title="Añadir nueva dirección"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </FormField>

                <FormField
                    label="Teléfono"
                    error={errors.phone}
                >
                    <Input
                        className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                        placeholder="Ej: 3001234567"
                        value={locationContact.phone}
                        onChange={(e) => onUpdate("phone", e.target.value)}
                    />
                </FormField>

                <FormField
                    label="Correo Electrónico"
                    error={errors.email}
                >
                    <Input
                        type="email"
                        className="bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                        placeholder="sede@ehcgym.com"
                        value={locationContact.email}
                        onChange={(e) => onUpdate("email", e.target.value)}
                    />
                </FormField>
            </div>

            <AddCityModal
                isOpen={isCityModalOpen}
                onOpenChange={setIsCityModalOpen}
                onCityAdded={handleCityAdded}
            />

            <AddAddressModal
                isOpen={isAddressModalOpen}
                onOpenChange={setIsAddressModalOpen}
                cityId={locationContact.cityId as Id<"cities">}
                onAddressAdded={handleAddressAdded}
            />
        </FormSection>
    );
}
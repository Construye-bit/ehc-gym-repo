import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";

interface AddAddressModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    cityId: Id<"cities">;
    onAddressAdded: (addressId: string) => void;
}

interface FormData {
    main_address: string;
    reference: string;
    latitude: string;
    longitude: string;
}

const initialFormData: FormData = {
    main_address: "",
    reference: "",
    latitude: "",
    longitude: "",
};

export function AddAddressModal({ isOpen, onOpenChange, cityId, onAddressAdded }: AddAddressModalProps) {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Mutations
    const createAddressMutation = useMutation(api.addresses.mutations.create);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormData);
            setErrors({});
            setIsLoading(false);
        }
    }, [isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.main_address.trim()) {
            newErrors.main_address = "La dirección principal es requerida";
        }

        // Validar coordenadas si se proporcionan
        if (formData.latitude || formData.longitude) {
            if (!formData.latitude || !formData.longitude) {
                newErrors.coordinates = "Debe proporcionar tanto latitud como longitud, o dejar ambos vacíos";
            } else {
                const lat = parseFloat(formData.latitude);
                const lon = parseFloat(formData.longitude);

                if (isNaN(lat) || lat < -90 || lat > 90) {
                    newErrors.latitude = "La latitud debe ser un número entre -90 y 90";
                }

                if (isNaN(lon) || lon < -180 || lon > 180) {
                    newErrors.longitude = "La longitud debe ser un número entre -180 y 180";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!cityId) {
            toast.error("Error", {
                description: "Debe seleccionar una ciudad primero"
            });
            return;
        }

        setIsLoading(true);
        try {
            const lat = formData.latitude ? parseFloat(formData.latitude) : undefined;
            const lon = formData.longitude ? parseFloat(formData.longitude) : undefined;

            const result = await createAddressMutation({
                city_id: cityId,
                main_address: formData.main_address,
                reference: formData.reference || undefined,
                latitude: lat,
                longitude: lon,
            });

            toast.success("Dirección creada exitosamente", {
                description: `La dirección "${formData.main_address}" ha sido creada correctamente.`
            });

            onAddressAdded(result.addressId);
        } catch (error) {
            console.error("Error al crear dirección:", error);
            toast.error("Error al crear dirección", {
                description: error instanceof Error ? error.message : "Ocurrió un error inesperado"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    // No mostrar el modal si no hay cityId
    if (!cityId) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Añadir Nueva Dirección
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="main_address">Dirección Principal *</Label>
                        <Input
                            id="main_address"
                            value={formData.main_address}
                            onChange={(e) => handleInputChange("main_address", e.target.value)}
                            placeholder="Ej: Calle 20 # 9-82"
                            className={errors.main_address ? "border-red-500" : ""}
                        />
                        {errors.main_address && <p className="text-sm text-red-500">{errors.main_address}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reference">Referencia (opcional)</Label>
                        <Textarea
                            id="reference"
                            value={formData.reference}
                            onChange={(e) => handleInputChange("reference", e.target.value)}
                            placeholder="Ej: Cerca al parque principal, edificio de 3 pisos"
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                            Coordenadas (opcional)
                        </Label>
                        <p className="text-xs text-gray-500">
                            Ambos campos son opcionales, pero si proporciona uno debe proporcionar el otro
                        </p>

                        {errors.coordinates && (
                            <p className="text-sm text-red-500">{errors.coordinates}</p>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitud</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    value={formData.latitude}
                                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                                    placeholder="4.123456"
                                    className={errors.latitude ? "border-red-500" : ""}
                                />
                                {errors.latitude && <p className="text-xs text-red-500">{errors.latitude}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitud</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    value={formData.longitude}
                                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                                    placeholder="-73.123456"
                                    className={errors.longitude ? "border-red-500" : ""}
                                />
                                {errors.longitude && <p className="text-xs text-red-500">{errors.longitude}</p>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                "Crear Dirección"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import { toast } from "sonner";

interface AddCityModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onCityAdded: (cityId: string) => void;
}

interface FormData {
    country: string;
    state_region: string;
    name: string;
    type: "CIUDAD" | "MUNICIPIO" | "PUEBLO";
    postal_code: string;
}

const initialFormData: FormData = {
    country: "Colombia",
    state_region: "",
    name: "",
    type: "CIUDAD",
    postal_code: "",
};

export function AddCityModal({ isOpen, onOpenChange, onCityAdded }: AddCityModalProps) {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Mutations
    const createCityMutation = useMutation(api.cities.mutations.create);

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

        if (!formData.country.trim()) {
            newErrors.country = "El país es requerido";
        }

        if (!formData.state_region.trim()) {
            newErrors.state_region = "El departamento/región es requerido";
        }

        if (!formData.name.trim()) {
            newErrors.name = "El nombre de la ciudad es requerido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await createCityMutation({
                country: formData.country,
                state_region: formData.state_region,
                name: formData.name,
                type: formData.type,
                postal_code: formData.postal_code || undefined,
            });

            toast.success("Ciudad creada exitosamente", {
                description: `La ciudad "${formData.name}" ha sido creada correctamente.`
            });

            onCityAdded(result.cityId);
        } catch (error) {
            console.error("Error al crear ciudad:", error);
            toast.error("Error al crear ciudad", {
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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Añadir Nueva Ciudad
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="country">País *</Label>
                        <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) => handleInputChange("country", e.target.value)}
                            placeholder="Ej: Colombia"
                            className={errors.country ? "border-red-500" : ""}
                        />
                        {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state_region">Departamento/Región *</Label>
                        <Input
                            id="state_region"
                            value={formData.state_region}
                            onChange={(e) => handleInputChange("state_region", e.target.value)}
                            placeholder="Ej: Boyacá"
                            className={errors.state_region ? "border-red-500" : ""}
                        />
                        {errors.state_region && <p className="text-sm text-red-500">{errors.state_region}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la Ciudad *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Ej: Tunja"
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => handleInputChange("type", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CIUDAD">Ciudad</SelectItem>
                                <SelectItem value="MUNICIPIO">Municipio</SelectItem>
                                <SelectItem value="PUEBLO">Pueblo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="postal_code">Código Postal (opcional)</Label>
                        <Input
                            id="postal_code"
                            value={formData.postal_code}
                            onChange={(e) => handleInputChange("postal_code", e.target.value)}
                            placeholder="Ej: 150001"
                        />
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
                                "Crear Ciudad"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
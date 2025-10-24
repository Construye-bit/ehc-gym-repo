import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, MapPin, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import { toast } from "sonner";
import { extractConvexErrorMessage } from "@/lib/error-utils";
import { useAuth } from "@/hooks/use-auth";
import { AddCityModal } from "./add-city-modal";
import { AddAddressModal } from "./add-address-modal";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";

interface AddSedeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

interface FormData {
    name: string;
    cityId: string;
    addressId: string;
    phone: string;
    email: string;
    opening_time: string;
    closing_time: string;
    max_capacity: string;
    manager_id?: string;
    status: "ACTIVE" | "INACTIVE" | "UNDER_CONSTRUCTION" | "TEMPORARILY_CLOSED";
    opening_date?: string;
    metadata: {
        has_parking: boolean;
        has_pool: boolean;
        has_sauna: boolean;
        has_spa: boolean;
        has_locker_rooms: boolean;
        wifi_available: boolean;
    };
}

const initialFormData: FormData = {
    name: "",
    cityId: "",
    addressId: "",
    phone: "",
    email: "",
    opening_time: "06:00",
    closing_time: "22:00",
    max_capacity: "100",
    status: "ACTIVE",
    metadata: {
        has_parking: false,
        has_pool: false,
        has_sauna: false,
        has_spa: false,
        has_locker_rooms: true,
        wifi_available: true,
    },
};

export function AddSedeModal({ isOpen, onOpenChange }: AddSedeModalProps) {
    const { isAuthenticated } = useAuth();
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isAddCityModalOpen, setIsAddCityModalOpen] = useState(false);
    const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Queries
    const cities = useQuery(
        api.cities.queries.listForAdmins,
        isAuthenticated ? {} : "skip"
    );
    const addresses = useQuery(api.addresses.queries.getByCityForAdmins,
        formData.cityId && isAuthenticated ? { cityId: formData.cityId as Id<"cities"> } : "skip"
    );

    // Mutations
    const createBranchMutation = useMutation(api.branches.mutations.create);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormData);
            setErrors({});
            setIsLoading(false);
        }
    }, [isOpen]);

    // Reset address when city changes
    useEffect(() => {
        if (formData.cityId) {
            setFormData(prev => ({ ...prev, addressId: "" }));
        }
    }, [formData.cityId]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "El nombre de la sede es requerido";
        }

        if (!formData.cityId) {
            newErrors.cityId = "Debe seleccionar una ciudad";
        }

        if (!formData.addressId) {
            newErrors.addressId = "Debe seleccionar una dirección";
        }

        if (!formData.opening_time) {
            newErrors.opening_time = "La hora de apertura es requerida";
        }

        if (!formData.closing_time) {
            newErrors.closing_time = "La hora de cierre es requerida";
        }

        // Validar orden de horarios solo si ambos están presentes
        if (formData.opening_time && formData.closing_time) {
            const openingMinutes = formData.opening_time.split(':').reduce((acc, time, index) => {
                return acc + parseInt(time) * (index === 0 ? 60 : 1);
            }, 0);

            const closingMinutes = formData.closing_time.split(':').reduce((acc, time, index) => {
                return acc + parseInt(time) * (index === 0 ? 60 : 1);
            }, 0);

            if (closingMinutes <= openingMinutes) {
                newErrors.closing_time = "La hora de cierre debe ser posterior a la hora de apertura";
            }
        }

        const capacity = parseInt(formData.max_capacity);
        if (!formData.max_capacity || isNaN(capacity) || capacity <= 0) {
            newErrors.max_capacity = "La capacidad debe ser un número positivo";
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "El formato del email no es válido";
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
            await createBranchMutation({
                name: formData.name,
                address_id: formData.addressId as Id<"addresses">,
                phone: formData.phone || undefined,
                email: formData.email || undefined,
                opening_time: formData.opening_time,
                closing_time: formData.closing_time,
                max_capacity: parseInt(formData.max_capacity),
                status: formData.status,
                opening_date: formData.opening_date ? new Date(formData.opening_date).getTime() : undefined,
                metadata: formData.metadata,
            });

            toast.success("Sede creada exitosamente", {
                description: `La sede "${formData.name}" ha sido creada correctamente.`
            });

            onOpenChange(false);
        } catch (error) {
            console.error("Error al crear sede:", error);

            const errorMessage = extractConvexErrorMessage(error, "Ocurrió un error al crear la sede. Por favor, inténtalo de nuevo.");

            toast.error("Error al crear sede", {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleMetadataChange = (field: keyof FormData['metadata'], value: boolean) => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                [field]: value
            }
        }));
    };

    const handleCityAdded = (cityId: string) => {
        setFormData(prev => ({ ...prev, cityId }));
        setIsAddCityModalOpen(false);
    };

    const handleAddressAdded = (addressId: string) => {
        setFormData(prev => ({ ...prev, addressId }));
        setIsAddAddressModalOpen(false);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">
                            Añadir Nueva Sede
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre de la Sede *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="Ej: EHC Gym Centro"
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleInputChange("status", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Activa</SelectItem>
                                        <SelectItem value="INACTIVE">Inactiva</SelectItem>
                                        <SelectItem value="UNDER_CONSTRUCTION">En Construcción</SelectItem>
                                        <SelectItem value="TEMPORARILY_CLOSED">Cerrada Temporalmente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Ubicación */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Ubicación
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ciudad *</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={formData.cityId}
                                            onValueChange={(value) => handleInputChange("cityId", value)}
                                        >
                                            <SelectTrigger className={errors.cityId ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Seleccionar ciudad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cities?.map((city) => (
                                                    <SelectItem key={city._id} value={city._id}>
                                                        {city.name}, {city.state_region}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setIsAddCityModalOpen(true)}
                                            title="Añadir nueva ciudad"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {errors.cityId && <p className="text-sm text-red-500">{errors.cityId}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección *</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={formData.addressId}
                                            onValueChange={(value) => handleInputChange("addressId", value)}
                                            disabled={!formData.cityId}
                                        >
                                            <SelectTrigger className={errors.addressId ? "border-red-500" : ""}>
                                                <SelectValue placeholder={
                                                    !formData.cityId
                                                        ? "Primero seleccione una ciudad"
                                                        : "Seleccionar dirección"
                                                } />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {addresses?.map((address) => (
                                                    <SelectItem key={address._id} value={address._id}>
                                                        {address.main_address}
                                                        {address.reference && ` (${address.reference})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setIsAddAddressModalOpen(true)}
                                            disabled={!formData.cityId}
                                            title="Añadir nueva dirección"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {errors.addressId && <p className="text-sm text-red-500">{errors.addressId}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Contacto */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    placeholder="Ej: +57 300 123 4567"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    placeholder="Ej: sede@ehcgym.com"
                                    className={errors.email ? "border-red-500" : ""}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Horarios y Capacidad */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Horarios y Capacidad
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="opening_time">Hora de Apertura *</Label>
                                    <Input
                                        id="opening_time"
                                        type="time"
                                        value={formData.opening_time}
                                        onChange={(e) => handleInputChange("opening_time", e.target.value)}
                                        className={errors.opening_time ? "border-red-500" : ""}
                                    />
                                    {errors.opening_time && <p className="text-sm text-red-500">{errors.opening_time}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="closing_time">Hora de Cierre *</Label>
                                    <Input
                                        id="closing_time"
                                        type="time"
                                        value={formData.closing_time}
                                        onChange={(e) => handleInputChange("closing_time", e.target.value)}
                                        className={errors.closing_time ? "border-red-500" : ""}
                                    />
                                    {errors.closing_time && <p className="text-sm text-red-500">{errors.closing_time}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_capacity">Capacidad Máxima *</Label>
                                    <Input
                                        id="max_capacity"
                                        type="number"
                                        min="1"
                                        value={formData.max_capacity}
                                        onChange={(e) => handleInputChange("max_capacity", e.target.value)}
                                        placeholder="100"
                                        className={errors.max_capacity ? "border-red-500" : ""}
                                    />
                                    {errors.max_capacity && <p className="text-sm text-red-500">{errors.max_capacity}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="opening_date">Fecha de Apertura (opcional)</Label>
                                <Input
                                    id="opening_date"
                                    type="date"
                                    value={formData.opening_date || ""}
                                    onChange={(e) => handleInputChange("opening_date", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Servicios */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Servicios Disponibles</h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries({
                                    has_parking: "Estacionamiento",
                                    has_pool: "Piscina",
                                    has_sauna: "Sauna",
                                    has_spa: "Spa",
                                    has_locker_rooms: "Vestidores",
                                    wifi_available: "WiFi"
                                }).map(([key, label]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Switch
                                            id={key}
                                            checked={formData.metadata[key as keyof FormData['metadata']]}
                                            onCheckedChange={(checked) =>
                                                handleMetadataChange(key as keyof FormData['metadata'], checked)
                                            }
                                        />
                                        <Label htmlFor={key} className="text-sm font-medium">
                                            {label}
                                        </Label>
                                    </div>
                                ))}
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
                                    "Crear Sede"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para añadir ciudad */}
            <AddCityModal
                isOpen={isAddCityModalOpen}
                onOpenChange={setIsAddCityModalOpen}
                onCityAdded={handleCityAdded}
            />

            {/* Modal para añadir dirección */}
            <AddAddressModal
                isOpen={isAddAddressModalOpen}
                onOpenChange={setIsAddAddressModalOpen}
                cityId={formData.cityId as Id<"cities">}
                onAddressAdded={handleAddressAdded}
            />
        </>
    );
}
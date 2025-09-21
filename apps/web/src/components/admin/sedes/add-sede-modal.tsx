import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, Camera } from "lucide-react";

interface AddSedeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (sede: {
        name: string;
        departamento: string;
        ciudad: string;
        direccion: string;
        administrador: string;
        contacto: string;
        entrenadoresActivos: number;
        image: string;
        isActive: boolean;
    }) => void;
}

export function AddSedeModal({ isOpen, onClose, onAdd }: AddSedeModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        departamento: "",
        ciudad: "",
        direccion: "",
        administrador: "",
        contacto: "",
        entrenadoresActivos: 0,
        image: "",
        isActive: true
    });

    const [imagePreview, setImagePreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim() && formData.departamento.trim() && formData.ciudad.trim()) {
            onAdd({
                ...formData,
                image: imagePreview || formData.image || "/dashboard-sedes.jpg" 
            });
            handleReset();
            onClose();
        }
    };

    const handleReset = () => {
        setFormData({
            name: "",
            departamento: "",
            ciudad: "",
            direccion: "",
            administrador: "",
            contacto: "",
            entrenadoresActivos: 0,
            image: "",
            isActive: true
        });
        setImagePreview("");
    };

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop con desenfoque */}
            <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                {/* Modal Container */}
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-gray">
                    <Card className="border-0 shadow-none">
                        <CardHeader className="flex-1 h-11 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Camera size={24} />
                                    <CardTitle className="text-xl font-bold">
                                        Añadir Nueva Sede
                                    </CardTitle>
                                </div>
                                <Button
                                    onClick={handleClose}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-900 hover:bg-black/10 h-8 w-8 p-0"
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Información Básica */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sede-name" className="text-gray-700 font-medium">
                                            Nombre de la Sede *
                                        </Label>
                                        <Input
                                            id="sede-name"
                                            type="text"
                                            placeholder="Ej: EHC Gym Centro"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            className="h-11 rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sede-departamento" className="text-gray-700 font-medium">
                                            Departamento *
                                        </Label>
                                        <Input
                                            id="sede-departamento"
                                            type="text"
                                            placeholder="Ej: Boyacá"
                                            value={formData.departamento}
                                            onChange={(e) => handleInputChange("departamento", e.target.value)}
                                            className="h-11 rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sede-ciudad" className="text-gray-700 font-medium">
                                            Ciudad *
                                        </Label>
                                        <Input
                                            id="sede-ciudad"
                                            type="text"
                                            placeholder="Ej: Tunja"
                                            value={formData.ciudad}
                                            onChange={(e) => handleInputChange("ciudad", e.target.value)}
                                            className="h-11 rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sede-direccion" className="text-gray-700 font-medium">
                                            Dirección
                                        </Label>
                                        <Input
                                            id="sede-direccion"
                                            type="text"
                                            placeholder="Ej: Calle 20 # 9-82"
                                            value={formData.direccion}
                                            onChange={(e) => handleInputChange("direccion", e.target.value)}
                                            className="h-11 rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                                        />
                                    </div>
                                </div>

                                {/* Información de Personal */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sede-administrador" className="text-gray-700 font-medium">
                                            Administrador
                                        </Label>
                                        <Input
                                            id="sede-administrador"
                                            type="text"
                                            placeholder="Nombre del administrador"
                                            value={formData.administrador}
                                            onChange={(e) => handleInputChange("administrador", e.target.value)}
                                            className="h-11 rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sede-contacto" className="text-gray-700 font-medium">
                                            Contacto
                                        </Label>
                                        <Input
                                            id="sede-contacto"
                                            type="tel"
                                            placeholder="Ej: +57 300 123 4567"
                                            value={formData.contacto}
                                            onChange={(e) => handleInputChange("contacto", e.target.value)}
                                            className="h-11 rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sede-entrenadores" className="text-gray-700 font-medium">
                                        Entrenadores Activos
                                    </Label>
                                    <Input
                                        id="sede-entrenadores"
                                        type="number"
                                        min="0"
                                        placeholder="Ej: 5"
                                        value={formData.entrenadoresActivos}
                                        onChange={(e) => handleInputChange("entrenadoresActivos", parseInt(e.target.value) || 0)}
                                        className="h-11 rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Carga de Imagen */}
                                <div className="space-y-3">
                                    <Label className="text-gray-700 font-medium">
                                        Foto de la Sede
                                    </Label>
                                    
                                    {/* Vista previa de imagen */}
                                    {imagePreview && (
                                        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-300">
                                            <img 
                                                src={imagePreview} 
                                                alt="Vista previa" 
                                                className="w-full h-full object-cover"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => setImagePreview("")}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 h-6 w-6"
                                                size="sm"
                                            >
                                                <X size={12} />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Botones de carga */}
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 flex-1"
                                        >
                                            <Upload size={16} />
                                            Cargar desde PC
                                        </Button>
                                        
                                        {!imagePreview && (
                                            <div className="flex-1">
                                                <Label htmlFor="sede-image-url" className="sr-only">
                                                    URL de imagen
                                                </Label>
                                                <Input
                                                    id="sede-image-url"
                                                    type="url"
                                                    placeholder="O pega una URL de imagen"
                                                    value={formData.image}
                                                    onChange={(e) => handleInputChange("image", e.target.value)}
                                                    className="h-10 rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Input oculto para archivos */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>

                                {/* Botones de acción */}
                                <div className="flex gap-3 pt-6 border-t border-gray-200">
                                    <Button
                                        type="button"
                                        onClick={handleClose}
                                        variant="outline"
                                        className="flex-1 h-11"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-11 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                                    >
                                        Añadir Sede
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
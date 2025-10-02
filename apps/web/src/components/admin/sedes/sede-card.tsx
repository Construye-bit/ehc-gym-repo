import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin, User, Phone, Users, Loader2 } from "lucide-react";

interface SedeCardProps {
    sede: {
        id: number;
        name: string;
        departamento: string;
        ciudad: string;
        direccion: string;
        telefono: string;
        email: string;
        max_capacity: number;
        opening_time: string;
        closing_time: string;
        status: string;
        metadata: {
            has_parking?: boolean;
            has_pool?: boolean;
            has_sauna?: boolean;
            has_spa?: boolean;
            has_locker_rooms?: boolean;
            wifi_available?: boolean;
        };
        isActive: boolean;
    };
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export function SedeCard({ sede, onEdit, onDelete, isDeleting = false }: SedeCardProps) {
    // Mapeo de estados en español
    const estadoMap: Record<string, string> = {
        ACTIVE: "Activo",
        INACTIVE: "Inactivo",
        UNDER_CONSTRUCTION: "En construcción",
        CLOSED: "Cerrado",
    };

    const estadoEsp = estadoMap[sede.status] || sede.status;

    return (
        <Card className={`overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-105 h-80 relative group p-0 border-gray-300 ${isDeleting ? 'opacity-60' : ''}`}>
            <div
                className="relative w-full h-full bg-white text-black font-semibold px-6 py-3 flex flex-col justify-between transition-all duration-300"
            >
                {/* Overlay de eliminación */}
                {isDeleting && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                            <p className="text-white text-sm">Eliminando sede...</p>
                        </div>
                    </div>
                )}
                {/* Content */}
                <CardContent className="p-4 h-full flex flex-col justify-between relative z-10">
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1 opacity-90">
                            <MapPin size={12} />
                            <span>{sede.ciudad}, {sede.departamento}</span>
                        </div>
                        {sede.direccion && (
                            <div className="flex items-center gap-1 opacity-90">
                                <MapPin size={12} />
                                <span>{sede.direccion}</span>
                            </div>
                        )}
                        {sede.telefono && (
                            <div className="flex items-center gap-1 opacity-90">
                                <Phone size={12} />
                                <span>{sede.telefono}</span>
                            </div>
                        )}
                        {sede.email && (
                            <div className="flex items-center gap-1 opacity-90">
                                <span className="font-semibold">Email:</span>
                                <span>{sede.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 opacity-90">
                            <span className="font-semibold">Capacidad:</span>
                            <span>{sede.max_capacity}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-90">
                            <span className="font-semibold">Horario:</span>
                            <span>{sede.opening_time} - {sede.closing_time}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-90">
                            <span className="font-semibold">Estado:</span>
                            <span>{estadoEsp}</span>
                        </div>
                        {/* Servicios */}
                        <div className="flex flex-wrap gap-2 mt-1">
                            {sede.metadata.has_parking && <span className="bg-gray-400 px-2 py-1 rounded text-xs">Estacionamiento</span>}
                            {sede.metadata.has_pool && <span className="bg-gray-400 px-2 py-1 rounded text-xs">Piscina</span>}
                            {sede.metadata.has_sauna && <span className="bg-gray-400 px-2 py-1 rounded text-xs">Sauna</span>}
                            {sede.metadata.has_spa && <span className="bg-gray-400 px-2 py-1 rounded text-xs">Spa</span>}
                            {sede.metadata.has_locker_rooms && <span className="bg-gray-400 px-2 py-1 rounded text-xs">Vestidores</span>}
                            {sede.metadata.wifi_available && <span className="bg-gray-400 px-2 py-1 rounded text-xs">WiFi</span>}
                        </div>
                    </div>

                    {/* Action Buttons - Hidden by default, shown on hover */}
                    <div className={`flex justify-end gap-2 transition-opacity duration-300 mt-4 ${isDeleting ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <Button
                            onClick={onEdit}
                            size="sm"
                            disabled={isDeleting}
                            className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 disabled:hover:bg-gray-400 text-gray-900 font-semibold rounded-full p-2"
                        >
                            <Edit size={16} />
                        </Button>
                        <Button
                            onClick={onDelete}
                            size="sm"
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:hover:bg-red-300 text-white font-semibold rounded-full p-2"
                        >
                            {isDeleting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                        </Button>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
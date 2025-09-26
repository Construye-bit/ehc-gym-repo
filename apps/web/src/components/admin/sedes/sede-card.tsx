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
        administrador: string;
        contacto: string;
        entrenadoresActivos: number;
        image: string;
        isActive: boolean;
    };
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export function SedeCard({ sede, onEdit, onDelete, isDeleting = false }: SedeCardProps) {
    return (
        <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 h-80 relative group p-0 ${isDeleting ? 'opacity-60' : ''}`}>
            <div
                className="relative w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-xl"
                style={sede.image ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${sede.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                } : {}}
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
                    {/* Sede Info */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold mb-3 leading-tight">
                            {sede.name}
                        </h3>

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

                            {sede.administrador && (
                                <div className="flex items-center gap-1 opacity-90">
                                    <User size={12} />
                                    <span>{sede.administrador}</span>
                                </div>
                            )}

                            {sede.contacto && (
                                <div className="flex items-center gap-1 opacity-90">
                                    <Phone size={12} />
                                    <span>{sede.contacto}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1 opacity-90">
                                <Users size={12} />
                                <span>{sede.entrenadoresActivos} entrenadores</span>
                            </div>
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
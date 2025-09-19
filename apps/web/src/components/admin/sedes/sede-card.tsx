import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin, User, Phone, Users } from "lucide-react";

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
}

export function SedeCard({ sede, onEdit, onDelete }: SedeCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 h-80 relative group p-0">
            <div 
                className="relative w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-xl"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${sede.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
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
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4">
                        <Button
                            onClick={onEdit}
                            size="sm"
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full p-2"
                        >
                            <Edit size={16} />
                        </Button>
                        <Button
                            onClick={onDelete}
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full p-2"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
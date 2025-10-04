import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, UserPlus, UserMinus, Save } from "lucide-react";
import { useState, useEffect } from "react";

interface PersonalManagementContentProps {
    sedeId?: string;
    sedeName?: string;
}

// Datos de ejemplo de entrenadores disponibles
const availableTrainers = [
    { id: 1, name: "Carlos Pérez", specialty: "Pesas", isAssigned: false },
    { id: 2, name: "María García", specialty: "Cardio", isAssigned: true },
    { id: 3, name: "Juan López", specialty: "Yoga", isAssigned: false },
    { id: 4, name: "Ana Rodríguez", specialty: "CrossFit", isAssigned: true },
    { id: 5, name: "Pedro Martínez", specialty: "Natación", isAssigned: false },
    { id: 6, name: "Laura Sánchez", specialty: "Pilates", isAssigned: false },
];

export function PersonalManagementContent({ sedeId, sedeName }: PersonalManagementContentProps) {
    const [trainers, setTrainers] = useState(availableTrainers);
    const [hasChanges, setHasChanges] = useState(false);

    const assignedTrainers = trainers.filter(trainer => trainer.isAssigned);
    const unassignedTrainers = trainers.filter(trainer => !trainer.isAssigned);

    const handleAssignTrainer = (trainerId: number) => {
        setTrainers(prev =>
            prev.map(trainer =>
                trainer.id === trainerId
                    ? { ...trainer, isAssigned: true }
                    : trainer
            )
        );
        setHasChanges(true);
    };

    const handleUnassignTrainer = (trainerId: number) => {
        setTrainers(prev =>
            prev.map(trainer =>
                trainer.id === trainerId
                    ? { ...trainer, isAssigned: false }
                    : trainer
            )
        );
        setHasChanges(true);
    };

    const handleSaveChanges = () => {
        console.log(`Guardando ${assignedTrainers.length} entrenadores para la sede ${sedeName}`);

        // Simular guardado
        setTimeout(() => {
            setHasChanges(false);

            // Enviar mensaje a la ventana padre con validación
            if (window.opener && window.opener !== window && sedeId) {
                try {
                    window.opener.postMessage({
                        type: 'PERSONAL_UPDATED',
                        sedeId: sedeId,
                        count: assignedTrainers.length
                    }, window.location.origin);
                } catch (error) {
                    console.error('Error enviando mensaje a ventana padre:', error);
                }
            }

            // Intentar cerrar la ventana con manejo de errores
            try {
                if (typeof window.close === 'function') {
                    window.close();

                    // Verificar si la ventana se cerró después de un breve timeout
                    setTimeout(() => {
                        if (!window.closed) {
                            alert('No se pudo cerrar la ventana automáticamente. Por favor, ciérrala manualmente.');
                        }
                    }, 100);
                }
            } catch (error) {
                console.error('Error cerrando ventana:', error);
                alert('No se pudo cerrar la ventana automáticamente. Por favor, ciérrala manualmente.');
            }
        }, 1000);
    };

    const handleClose = () => {
        if (hasChanges) {
            const confirmClose = window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que deseas cerrar?');
            if (!confirmClose) return;
        }

        try {
            if (typeof window.close === 'function') {
                window.close();

                // Verificar si la ventana se cerró después de un breve timeout
                setTimeout(() => {
                    if (!window.closed) {
                        alert('No se pudo cerrar la ventana automáticamente. Por favor, ciérrala manualmente.');
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error cerrando ventana:', error);
            alert('No se pudo cerrar la ventana automáticamente. Por favor, ciérrala manualmente.');
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                ASIGNACIÓN DE PERSONAL
                            </h1>
                            <p className="text-xl text-gray-700">
                                Gestión de entrenadores para: <span className="font-semibold text-yellow-600">{sedeName}</span>
                            </p>
                        </div>
                    </div>

                    {hasChanges && (
                        <Button
                            onClick={handleSaveChanges}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Save size={20} />
                            Guardar Cambios
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{trainers.length}</div>
                            <div className="text-sm text-gray-600">Total Entrenadores</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{assignedTrainers.length}</div>
                            <div className="text-sm text-gray-600">Asignados a esta Sede</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{unassignedTrainers.length}</div>
                            <div className="text-sm text-gray-600">Disponibles</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Entrenadores Asignados */}
                <Card>
                    <CardHeader className="bg-green-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <Users size={20} />
                            Entrenadores Asignados ({assignedTrainers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-96 overflow-y-auto">
                        {assignedTrainers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No hay entrenadores asignados a esta sede
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {assignedTrainers.map(trainer => (
                                    <div key={trainer.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div>
                                            <div className="font-semibold text-gray-900">{trainer.name}</div>
                                            <div className="text-sm text-gray-600">{trainer.specialty}</div>
                                        </div>
                                        <Button
                                            onClick={() => handleUnassignTrainer(trainer.id)}
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 border-red-300 hover:bg-red-50"
                                        >
                                            <UserMinus size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Entrenadores Disponibles */}
                <Card>
                    <CardHeader className="bg-blue-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <UserPlus size={20} />
                            Entrenadores Disponibles ({unassignedTrainers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-96 overflow-y-auto">
                        {unassignedTrainers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Todos los entrenadores están asignados
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {unassignedTrainers.map(trainer => (
                                    <div key={trainer.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div>
                                            <div className="font-semibold text-gray-900">{trainer.name}</div>
                                            <div className="text-sm text-gray-600">{trainer.specialty}</div>
                                        </div>
                                        <Button
                                            onClick={() => handleAssignTrainer(trainer.id)}
                                            size="sm"
                                            className="bg-blue-500 hover:bg-blue-600 text-white"
                                        >
                                            <UserPlus size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Footer con información */}
            {hasChanges && (
                <div className="mt-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                        <Save size={16} />
                        <span className="font-semibold">Tienes cambios sin guardar</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                        Recuerda hacer clic en "Guardar Cambios" antes de cerrar esta ventana.
                    </p>
                </div>
            )}
        </main>
    );
}
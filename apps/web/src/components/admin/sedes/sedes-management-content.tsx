import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SedeCard } from "./sede-card";
import { useState } from "react";
import { AddSedeModal } from "./add-sede-modal";
import { EditSedeModal } from "./edit-sede-modal";

// Datos de ejemplo de las sedes con los nuevos campos
const sedesData = [
    {
        id: 1,
        name: "Garagoa",
        departamento: "Boyacá",
        ciudad: "Garagoa",
        direccion: "Calle Principal #123",
        administrador: "María González",
        contacto: "+57 300 123 4567",
        entrenadoresActivos: 4,
        image: "/dashboard-sedes.jpg",
        isActive: true
    },
    {
        id: 2,
        name: "Tunja",
        departamento: "Boyacá", 
        ciudad: "Tunja",
        direccion: "Carrera 20 #9-82",
        administrador: "Carlos Rodríguez",
        contacto: "+57 300 987 6543",
        entrenadoresActivos: 6,
        image: "/sede-tunja.jpg",
        isActive: true
    }
];

type SedeData = typeof sedesData[0];

export function SedesManagementContent() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSede, setSelectedSede] = useState<SedeData | null>(null);
    const [sedes, setSedes] = useState(sedesData);

    const handleAddSede = (newSede: Omit<SedeData, 'id'>) => {
        const sede = {
            ...newSede,
            id: sedes.length + 1
        };
        setSedes([...sedes, sede]);
    };

    const handleEditSede = (id: number) => {
        const sedeToEdit = sedes.find(sede => sede.id === id);
        if (sedeToEdit) {
            setSelectedSede(sedeToEdit);
            setIsEditModalOpen(true);
        }
    };

    const handleUpdateSede = (updatedSede: SedeData) => {
        setSedes(sedes.map(sede => 
            sede.id === updatedSede.id ? updatedSede : sede
        ));
        setSelectedSede(null);
    };

    const handleDeleteSede = (id: number) => {
        setSedes(sedes.filter(sede => sede.id !== id));
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedSede(null);
    };

    return (
        <>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8 animate-slide-in-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        SEDES DISPONIBLES
                    </h1>
                    <p className="text-xl text-gray-700 mb-6">
                        Administrador, Estas Son Las Sedes Disponibles Actualmente
                    </p>
                    
                    {/* Add Sede Button */}
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 animate-scale-in"
                    >
                        <Plus size={20} />
                        Añadir Sede
                    </Button>
                </div>

                {/* Sedes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-in-right">
                    {sedes.map((sede, index) => (
                        <div 
                            key={sede.id} 
                            className="animate-fade-in-up"
                            style={{ 
                                animationDelay: `${index * 0.2}s`,
                                animationFillMode: 'both'
                            }}
                        >
                            <SedeCard
                                sede={sede}
                                onEdit={() => handleEditSede(sede.id)}
                                onDelete={() => handleDeleteSede(sede.id)}
                            />
                        </div>
                    ))}
                </div>
            </main>

            {/* Modals */}
            <AddSedeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddSede}
            />

            <EditSedeModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onEdit={handleUpdateSede}
                sede={selectedSede}
            />
        </>
    );
}
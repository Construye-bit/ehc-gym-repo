import { View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import api from '@/api';

type DaySchedule = { start: string; end: string } | null;

type WeekSchedule = {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
};

const AVAILABLE_SPECIALTIES = [
    'Yoga',
    'CrossFit',
    'Pilates',
    'Funcional',
    'Spinning',
    'Zumba',
    'Musculación',
    'Cardio',
    'HIIT',
    'Boxeo',
    'Natación',
    'Stretching',
];

const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
] as const;

export default function TrainerWorkProfilePage() {
    const router = useRouter();
    
    // ==========================================
    // 1. QUERIES - Obtener datos del perfil
    // ==========================================
    // Query: profiles/trainer/queries:getMyTrainerProfile
    // Retorna: { trainer, person }
    const profileData = useQuery(api.profiles.trainer.queries.getMyTrainerProfile);
    
    // ==========================================
    // 2. MUTATIONS - Para actualizar especialidades y horario
    // ==========================================
    // Mutation: profiles/trainer/mutations:updateTrainerSpecialties
    // Args: { payload: { specialties: string[] } }
    const updateSpecialties = useMutation(api.profiles.trainer.mutations.updateTrainerSpecialties);
    
    // Mutation: profiles/trainer/mutations:updateTrainerSchedule
    // Args: { payload: { work_schedule: WeekSchedule } }
    const updateSchedule = useMutation(api.profiles.trainer.mutations.updateTrainerSchedule);
    
    // ==========================================
    // 3. ESTADOS LOCALES EDITABLES
    // ==========================================
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [workSchedule, setWorkSchedule] = useState<WeekSchedule>({
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
    });
    const [newSpecialty, setNewSpecialty] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [loading, setLoading] = useState(false);

    // ==========================================
    // 4. EFECTO - Inicializar datos cuando lleguen
    // ==========================================
    useEffect(() => {
        if (profileData?.trainer) {
            // Inicializar especialidades
            setSelectedSpecialties(profileData.trainer.specialties || []);
            
            // Inicializar horario
            if (profileData.trainer.work_schedule) {
                setWorkSchedule(profileData.trainer.work_schedule as WeekSchedule);
            }
        }
    }, [profileData]);

    // ==========================================
    // 5. HANDLERS PARA ESPECIALIDADES
    // ==========================================
    const toggleSpecialty = (specialty: string) => {
        if (selectedSpecialties.includes(specialty)) {
            setSelectedSpecialties(prev => prev.filter(s => s !== specialty));
        } else {
            setSelectedSpecialties(prev => [...prev, specialty]);
        }
    };

    const addCustomSpecialty = () => {
        const trimmed = newSpecialty.trim();
        if (trimmed === '') {
            Alert.alert('Error', 'Ingresa un nombre para la especialidad');
            return;
        }
        
        if (selectedSpecialties.includes(trimmed) || AVAILABLE_SPECIALTIES.includes(trimmed)) {
            Alert.alert('Error', 'Esta especialidad ya existe');
            return;
        }

        setSelectedSpecialties(prev => [...prev, trimmed]);
        setNewSpecialty('');
        setShowCustomInput(false);
    };

    const removeSpecialty = (specialty: string) => {
        setSelectedSpecialties(prev => prev.filter(s => s !== specialty));
    };

    // ==========================================
    // 6. HANDLERS PARA HORARIO
    // ==========================================
    const toggleDayActive = (day: keyof WeekSchedule) => {
        setWorkSchedule(prev => ({
            ...prev,
            [day]: prev[day] === null ? { start: '06:00', end: '14:00' } : null,
        }));
    };

    const updateDayTime = (day: keyof WeekSchedule, field: 'start' | 'end', value: string) => {
        setWorkSchedule(prev => ({
            ...prev,
            [day]: prev[day] ? { ...prev[day]!, [field]: value } : null,
        }));
    };

    const openTimePicker = (day: keyof WeekSchedule, field: 'start' | 'end') => {
        // TODO: Implementar selector de hora nativo
        // Para Android: TimePickerAndroid
        // Para iOS: DatePickerIOS con mode="time"
        console.log(`Abrir selector de hora para ${day} - ${field}`);
        Alert.alert('Selector de Hora', 'Esta funcionalidad estará disponible pronto');
    };

    // ==========================================
    // 7. HANDLER PARA GUARDAR
    // ==========================================
    const handleSave = async () => {
        if (selectedSpecialties.length === 0) {
            Alert.alert('Error', 'Debes seleccionar al menos una especialidad');
            return;
        }

        setLoading(true);
        try {
            // ==========================================
            // MUTATION 1 - Actualizar especialidades
            // ==========================================
            // Path: profiles/trainer/mutations:updateTrainerSpecialties
            // Body: { path: "...", args: { payload: { specialties: [...] } } }
            await updateSpecialties({
                payload: {
                    specialties: selectedSpecialties,
                }
            });

            // ==========================================
            // MUTATION 2 - Actualizar horario
            // ==========================================
            // Path: profiles/trainer/mutations:updateTrainerSchedule
            // Body: { path: "...", args: { payload: { work_schedule: {...} } } }
            await updateSchedule({
                payload: {
                    work_schedule: workSchedule,
                }
            });
            
            Alert.alert(
                'Éxito',
                'Perfil laboral actualizado correctamente',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error('Error al guardar:', error);
            Alert.alert(
                'Error', 
                error?.message || 'No se pudo actualizar el perfil laboral'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    // ==========================================
    // 8. ESTADOS DE CARGA Y ERROR
    // ==========================================
    if (profileData === undefined) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">Cargando perfil...</Text>
            </View>
        );
    }

    if (!profileData || !profileData.trainer) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-6">
                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                <Text className="mt-4 text-gray-900 font-semibold text-lg">
                    No se pudo cargar el perfil
                </Text>
                <Text className="mt-2 text-gray-600 text-center">
                    Intenta nuevamente o contacta con soporte
                </Text>
                <Button
                    onPress={() => router.back()}
                    className="mt-6 bg-blue-600 rounded-lg px-6 py-3"
                >
                    <Text className="text-white font-semibold">Volver</Text>
                </Button>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-8">
                {/* Header with Back Button */}
                <View className="flex-row items-center mb-6 py-4">
                    <TouchableOpacity onPress={handleCancel} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text variant="h2" className="text-2xl font-bold text-gray-900 flex-1">
                        Perfil Laboral
                    </Text>
                </View>

                {/* Specialties Section */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Especialidades
                    </Text>

                    {/* Selected Specialties (Chips) */}
                    {selectedSpecialties.length > 0 && (
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Especialidades Seleccionadas ({selectedSpecialties.length})
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {selectedSpecialties.map((specialty) => (
                                    <View
                                        key={specialty}
                                        className="bg-blue-100 border border-blue-300 rounded-full px-4 py-2 flex-row items-center"
                                    >
                                        <Text className="text-blue-700 font-medium mr-2">
                                            {specialty}
                                        </Text>
                                        <TouchableOpacity onPress={() => removeSpecialty(specialty)}>
                                            <Ionicons name="close-circle" size={18} color="#2563eb" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Available Specialties */}
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                        Especialidades Disponibles
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-3">
                        {AVAILABLE_SPECIALTIES.map((specialty) => {
                            const isSelected = selectedSpecialties.includes(specialty);
                            return (
                                <TouchableOpacity
                                    key={specialty}
                                    onPress={() => toggleSpecialty(specialty)}
                                    className={`rounded-full px-4 py-2 border ${
                                        isSelected
                                            ? 'bg-blue-100 border-blue-300'
                                            : 'bg-gray-50 border-gray-300'
                                    }`}
                                >
                                    <Text className={`font-medium ${
                                        isSelected ? 'text-blue-700' : 'text-gray-700'
                                    }`}>
                                        {specialty}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Add Custom Specialty */}
                    {!showCustomInput ? (
                        <TouchableOpacity
                            onPress={() => setShowCustomInput(true)}
                            className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300 flex-row items-center justify-center"
                        >
                            <Ionicons name="add-circle-outline" size={20} color="#4b5563" />
                            <Text className="text-gray-700 font-medium ml-2">
                                Agregar Especialidad Personalizada
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="flex-row gap-2">
                            <TextInput
                                value={newSpecialty}
                                onChangeText={setNewSpecialty}
                                placeholder="Nombre de la especialidad"
                                className="flex-1 bg-gray-50 rounded-lg p-4 text-gray-900 border border-gray-300"
                                placeholderTextColor="#9ca3af"
                            />
                            <TouchableOpacity
                                onPress={addCustomSpecialty}
                                className="bg-blue-600 rounded-lg px-4 justify-center"
                            >
                                <Ionicons name="checkmark" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowCustomInput(false);
                                    setNewSpecialty('');
                                }}
                                className="bg-gray-300 rounded-lg px-4 justify-center"
                            >
                                <Ionicons name="close" size={24} color="#4b5563" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Work Schedule Section */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Horario de Trabajo
                    </Text>

                    {DAYS_OF_WEEK.map(({ key, label }) => {
                        const schedule = workSchedule[key];
                        const isActive = schedule !== null;

                        return (
                            <View key={key} className="mb-3">
                                <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    {/* Day Header */}
                                    <View className="flex-row items-center justify-between mb-3">
                                        <Text className="text-gray-900 font-semibold text-base">
                                            {label}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => toggleDayActive(key)}
                                            className={`px-4 py-1 rounded-full ${
                                                isActive ? 'bg-green-100' : 'bg-gray-200'
                                            }`}
                                        >
                                            <Text className={`text-sm font-medium ${
                                                isActive ? 'text-green-700' : 'text-gray-600'
                                            }`}>
                                                {isActive ? 'Activo' : 'Inactivo'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Time Selectors */}
                                    {isActive && schedule && (
                                        <View className="flex-row gap-3">
                                            <View className="flex-1">
                                                <Text className="text-xs text-gray-600 mb-1">Inicio</Text>
                                                <TouchableOpacity
                                                    onPress={() => openTimePicker(key, 'start')}
                                                    className="bg-white rounded-lg p-3 border border-gray-300 flex-row items-center justify-between"
                                                >
                                                    <Text className="text-gray-900 font-medium">
                                                        {schedule.start}
                                                    </Text>
                                                    <Ionicons name="time-outline" size={18} color="#9ca3af" />
                                                </TouchableOpacity>
                                            </View>

                                            <View className="flex-1">
                                                <Text className="text-xs text-gray-600 mb-1">Fin</Text>
                                                <TouchableOpacity
                                                    onPress={() => openTimePicker(key, 'end')}
                                                    className="bg-white rounded-lg p-3 border border-gray-300 flex-row items-center justify-between"
                                                >
                                                    <Text className="text-gray-900 font-medium">
                                                        {schedule.end}
                                                    </Text>
                                                    <Ionicons name="time-outline" size={18} color="#9ca3af" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Info Card */}
                <View className="bg-blue-50 rounded-lg p-4 mb-6 flex-row border border-blue-200">
                    <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
                    <View className="flex-1 ml-3">
                        <Text className="text-sm text-blue-900 leading-5">
                            Tu horario de trabajo determina cuándo los clientes pueden agendar sesiones contigo. 
                            Asegúrate de mantenerlo actualizado.
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="gap-3 mb-8">
                    <Button
                        onPress={handleSave}
                        disabled={loading}
                        className="bg-blue-600 rounded-lg p-4"
                    >
                        <Text className="text-white text-center font-semibold text-base">
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Text>
                    </Button>
                    
                    <TouchableOpacity
                        onPress={handleCancel}
                        disabled={loading}
                        className="bg-gray-100 rounded-lg p-4"
                    >
                        <Text className="text-gray-700 text-center font-semibold text-base">
                            Cancelar
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
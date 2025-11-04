import { View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import api from '@/api';

type RoutineType = 'FUERZA' | 'CARDIO' | 'MIXTO' | 'MOVILIDAD';
type Goal = 'BAJAR_PESO' | 'TONIFICAR' | 'GANAR_MASA' | 'RESISTENCIA';

export default function PreferencesPage() {
    const router = useRouter();
    
    // ==========================================
    // 1. QUERIES - Obtener preferencias actuales
    // ==========================================
    // Query: profiles/client/queries:getMyClientProfile
    // Retorna: { person, client, preferences, latestHealth }
    const profileData = useQuery(api.profiles.client.queries.getMyClientProfile);
    
    // ==========================================
    // 2. MUTATIONS - Para actualizar preferencias
    // ==========================================
    // Mutation: profiles/client/mutations:upsertClientPreferences
    // Args: { payload: { preferred_time_range, routine_type, goal, notes } }
    const upsertPreferences = useMutation(api.profiles.client.mutations.upsertClientPreferences);
    
    // ==========================================
    // 3. ESTADOS LOCALES EDITABLES
    // ==========================================
    const [routineType, setRoutineType] = useState<RoutineType>('MIXTO');
    const [goal, setGoal] = useState<Goal>('TONIFICAR');
    const [preferredTimeStart, setPreferredTimeStart] = useState('06:00');
    const [preferredTimeEnd, setPreferredTimeEnd] = useState('08:00');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // ==========================================
    // 4. EFECTO - Inicializar datos cuando lleguen
    // ==========================================
    useEffect(() => {
        if (profileData?.preferences) {
            const prefs = profileData.preferences;
            
            // Inicializar tipo de rutina
            if (prefs.routine_type) {
                setRoutineType(prefs.routine_type as RoutineType);
            }
            
            // Inicializar objetivo
            if (prefs.goal) {
                setGoal(prefs.goal as Goal);
            }
            
            // Inicializar rango de tiempo preferido
            if (prefs.preferred_time_range) {
                setPreferredTimeStart(prefs.preferred_time_range.start || '06:00');
                setPreferredTimeEnd(prefs.preferred_time_range.end || '08:00');
            }
            
            // Inicializar notas
            if (prefs.notes) {
                setNotes(prefs.notes);
            }
        }
    }, [profileData]);

    // ==========================================
    // 5. OPCIONES Y CONFIGURACIÓN
    // ==========================================
    const routineTypes: { value: RoutineType; label: string; icon: string }[] = [
        { value: 'FUERZA', label: 'Fuerza', icon: 'barbell-outline' },
        { value: 'CARDIO', label: 'Cardio', icon: 'heart-outline' },
        { value: 'MIXTO', label: 'Mixto', icon: 'fitness-outline' },
        { value: 'MOVILIDAD', label: 'Movilidad', icon: 'body-outline' },
    ];

    const goals: { value: Goal; label: string; icon: string }[] = [
        { value: 'BAJAR_PESO', label: 'Bajar Peso', icon: 'trending-down-outline' },
        { value: 'TONIFICAR', label: 'Tonificar', icon: 'flash-outline' },
        { value: 'GANAR_MASA', label: 'Ganar Masa', icon: 'trending-up-outline' },
        { value: 'RESISTENCIA', label: 'Resistencia', icon: 'infinite-outline' },
    ];

    // ==========================================
    // 6. HANDLERS
    // ==========================================
    const handleSave = async () => {
        setLoading(true);
        try {
            // ==========================================
            // MUTATION - Actualizar preferencias
            // ==========================================
            // Path: profiles/client/mutations:upsertClientPreferences
            // Body: {
            //   path: "...",
            //   args: {
            //     payload: {
            //       preferred_time_range: { start, end },
            //       routine_type,
            //       goal,
            //       notes
            //     }
            //   }
            // }
            await upsertPreferences({
                payload: {
                    preferred_time_range: {
                        start: preferredTimeStart,
                        end: preferredTimeEnd,
                    },
                    routine_type: routineType,
                    goal: goal,
                    notes: notes.trim() || undefined,
                }
            });
            
            Alert.alert(
                'Éxito',
                'Preferencias actualizadas correctamente',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error('Error al guardar:', error);
            Alert.alert(
                'Error', 
                error?.message || 'No se pudieron actualizar las preferencias'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const openTimePicker = (field: 'start' | 'end') => {
        // TODO: Implementar selector de hora nativo
        // Para Android: TimePickerAndroid
        // Para iOS: DatePickerIOS con mode="time"
        console.log(`Abrir selector de hora para ${field}`);
        Alert.alert('Selector de Hora', 'Esta funcionalidad estará disponible pronto');
    };

    // ==========================================
    // 7. ESTADOS DE CARGA Y ERROR
    // ==========================================
    if (profileData === undefined) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">Cargando preferencias...</Text>
            </View>
        );
    }

    // Nota: preferences puede ser null si el cliente aún no ha configurado sus preferencias
    // En ese caso, mostrar el formulario vacío con valores por defecto

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-8">
                {/* Header with Back Button */}
                <View className="flex-row items-center mb-6 py-4">
                    <TouchableOpacity onPress={handleCancel} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text variant="h2" className="text-2xl font-bold text-gray-900 flex-1">
                        Preferencias
                    </Text>
                </View>

                {/* Routine Type Section */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Tipo de Rutina
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                        {routineTypes.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                onPress={() => setRoutineType(type.value)}
                                className={`flex-1 min-w-[45%] p-4 rounded-lg border-2 ${
                                    routineType === type.value
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <View className="items-center">
                                    <Ionicons
                                        name={type.icon as any}
                                        size={28}
                                        color={routineType === type.value ? '#2563eb' : '#4b5563'}
                                    />
                                    <Text className={`text-center font-medium mt-2 ${
                                        routineType === type.value
                                            ? 'text-blue-700'
                                            : 'text-gray-700'
                                    }`}>
                                        {type.label}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Goal Section */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Objetivo Principal
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                        {goals.map((g) => (
                            <TouchableOpacity
                                key={g.value}
                                onPress={() => setGoal(g.value)}
                                className={`flex-1 min-w-[45%] p-4 rounded-lg border-2 ${
                                    goal === g.value
                                        ? 'bg-green-50 border-green-500'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <View className="items-center">
                                    <Ionicons
                                        name={g.icon as any}
                                        size={28}
                                        color={goal === g.value ? '#16a34a' : '#4b5563'}
                                    />
                                    <Text className={`text-center font-medium mt-2 ${
                                        goal === g.value
                                            ? 'text-green-700'
                                            : 'text-gray-700'
                                    }`}>
                                        {g.label}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Preferred Time Range Section */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Horario Preferido
                    </Text>
                    <View className="flex-row gap-3 items-center">
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Desde
                            </Text>
                            <TouchableOpacity
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex-row items-center justify-between"
                                onPress={() => openTimePicker('start')}
                            >
                                <Text className="text-gray-900">
                                    {preferredTimeStart}
                                </Text>
                                <Ionicons name="time-outline" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Hasta
                            </Text>
                            <TouchableOpacity
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex-row items-center justify-between"
                                onPress={() => openTimePicker('end')}
                            >
                                <Text className="text-gray-900">
                                    {preferredTimeEnd}
                                </Text>
                                <Ionicons name="time-outline" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Notes Section */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Notas Adicionales
                    </Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Agrega cualquier información adicional sobre tus preferencias..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-gray-200 min-h-[100px]"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Action Buttons */}
                <View className="gap-3 mb-8">
                    <Button
                        onPress={handleSave}
                        disabled={loading}
                        className="bg-blue-600 rounded-lg p-4"
                    >
                        <Text className="text-white text-center font-semibold text-base">
                            {loading ? 'Guardando...' : 'Guardar Preferencias'}
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
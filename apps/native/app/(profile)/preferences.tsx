import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type RoutineType = 'FUERZA' | 'CARDIO' | 'MIXTO' | 'MOVILIDAD';
type Goal = 'BAJAR_PESO' | 'TONIFICAR' | 'GANAR_MASA' | 'RESISTENCIA';

export default function PreferencesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Datos quemados para visualización
    const [preferences, setPreferences] = useState({
        routineType: 'MIXTO' as RoutineType,
        goal: 'TONIFICAR' as Goal,
        preferredTimeStart: '06:00',
        preferredTimeEnd: '08:00',
        notes: 'Prefiero entrenamientos de alta intensidad en las mañanas',
    });

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

    // Handlers para futuras implementaciones
    const handleSave = async () => {
        setLoading(true);
        try {
            // TODO: Implementar llamada a la API
            console.log('Guardar preferencias:', preferences);
            
            // Simulación de guardado
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            Alert.alert(
                'Éxito',
                'Preferencias actualizadas correctamente',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudieron actualizar las preferencias');
            console.error('Error al guardar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleRoutineTypeChange = (type: RoutineType) => {
        setPreferences(prev => ({ ...prev, routineType: type }));
    };

    const handleGoalChange = (goal: Goal) => {
        setPreferences(prev => ({ ...prev, goal: goal }));
    };

    const handleTimeChange = (field: 'preferredTimeStart' | 'preferredTimeEnd', value: string) => {
        setPreferences(prev => ({ ...prev, [field]: value }));
    };

    const handleNotesChange = (notes: string) => {
        setPreferences(prev => ({ ...prev, notes }));
    };

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
                                onPress={() => handleRoutineTypeChange(type.value)}
                                className={`flex-1 min-w-[45%] p-4 rounded-lg border-2 ${
                                    preferences.routineType === type.value
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <View className="items-center">
                                    <Ionicons
                                        name={type.icon as any}
                                        size={28}
                                        color={preferences.routineType === type.value ? '#2563eb' : '#4b5563'}
                                    />
                                    <Text className={`text-center font-medium mt-2 ${
                                        preferences.routineType === type.value
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
                        {goals.map((goal) => (
                            <TouchableOpacity
                                key={goal.value}
                                onPress={() => handleGoalChange(goal.value)}
                                className={`flex-1 min-w-[45%] p-4 rounded-lg border-2 ${
                                    preferences.goal === goal.value
                                        ? 'bg-green-50 border-green-500'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <View className="items-center">
                                    <Ionicons
                                        name={goal.icon as any}
                                        size={28}
                                        color={preferences.goal === goal.value ? '#16a34a' : '#4b5563'}
                                    />
                                    <Text className={`text-center font-medium mt-2 ${
                                        preferences.goal === goal.value
                                            ? 'text-green-700'
                                            : 'text-gray-700'
                                    }`}>
                                        {goal.label}
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
                                onPress={() => {
                                    // TODO: Implementar selector de hora
                                    console.log('Abrir selector de hora inicial');
                                }}
                            >
                                <Text className="text-gray-900">
                                    {preferences.preferredTimeStart}
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
                                onPress={() => {
                                    // TODO: Implementar selector de hora
                                    console.log('Abrir selector de hora final');
                                }}
                            >
                                <Text className="text-gray-900">
                                    {preferences.preferredTimeEnd}
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
                        value={preferences.notes}
                        onChangeText={handleNotesChange}
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
import { View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import api from '@/api';

export default function IMCPage() {
    const router = useRouter();
    
    // ==========================================
    // 1. QUERIES - Obtener última métrica de salud
    // ==========================================
    // Query: profiles/client/queries:getMyClientProfile
    // Retorna: { person, client, preferences, latestHealth }
    const profileData = useQuery(api.profiles.client.queries.getMyClientProfile);
    
    // ==========================================
    // 2. MUTATIONS - Para guardar nuevas métricas
    // ==========================================
    // Mutation: profiles/client/mutations:addHealthMetric
    // Args: {
    //   payload: {
    //     measured_at: timestamp,
    //     weight_kg: number,
    //     height_cm: number,
    //     bmi: number,
    //     body_fat_pct: number|null,
    //     notes: string|null
    //   }
    // }
    const addHealthMetric = useMutation(api.profiles.client.mutations.addHealthMetric);
    
    // ==========================================
    // 3. ESTADOS LOCALES EDITABLES
    // ==========================================
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [notes, setNotes] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);
    const [bmiCategory, setBmiCategory] = useState<string>('');
    const [bmiColor, setBmiColor] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // ==========================================
    // 4. EFECTO - Inicializar altura desde última métrica
    // ==========================================
    // La altura normalmente no cambia, así que la pre-llenamos
    useEffect(() => {
        if (profileData?.latestHealth?.height_cm) {
            setHeight(profileData.latestHealth.height_cm.toString());
        }
    }, [profileData]);

    // ==========================================
    // 5. EFECTO - Calcular IMC automáticamente
    // ==========================================
    useEffect(() => {
        calculateBMI();
    }, [weight, height]);

    const calculateBMI = () => {
        const weightNum = parseFloat(weight);
        const heightInMeters = parseFloat(height) / 100;

        if (weightNum > 0 && heightInMeters > 0) {
            const calculatedBMI = weightNum / (heightInMeters * heightInMeters);
            setBmi(calculatedBMI);
            determineBMICategory(calculatedBMI);
        } else {
            setBmi(null);
            setBmiCategory('');
        }
    };

    const determineBMICategory = (bmiValue: number) => {
        if (bmiValue < 18.5) {
            setBmiCategory('Bajo Peso');
            setBmiColor('text-yellow-600');
        } else if (bmiValue >= 18.5 && bmiValue < 25) {
            setBmiCategory('Peso Normal');
            setBmiColor('text-green-600');
        } else if (bmiValue >= 25 && bmiValue < 30) {
            setBmiCategory('Sobrepeso');
            setBmiColor('text-orange-600');
        } else {
            setBmiCategory('Obesidad');
            setBmiColor('text-red-600');
        }
    };

    // ==========================================
    // 6. HANDLERS
    // ==========================================
    const handleMetricChange = (field: 'weight' | 'height' | 'bodyFat', value: string) => {
        // Solo permitir números y un punto decimal
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        
        switch (field) {
            case 'weight':
                setWeight(sanitizedValue);
                break;
            case 'height':
                setHeight(sanitizedValue);
                break;
            case 'bodyFat':
                setBodyFat(sanitizedValue);
                break;
        }
    };

    const handleSave = async () => {
        // Validaciones
        if (!weight || !height) {
            Alert.alert('Error', 'Por favor ingresa peso y altura');
            return;
        }

        if (!bmi) {
            Alert.alert('Error', 'Por favor ingresa valores válidos de peso y altura');
            return;
        }

        setLoading(true);
        try {
            // ==========================================
            // MUTATION - Guardar métrica de salud
            // ==========================================
            // Path: profiles/client/mutations:addHealthMetric
            // Body: {
            //   path: "...",
            //   args: {
            //     payload: {
            //       measured_at: timestamp,
            //       weight_kg,
            //       height_cm,
            //       bmi,
            //       body_fat_pct,
            //       notes
            //     }
            //   }
            // }
            await addHealthMetric({
                payload: {
                    measured_at: Date.now(),
                    weight_kg: parseFloat(weight),
                    height_cm: parseFloat(height),
                    bmi: bmi,
                    body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
                    notes: notes.trim() || null,
                }
            });
            
            Alert.alert(
                'Éxito',
                'Métricas de salud guardadas correctamente',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error('Error al guardar:', error);
            Alert.alert(
                'Error', 
                error?.message || 'No se pudieron guardar las métricas'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleViewHistory = () => {
        // TODO: Navegar a una página de historial de métricas
        // Query necesaria: profiles/client/queries:listHealthMetrics
        // Implementar paginación con cursor
        console.log('Navegar a historial de mediciones');
        Alert.alert('Próximamente', 'Esta función estará disponible pronto');
    };

    // ==========================================
    // 7. ESTADOS DE CARGA
    // ==========================================
    // Opcional: mostrar loading mientras carga el perfil
    // En este caso, permitimos que el formulario se muestre aunque no haya datos previos
    if (profileData === undefined) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">Cargando datos...</Text>
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
                        IMC y Métricas
                    </Text>
                </View>

                {/* BMI Result Card */}
                {bmi && (
                    <View className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
                        <View className="items-center">
                            <Text className="text-gray-600 text-sm font-medium mb-1">
                                Tu Índice de Masa Corporal
                            </Text>
                            <Text className="text-5xl font-bold text-blue-600 mb-2">
                                {bmi.toFixed(1)}
                            </Text>
                            <View className={`px-4 py-2 rounded-full bg-white`}>
                                <Text className={`font-semibold ${bmiColor}`}>
                                    {bmiCategory}
                                </Text>
                            </View>
                        </View>

                        {/* BMI Scale */}
                        <View className="mt-6">
                            <View className="flex-row h-3 rounded-full overflow-hidden">
                                <View className="flex-1 bg-yellow-400" />
                                <View className="flex-1 bg-green-400" />
                                <View className="flex-1 bg-orange-400" />
                                <View className="flex-1 bg-red-400" />
                            </View>
                            <View className="flex-row justify-between mt-2">
                                <Text className="text-xs text-gray-600">&lt;18.5</Text>
                                <Text className="text-xs text-gray-600">18.5-25</Text>
                                <Text className="text-xs text-gray-600">25-30</Text>
                                <Text className="text-xs text-gray-600">&gt;30</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Form Fields */}
                <View className="mb-6">
                    {/* Weight */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Peso (kg)
                        </Text>
                        <View className="relative">
                            <TextInput
                                value={weight}
                                onChangeText={(value) => handleMetricChange('weight', value)}
                                placeholder="75.0"
                                keyboardType="decimal-pad"
                                className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-gray-200 pr-12"
                                placeholderTextColor="#9ca3af"
                            />
                            <View className="absolute right-4 top-4">
                                <Text className="text-gray-500 font-medium">kg</Text>
                            </View>
                        </View>
                    </View>

                    {/* Height */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Altura (cm)
                        </Text>
                        <View className="relative">
                            <TextInput
                                value={height}
                                onChangeText={(value) => handleMetricChange('height', value)}
                                placeholder="175.0"
                                keyboardType="decimal-pad"
                                className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-gray-200 pr-12"
                                placeholderTextColor="#9ca3af"
                            />
                            <View className="absolute right-4 top-4">
                                <Text className="text-gray-500 font-medium">cm</Text>
                            </View>
                        </View>
                    </View>

                    {/* Body Fat Percentage (Optional) */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Porcentaje de Grasa Corporal (opcional)
                        </Text>
                        <View className="relative">
                            <TextInput
                                value={bodyFat}
                                onChangeText={(value) => handleMetricChange('bodyFat', value)}
                                placeholder="18.0"
                                keyboardType="decimal-pad"
                                className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-gray-200 pr-12"
                                placeholderTextColor="#9ca3af"
                            />
                            <View className="absolute right-4 top-4">
                                <Text className="text-gray-500 font-medium">%</Text>
                            </View>
                        </View>
                    </View>

                    {/* Notes */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Notas
                        </Text>
                        <TextInput
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Agrega notas sobre esta medición..."
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-gray-200 min-h-[80px]"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                </View>

                {/* Info Card */}
                <View className="bg-gray-50 rounded-lg p-4 mb-6 flex-row">
                    <Ionicons name="information-circle-outline" size={24} color="#4b5563" className="mr-3" />
                    <View className="flex-1 ml-3">
                        <Text className="text-sm text-gray-700 leading-5">
                            El IMC es una medida útil, pero no considera la composición corporal. 
                            Consulta con un profesional de la salud para una evaluación completa.
                        </Text>
                    </View>
                </View>

                {/* History Button */}
                <TouchableOpacity
                    onPress={handleViewHistory}
                    className="bg-gray-50 rounded-lg p-4 mb-6 flex-row items-center justify-between border border-gray-200"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="bar-chart-outline" size={20} color="#1f2937" />
                        <Text className="text-gray-900 ml-3 font-medium">
                            Ver Historial de Mediciones
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>

                {/* Action Buttons */}
                <View className="gap-3 mb-8">
                    <Button
                        onPress={handleSave}
                        disabled={loading}
                        className="bg-blue-600 rounded-lg p-4"
                    >
                        <Text className="text-white text-center font-semibold text-base">
                            {loading ? 'Guardando...' : 'Guardar Medición'}
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
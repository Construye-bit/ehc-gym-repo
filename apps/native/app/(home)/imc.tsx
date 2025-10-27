import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function IMCPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Datos quemados para visualización
    const [metrics, setMetrics] = useState({
        weight: '75',
        height: '175',
        bodyFat: '18',
        notes: 'Medición realizada en ayunas',
    });

    const [bmi, setBmi] = useState<number | null>(null);
    const [bmiCategory, setBmiCategory] = useState<string>('');
    const [bmiColor, setBmiColor] = useState<string>('');

    // Calcular IMC automáticamente
    useEffect(() => {
        calculateBMI();
    }, [metrics.weight, metrics.height]);

    const calculateBMI = () => {
        const weight = parseFloat(metrics.weight);
        const heightInMeters = parseFloat(metrics.height) / 100;

        if (weight > 0 && heightInMeters > 0) {
            const calculatedBMI = weight / (heightInMeters * heightInMeters);
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

    // Handlers para futuras implementaciones
    const handleSave = async () => {
        if (!bmi) {
            Alert.alert('Error', 'Por favor ingresa valores válidos de peso y altura');
            return;
        }

        setLoading(true);
        try {
            // TODO: Implementar llamada a la API
            const dataToSave = {
                weight_kg: parseFloat(metrics.weight),
                height_cm: parseFloat(metrics.height),
                bmi: bmi,
                body_fat_pct: metrics.bodyFat ? parseFloat(metrics.bodyFat) : null,
                notes: metrics.notes,
                measured_at: Date.now(),
            };
            
            console.log('Guardar métricas de salud:', dataToSave);
            
            // Simulación de guardado
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            Alert.alert(
                'Éxito',
                'Métricas de salud guardadas correctamente',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudieron guardar las métricas');
            console.error('Error al guardar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleMetricChange = (field: string, value: string) => {
        // Solo permitir números y un punto decimal
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        setMetrics(prev => ({ ...prev, [field]: sanitizedValue }));
    };

    const handleViewHistory = () => {
        // TODO: Implementar navegación al historial
        console.log('Ver historial de mediciones');
        Alert.alert('Próximamente', 'Esta función estará disponible pronto');
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
                                value={metrics.weight}
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
                                value={metrics.height}
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
                                value={metrics.bodyFat}
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
                            value={metrics.notes}
                            onChangeText={(value) => setMetrics(prev => ({ ...prev, notes: value }))}
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
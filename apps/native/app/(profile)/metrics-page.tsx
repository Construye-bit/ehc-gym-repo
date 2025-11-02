import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import api from '@/api';
import type { Id } from '../../../../packages/backend/convex/_generated/dataModel';

type HealthMetric = {
    _id: Id<"client_health_metrics">;
    client_id: Id<"clients">;
    measured_at: number;
    weight_kg?: number;
    height_cm?: number;
    bmi?: number;
    body_fat_pct?: number;
    notes?: string;
    created_by_user_id: Id<"users">;
    created_at: number;
    updated_at: number;
};

type BMICategory = {
    label: string;
    color: string;
    bgColor: string;
};

export default function HealthMetricsHistoryPage() {
    const router = useRouter();

    // ==========================================
    // 1. ESTADOS PARA PAGINACIÓN
    // ==========================================
    const [cursor, setCursor] = useState<number>(0); // timestamp para paginación
    const [allMetrics, setAllMetrics] = useState<HealthMetric[]>([]); // todas las métricas cargadas
    const [hasMore, setHasMore] = useState(true); // indica si hay más páginas
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // ==========================================
    // 2. QUERIES Y MUTATIONS
    // ==========================================
    // Query: profiles/client/queries:listHealthMetrics
    // Args: { payload: { from?, to?, cursor?, limit? } }
    // Retorna: { status: "success", value: { items: HealthMetric[], nextCursor: number|null } }
    const metricsData = useQuery(
        api.health_metrics.queries.listHealthMetrics,
        {
            payload: {
                cursor: cursor,
                limit: 10, // cargar 10 métricas por página
            }
        }
    );

    // Mutation: profiles/client/mutations:deleteHealthMetric
    // Args: { payload: { metric_id: Id<"client_health_metrics"> } }
    const deleteMetricMutation = useMutation(api.health_metrics.mutuations.deleteHealthMetric);

    // ==========================================
    // 3. EFECTO - Actualizar lista cuando lleguen datos
    // ==========================================
    useEffect(() => {
        if (metricsData?.value) {
            const { items, nextCursor } = metricsData.value;

            // Si es la primera carga (cursor === 0), reemplazar toda la lista
            if (cursor === 0) {
                setAllMetrics(items || []);
            } else {
                // Si es carga de más páginas, agregar al final
                setAllMetrics(prev => [...prev, ...(items || [])]);
            }

            // Verificar si hay más páginas
            setHasMore(nextCursor !== null);
            setIsLoadingMore(false);
        }
    }, [metricsData]);

    // ==========================================
    // 4. HELPERS - Categorización y formato
    // ==========================================
    const getBMICategory = (bmi?: number): BMICategory => {
        if (!bmi) {
            return {
                label: 'N/A',
                color: 'text-gray-700',
                bgColor: 'bg-gray-100',
            };
        }

        if (bmi < 18.5) {
            return {
                label: 'Bajo Peso',
                color: 'text-yellow-700',
                bgColor: 'bg-yellow-100',
            };
        } else if (bmi >= 18.5 && bmi < 25) {
            return {
                label: 'Normal',
                color: 'text-green-700',
                bgColor: 'bg-green-100',
            };
        } else if (bmi >= 25 && bmi < 30) {
            return {
                label: 'Sobrepeso',
                color: 'text-orange-700',
                bgColor: 'bg-orange-100',
            };
        } else {
            return {
                label: 'Obesidad',
                color: 'text-red-700',
                bgColor: 'bg-red-100',
            };
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Calcular cambio respecto a la medición anterior
    const getWeightChange = (currentWeight?: number, index?: number): number | null => {
        if (!currentWeight || index === undefined || index >= allMetrics.length - 1) return null;
        const previousWeight = allMetrics[index + 1].weight_kg;
        if (!previousWeight) return null;
        return currentWeight - previousWeight;
    };

    // ==========================================
    // 5. HANDLERS
    // ==========================================
    const handleLoadMore = () => {
        if (!hasMore || isLoadingMore || !metricsData?.value?.nextCursor) return;

        setIsLoadingMore(true);
        setCursor(metricsData.value.nextCursor);
    };

    const handleRefresh = () => {
        // Reiniciar paginación
        setCursor(0);
        setAllMetrics([]);
        setHasMore(true);
    };

    const handleAddNew = () => {
        // Navegar a la página de agregar métrica (IMC)
        router.push('/(profile)/imc'); // Ajustar la ruta según tu estructura
    };

    const handleViewDetail = (metric: HealthMetric) => {
        // Mostrar detalle completo de la métrica
        Alert.alert(
            `Medición del ${formatDateTime(metric.measured_at)}`,
            `Peso: ${metric.weight_kg ? `${metric.weight_kg} kg` : 'N/A'}\n` +
            `Altura: ${metric.height_cm ? `${metric.height_cm} cm` : 'N/A'}\n` +
            `IMC: ${metric.bmi ? metric.bmi.toFixed(1) : 'N/A'}\n` +
            `Grasa Corporal: ${metric.body_fat_pct ? `${metric.body_fat_pct}%` : 'N/A'}\n` +
            `${metric.notes ? `\nNotas: ${metric.notes}` : ''}`
        );
    };

    const handleDeleteMetric = async (metricId: Id<"client_health_metrics">) => {
        Alert.alert(
            'Eliminar Medición',
            '¿Estás seguro de que deseas eliminar esta medición?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // ==========================================
                            // MUTATION - Eliminar métrica
                            // ==========================================
                            // Path: profiles/client/mutations:deleteHealthMetric
                            // Body: { payload: { metric_id: "..." } }
                            await deleteMetricMutation({
                                payload: {
                                    metric_id: metricId,
                                }
                            });

                            // Actualizar lista local
                            setAllMetrics(prev => prev.filter(m => m._id !== metricId));

                            Alert.alert('Éxito', 'Medición eliminada correctamente');
                        } catch (error: any) {
                            console.error('Error al eliminar métrica:', error);
                            Alert.alert(
                                'Error',
                                error?.message || 'No se pudo eliminar la medición'
                            );
                        }
                    }
                }
            ]
        );
    };

    // ==========================================
    // 6. ESTADOS DE CARGA Y ERROR
    // ==========================================
    if (metricsData === undefined && cursor === 0) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">Cargando historial...</Text>
            </View>
        );
    }

    // Manejo de errores
    if (metricsData?.status === 'error') {
        return (
            <View className="flex-1 bg-white items-center justify-center p-6">
                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                <Text className="mt-4 text-gray-900 font-semibold text-lg">
                    Error al cargar métricas
                </Text>
                <Text className="mt-2 text-gray-600 text-center">
                    Intenta nuevamente o contacta con soporte
                </Text>
                <Button
                    onPress={handleRefresh}
                    className="mt-6 bg-blue-600 rounded-lg px-6 py-3"
                >
                    <Text className="text-white font-semibold">Reintentar</Text>
                </Button>
            </View>
        );
    }

    // ==========================================
    // 7. RENDER
    // ==========================================
    return (

        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-8">
                {/* Header with Back Button */}
                <View className="flex-row items-center mb-6 py-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text variant="h2" className="text-2xl font-bold text-gray-900 flex-1">
                        Historial de Métricas
                    </Text>
                </View>

                {/* Content */}
                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl
                            refreshing={cursor === 0 && metricsData === undefined}
                            onRefresh={handleRefresh}
                            colors={['#3b82f6']}
                        />
                    }
                >
                    <View className="px-6 py-4">
                        {/* Summary Card - Última medición */}
                        {allMetrics.length > 0 && allMetrics[0].weight_kg && allMetrics[0].bmi && (
                            <View className="bg-blue-50 rounded-xl p-5 mb-6 border-2 border-blue-200">
                                <Text className="text-gray-600 text-sm font-medium mb-3">
                                    Última Medición
                                </Text>
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-3xl font-bold text-blue-600">
                                            {allMetrics[0].weight_kg} kg
                                        </Text>
                                        <Text className="text-gray-600 text-sm mt-1">
                                            {formatDate(allMetrics[0].measured_at)}
                                        </Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-2xl font-bold text-gray-900">
                                            {allMetrics[0].bmi.toFixed(1)}
                                        </Text>
                                        <View className={`px-3 py-1 rounded-full mt-1 ${getBMICategory(allMetrics[0].bmi).bgColor
                                            }`}>
                                            <Text className={`text-xs font-semibold ${getBMICategory(allMetrics[0].bmi).color
                                                }`}>
                                                {getBMICategory(allMetrics[0].bmi).label}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Empty State */}
                        {allMetrics.length === 0 && metricsData?.value && (
                            <View className="items-center justify-center py-12">
                                <Ionicons name="bar-chart-outline" size={64} color="#d1d5db" />
                                <Text className="text-gray-600 text-lg font-medium mt-4">
                                    No hay métricas registradas
                                </Text>
                                <Text className="text-gray-500 text-sm mt-2 text-center px-8">
                                    Comienza a registrar tus métricas de salud para ver tu progreso
                                </Text>
                                <Button
                                    onPress={handleAddNew}
                                    className="mt-6 bg-blue-600 rounded-lg px-6 py-3"
                                >
                                    <Text className="text-white font-semibold">
                                        Agregar Primera Medición
                                    </Text>
                                </Button>
                            </View>
                        )}

                        {/* Metrics List */}
                        {allMetrics.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-lg font-semibold text-gray-900 mb-3">
                                    Historial Completo ({allMetrics.length})
                                </Text>

                                {allMetrics.map((metric, index) => {
                                    const category = getBMICategory(metric.bmi);
                                    const weightChange = getWeightChange(metric.weight_kg, index);

                                    return (
                                        <TouchableOpacity
                                            key={metric._id}
                                            onPress={() => handleViewDetail(metric)}
                                            className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200"
                                        >
                                            {/* Header Row */}
                                            <View className="flex-row items-center justify-between mb-3">
                                                <View className="flex-row items-center">
                                                    <Ionicons
                                                        name="calendar-outline"
                                                        size={16}
                                                        color="#6b7280"
                                                    />
                                                    <Text className="text-gray-700 text-sm ml-2">
                                                        {formatDate(metric.measured_at)}
                                                    </Text>
                                                </View>
                                                {metric.bmi && (
                                                    <View className={`px-3 py-1 rounded-full ${category.bgColor}`}>
                                                        <Text className={`text-xs font-semibold ${category.color}`}>
                                                            IMC {metric.bmi.toFixed(1)}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Metrics Grid */}
                                            <View className="flex-row items-center justify-between mb-2">
                                                {/* Weight */}
                                                {metric.weight_kg && (
                                                    <View className="flex-1">
                                                        <Text className="text-gray-500 text-xs mb-1">Peso</Text>
                                                        <View className="flex-row items-center">
                                                            <Text className="text-gray-900 font-semibold text-lg">
                                                                {metric.weight_kg} kg
                                                            </Text>
                                                            {weightChange !== null && (
                                                                <View className={`ml-2 flex-row items-center ${weightChange > 0 ? 'text-red-600' : 'text-green-600'
                                                                    }`}>
                                                                    <Ionicons
                                                                        name={weightChange > 0 ? 'arrow-up' : 'arrow-down'}
                                                                        size={14}
                                                                        color={weightChange > 0 ? '#dc2626' : '#16a34a'}
                                                                    />
                                                                    <Text className={`text-xs font-medium ${weightChange > 0 ? 'text-red-600' : 'text-green-600'
                                                                        }`}>
                                                                        {Math.abs(weightChange).toFixed(1)} kg
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>
                                                )}

                                                {/* Height */}
                                                {metric.height_cm && (
                                                    <View className="flex-1">
                                                        <Text className="text-gray-500 text-xs mb-1">Altura</Text>
                                                        <Text className="text-gray-900 font-semibold text-lg">
                                                            {metric.height_cm} cm
                                                        </Text>
                                                    </View>
                                                )}

                                                {/* Body Fat */}
                                                {metric.body_fat_pct && (
                                                    <View className="flex-1">
                                                        <Text className="text-gray-500 text-xs mb-1">Grasa</Text>
                                                        <Text className="text-gray-900 font-semibold text-lg">
                                                            {metric.body_fat_pct}%
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Notes */}
                                            {metric.notes && (
                                                <View className="mt-3 pt-3 border-t border-gray-200">
                                                    <Text className="text-gray-600 text-sm">
                                                        {metric.notes}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* Action Icons */}
                                            <View className="flex-row items-center justify-end mt-3 pt-3 border-t border-gray-200">
                                                <TouchableOpacity
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetail(metric);
                                                    }}
                                                    className="mr-4"
                                                >
                                                    <Ionicons name="eye-outline" size={20} color="#3b82f6" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteMetric(metric._id);
                                                    }}
                                                >
                                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

                        {/* Load More Button */}
                        {hasMore && allMetrics.length > 0 && (
                            <TouchableOpacity
                                onPress={handleLoadMore}
                                disabled={isLoadingMore}
                                className="bg-gray-100 rounded-lg p-4 mb-4 flex-row items-center justify-center"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <ActivityIndicator size="small" color="#3b82f6" />
                                        <Text className="text-gray-700 ml-2 font-medium">
                                            Cargando más...
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="chevron-down" size={20} color="#4b5563" />
                                        <Text className="text-gray-700 ml-2 font-medium">
                                            Cargar más mediciones
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* End of List Indicator */}
                        {!hasMore && allMetrics.length > 0 && (
                            <View className="items-center py-6">
                                <View className="bg-gray-100 rounded-full px-4 py-2">
                                    <Text className="text-gray-500 text-sm">
                                        Has visto todas las mediciones
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Info Card */}
                        {allMetrics.length > 0 && (
                            <View className="bg-blue-50 rounded-lg p-4 mb-6 flex-row border border-blue-200">
                                <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
                                <View className="flex-1 ml-3">
                                    <Text className="text-sm text-blue-900 leading-5">
                                        Registra tus métricas regularmente para obtener un mejor seguimiento
                                        de tu progreso. Se recomienda hacer mediciones semanales.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </ScrollView>
    );
}
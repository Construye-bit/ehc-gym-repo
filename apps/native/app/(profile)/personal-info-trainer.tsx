import { View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import api from '@/api';

type DocumentType = 'CC' | 'TI' | 'CE' | 'PASSPORT';

export default function TrainerPersonalInfoPage() {
    const router = useRouter();
    
    // ==========================================
    // 1. QUERIES - Obtener datos del perfil
    // ==========================================
    // Query: profiles/trainer/queries:getMyTrainerProfile
    // Retorna: { trainer, person }
    const profileData = useQuery(api.profiles.trainer.queries.getMyTrainerProfile);
    
    // ==========================================
    // 2. MUTATIONS - Para actualizar teléfono
    // ==========================================
    // Mutation: profiles/trainer/mutations:updateMyPhone
    // Args: { payload: { phone: string } }
    const updatePhone = useMutation(api.profiles.trainer.mutations.updateMyPhoneTrainer);
    
    // ==========================================
    // 3. ESTADOS LOCALES EDITABLES
    // ==========================================
    const [phone, setPhone] = useState('');
    const [originalPhone, setOriginalPhone] = useState('');
    const [loading, setLoading] = useState(false);

    // ==========================================
    // 4. EFECTO - Inicializar datos cuando lleguen
    // ==========================================
    useEffect(() => {
        if (profileData?.person?.phone) {
            const initialPhone = profileData.person.phone;
            setPhone(initialPhone);
            setOriginalPhone(initialPhone);
        }
    }, [profileData]);

    // ==========================================
    // 5. LABELS Y HELPERS
    // ==========================================
    const documentTypeLabels: Record<DocumentType, string> = {
        CC: 'Cédula de Ciudadanía',
        TI: 'Tarjeta de Identidad',
        CE: 'Cédula de Extranjería',
        PASSPORT: 'Pasaporte',
    };

    const statusLabels = {
        ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-700' },
        INACTIVE: { label: 'Inactivo', color: 'bg-gray-100 text-gray-700' },
        ON_VACATION: { label: 'En Vacaciones', color: 'bg-blue-100 text-blue-700' },
    };

    const formatDate = (dateString: string) => {
        // dateString viene como "YYYY-MM-DD"
        const [year, month, day] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('es-CO', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // ==========================================
    // 6. HANDLERS
    // ==========================================
    const handleSave = async () => {
        if (phone === originalPhone) {
            Alert.alert('Información', 'No hay cambios para guardar');
            return;
        }

        if (!phone || phone.trim() === '') {
            Alert.alert('Error', 'El teléfono no puede estar vacío');
            return;
        }

        setLoading(true);
        try {
            // ==========================================
            // MUTATION - Actualizar teléfono
            // ==========================================
            // Path: profiles/trainer/mutations:updateMyPhone
            // Body: { path: "...", args: { payload: { phone: "..." } } }
            await updatePhone({
                payload: {
                    phone: phone.trim(),
                }
            });
            
            setOriginalPhone(phone);
            
            Alert.alert(
                'Éxito',
                'Teléfono actualizado correctamente',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error('Error al guardar:', error);
            Alert.alert(
                'Error', 
                error?.message || 'No se pudo actualizar el teléfono'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const hasChanges = phone !== originalPhone;

    // ==========================================
    // 7. ESTADOS DE CARGA Y ERROR
    // ==========================================
    if (profileData === undefined) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">Cargando perfil...</Text>
            </View>
        );
    }

    if (!profileData || !profileData.person || !profileData.trainer) {
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

    // ==========================================
    // 8. EXTRAER DATOS DEL PERFIL
    // ==========================================
    const { person, trainer } = profileData;

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-8">
                {/* Header with Back Button */}
                <View className="flex-row items-center mb-6 py-4">
                    <TouchableOpacity onPress={handleCancel} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text variant="h2" className="text-2xl font-bold text-gray-900 flex-1">
                        Datos Personales
                    </Text>
                </View>

                {/* Status Badge */}
                <View className="mb-6">
                    <View className={`self-start px-4 py-2 rounded-full ${
                        statusLabels[trainer.status as keyof typeof statusLabels]?.color || 'bg-gray-100'
                    }`}>
                        <Text className="font-semibold">
                            {statusLabels[trainer.status as keyof typeof statusLabels]?.label || 'Desconocido'}
                        </Text>
                    </View>
                </View>

                {/* Read-Only Fields */}
                <View className="mb-6">
                    {/* Employee Code */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Código de Empleado
                        </Text>
                        <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <Text className="text-gray-600">
                                {trainer.employee_code}
                            </Text>
                        </View>
                    </View>

                    {/* Full Name */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Nombre Completo
                        </Text>
                        <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <Text className="text-gray-600">
                                {person.name} {person.last_name}
                            </Text>
                        </View>
                    </View>

                    {/* Document Type and Number */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Documento de Identidad
                        </Text>
                        <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <Text className="text-gray-600">
                                {documentTypeLabels[person.document_type]} - {person.document_number}
                            </Text>
                        </View>
                    </View>

                    {/* Birth Date */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Fecha de Nacimiento
                        </Text>
                        <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <Text className="text-gray-600">
                                {formatDate(person.born_date)}
                            </Text>
                        </View>
                    </View>

                    {/* Email */}
                    {/* NOTA: El email no está en person ni trainer según el README */}
                    {/* TODO: Agregar user.email si está disponible */}

                    {/* Branch */}
                    {/* NOTA: branch_id es un Id, necesitamos resolver el nombre */}
                    {/* TODO: Agregar query para obtener nombre de la sucursal */}
                    {trainer.branch_id && (
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Sede Asignada
                            </Text>
                            <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                                <Text className="text-gray-600">
                                    {/* TODO: Resolver branch_id a nombre */}
                                    ID: {trainer.branch_id}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Created At (como fecha de contratación) */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Fecha de Contratación
                        </Text>
                        <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <Text className="text-gray-600">
                                {new Date(trainer.created_at).toLocaleDateString('es-CO', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Editable Field - Phone */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Información Editable
                    </Text>
                    
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Teléfono
                        </Text>
                        <View className="relative">
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+57 310 456 7890"
                                keyboardType="phone-pad"
                                className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-blue-300 pr-12"
                                placeholderTextColor="#9ca3af"
                            />
                            <View className="absolute right-4 top-4">
                                <Ionicons name="call-outline" size={20} color="#3b82f6" />
                            </View>
                        </View>
                        <Text className="text-xs text-gray-500 mt-1">
                            Este es el único campo que puedes modificar
                        </Text>
                    </View>
                </View>

                {/* Info Card */}
                <View className="bg-blue-50 rounded-lg p-4 mb-6 flex-row border border-blue-200">
                    <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
                    <View className="flex-1 ml-3">
                        <Text className="text-sm text-blue-900 leading-5">
                            Para modificar otros datos personales, contacta con el departamento de recursos humanos o tu administrador de sede.
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="gap-3 mb-8">
                    <Button
                        onPress={handleSave}
                        disabled={loading || !hasChanges}
                        className={`rounded-lg p-4 ${hasChanges ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                        <Text className={`text-center font-semibold text-base ${hasChanges ? 'text-white' : 'text-gray-500'}`}>
                            {loading ? 'Guardando...' : hasChanges ? 'Guardar Cambios' : 'Sin Cambios'}
                        </Text>
                    </Button>
                    
                    <TouchableOpacity
                        onPress={handleCancel}
                        disabled={loading}
                        className="bg-gray-100 rounded-lg p-4"
                    >
                        <Text className="text-gray-700 text-center font-semibold text-base">
                            Volver
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
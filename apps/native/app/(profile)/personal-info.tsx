import { View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import api from '@/api';

type DocumentType = 'CC' | 'TI' | 'CE' | 'PASSPORT';

export default function PersonalInfoPage() {
    const router = useRouter();
    
    // ==========================================
    // 1. QUERIES - Obtener datos del perfil
    // ==========================================
    const profileData = useQuery(api.profiles.client.queries.getMyClientProfile);
    
    // ==========================================
    // 2. MUTATIONS - Para actualizar perfil
    // ==========================================
    const updateMyProfile = useMutation(api.profiles.client.mutations.updateMyProfile);
    
    // ==========================================
    // 3. ESTADOS LOCALES EDITABLES
    // ==========================================
    const [phone, setPhone] = useState('');
    const [emergencyContact, setEmergencyContact] = useState({
        name: '',
        phone: '',
        relationship: '',
    });
    const [originalPhone, setOriginalPhone] = useState('');
    const [originalEmergencyContact, setOriginalEmergencyContact] = useState({
        name: '',
        phone: '',
        relationship: '',
    });
    const [loading, setLoading] = useState(false);

    // ==========================================
    // 4. EFECTO - Inicializar datos cuando lleguen
    // ==========================================
    useEffect(() => {
        if (profileData) {
            // Inicializar teléfono
            const initialPhone = profileData.person?.phone || '';
            setPhone(initialPhone);
            setOriginalPhone(initialPhone);
            
            // Inicializar contacto de emergencia
            const initialEmergency = {
                name: profileData.emergencyContact?.name || '',
                phone: profileData.emergencyContact?.phone || '',
                relationship: profileData.emergencyContact?.relationship || '',
            };
            setEmergencyContact(initialEmergency);
            setOriginalEmergencyContact(initialEmergency);
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
        ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-700', icon: 'checkmark-circle' },
        INACTIVE: { label: 'Inactivo', color: 'bg-gray-100 text-gray-700', icon: 'close-circle' },
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
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
        // Limpiamos datos antes de comparar
        const cleanPhone = phone.trim();
        const cleanEmergencyContact = {
            name: emergencyContact.name.trim(),
            phone: emergencyContact.phone.trim(),
            relationship: emergencyContact.relationship.trim(),
        };

        const phoneChanged = cleanPhone !== originalPhone;
        const emergencyChanged = 
            cleanEmergencyContact.name !== originalEmergencyContact.name ||
            cleanEmergencyContact.phone !== originalEmergencyContact.phone ||
            cleanEmergencyContact.relationship !== originalEmergencyContact.relationship;

        if (!phoneChanged && !emergencyChanged) {
            Alert.alert('Información', 'No hay cambios para guardar');
            return;
        }

        // Validaciones
        if (phoneChanged && !cleanPhone) {
            Alert.alert('Error', 'El teléfono no puede estar vacío');
            return;
        }

        // Validación de contacto de emergencia
        if (emergencyChanged) {
            const { name, phone, relationship } = cleanEmergencyContact;
            const allEmpty = !name && !phone && !relationship;
            const allFull = name && phone && relationship;

            if (!allEmpty && !allFull) {
                Alert.alert('Error', 'Completa todos los campos del contacto de emergencia o déjalos todos vacíos para eliminarlo.');
                return;
            }
        }

        setLoading(true);
        try {
            type Payload = Parameters<typeof updateMyProfile>[0]["payload"];
            const payload: Payload = {};

            if (phoneChanged) {
                payload.phone = cleanPhone;
            }

            if (emergencyChanged) {
                payload.emergencyContact = cleanEmergencyContact;
            }
            
            await updateMyProfile({ payload });
            
            setOriginalPhone(cleanPhone);
            setOriginalEmergencyContact(cleanEmergencyContact);
            
            Alert.alert(
                'Éxito',
                'Información personal actualizada correctamente',
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            console.error('Error al guardar:', error);
            Alert.alert(
                'Error', 
                error?.message || 'No se pudo actualizar la información'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const hasChanges = 
        phone.trim() !== originalPhone ||
        emergencyContact.name.trim() !== originalEmergencyContact.name ||
        emergencyContact.phone.trim() !== originalEmergencyContact.phone ||
        emergencyContact.relationship.trim() !== originalEmergencyContact.relationship;

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

    if (!profileData || !profileData.person || !profileData.client) {
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
    const { user, person, client } = profileData;

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-8">
                {/* Header with Back Button */}
                <View className="flex-row items-center mb-6 py-4">
                    <TouchableOpacity onPress={handleCancel} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text variant="h2" className="text-2xl font-bold text-gray-900 flex-1">
                        Información Personal
                    </Text>
                </View>

                {/* Status Badges */}
                {client && (
                    <View className="flex-row gap-2 mb-6">
                        <View className={`px-4 py-2 rounded-full flex-row items-center ${
                            statusLabels[client.status as keyof typeof statusLabels]?.color || 'bg-gray-100'
                        }`}>
                            <Ionicons 
                                name={statusLabels[client.status as keyof typeof statusLabels]?.icon as any || 'help-circle'} 
                                size={16} 
                                color={client.status === 'ACTIVE' ? '#15803d' : '#374151'}
                            />
                            <Text className="font-semibold ml-1">
                                {statusLabels[client.status as keyof typeof statusLabels]?.label || 'Desconocido'}
                            </Text>
                        </View>
                        
                        <View className={`px-4 py-2 rounded-full flex-row items-center ${
                            client.is_payment_active 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-red-100 text-red-700'
                        }`}>
                            <Ionicons 
                                name={client.is_payment_active ? 'card' : 'card-outline'} 
                                size={16} 
                                color={client.is_payment_active ? '#1d4ed8' : '#dc2626'}
                            />
                            <Text className={`font-semibold ml-1 ${
                                client.is_payment_active ? 'text-blue-700' : 'text-red-700'
                            }`}>
                                {client.is_payment_active ? 'Pago al Día' : 'Pago Pendiente'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Read-Only Section - Personal Data */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Datos Personales
                    </Text>

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
                                {person.born_date}
                            </Text>
                        </View>
                    </View>

                    {/* Email */}
                    {user && (
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Email de Contacto
                            </Text>
                            <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                                <Text className="text-gray-600">
                                    {user.email}
                                </Text>
                            </View>
                        </View>
                    )}
                    
                    {/* Join Date */}
                    {client && (
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Miembro Desde
                            </Text>
                            <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                                <Text className="text-gray-600">
                                    {formatDate(client.join_date)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Editable Section - Contact Info */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Información de Contacto
                    </Text>
                    
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Teléfono Personal
                        </Text>
                        <View className="relative">
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+57 300 123 4567"
                                keyboardType="phone-pad"
                                className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-blue-300 pr-12"
                                placeholderTextColor="#9ca3af"
                            />
                            <View className="absolute right-4 top-4">
                                <Ionicons name="call-outline" size={20} color="#3b82f6" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Editable Section - Emergency Contact */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="alert-circle-outline" size={20} color="#dc2626" />
                        <Text className="text-lg font-semibold text-gray-900 ml-2">
                            Contacto de Emergencia
                        </Text>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Nombre Completo
                        </Text>
                        <TextInput
                            value={emergencyContact.name}
                            onChangeText={(value) => setEmergencyContact(prev => ({ ...prev, name: value }))}
                            placeholder="Nombre del contacto de emergencia"
                            className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-blue-300"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Teléfono
                        </Text>
                        <TextInput
                            value={emergencyContact.phone}
                            onChangeText={(value) => setEmergencyContact(prev => ({ ...prev, phone: value }))}
                            placeholder="+57 310 987 6543"
                            keyboardType="phone-pad"
                            className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-blue-300"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Parentesco
                        </Text>
                        <TextInput
                            value={emergencyContact.relationship}
                            onChangeText={(value) => setEmergencyContact(prev => ({ ...prev, relationship: value }))}
                            placeholder="Ej: Madre, Padre, Hermano/a, Esposo/a"
                            className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-blue-300"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                </View>

                {/* Info Card */}
                <View className="bg-blue-50 rounded-lg p-4 mb-6 flex-row border border-blue-200">
                    <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
                    <View className="flex-1 ml-3">
                        <Text className="text-sm text-blue-900 leading-5">
                            Los datos personales como nombre, documento y fecha de nacimiento solo pueden ser modificados por el personal administrativo del gimnasio.
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="gap-3 mb-8">
                    <Button
                        onPress={handleSave}
                        disabled={!hasChanges || loading}
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
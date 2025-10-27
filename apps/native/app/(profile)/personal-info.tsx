import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type DocumentType = 'CC' | 'TI' | 'CE' | 'PASSPORT';

export default function PersonalInfoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Datos quemados para visualización
    const [personalData, setPersonalData] = useState({
        // Campos de solo lectura (críticos)
        name: 'Juan',
        lastName: 'Pérez',
        bornDate: '1990-05-15',
        documentType: 'CC' as DocumentType,
        documentNumber: '1234567890',
        email: 'juan.perez@example.com',
        
        // Campos editables (no críticos)
        phone: '+57 300 123 4567',
        
        // Información adicional del cliente
        status: 'ACTIVE',
        isPaymentActive: true,
        joinDate: '2024-01-15',
    });

    const [originalPhone, setOriginalPhone] = useState(personalData.phone);

    // Emergency Contact (editable)
    const [emergencyContact, setEmergencyContact] = useState({
        name: 'María Pérez',
        phone: '+57 310 987 6543',
        relationship: 'Madre',
    });

    const [originalEmergencyContact] = useState({ ...emergencyContact });

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Handlers para futuras implementaciones
    const handleSave = async () => {
        const phoneChanged = personalData.phone !== originalPhone;
        const emergencyChanged = 
            emergencyContact.name !== originalEmergencyContact.name ||
            emergencyContact.phone !== originalEmergencyContact.phone ||
            emergencyContact.relationship !== originalEmergencyContact.relationship;

        if (!phoneChanged && !emergencyChanged) {
            Alert.alert('Información', 'No hay cambios para guardar');
            return;
        }

        // Validaciones
        if (!personalData.phone || personalData.phone.trim() === '') {
            Alert.alert('Error', 'El teléfono no puede estar vacío');
            return;
        }

        if (!emergencyContact.name || emergencyContact.name.trim() === '') {
            Alert.alert('Error', 'El nombre del contacto de emergencia no puede estar vacío');
            return;
        }

        if (!emergencyContact.phone || emergencyContact.phone.trim() === '') {
            Alert.alert('Error', 'El teléfono del contacto de emergencia no puede estar vacío');
            return;
        }

        setLoading(true);
        try {
            // TODO: Implementar llamada a la API
            const dataToSave = {
                phone: personalData.phone,
                emergency_contact: emergencyContact,
                updated_at: Date.now(),
            };
            
            console.log('Actualizar información personal del cliente:', dataToSave);
            
            // Simulación de guardado
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setOriginalPhone(personalData.phone);
            
            Alert.alert(
                'Éxito',
                'Información personal actualizada correctamente',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar la información');
            console.error('Error al guardar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handlePhoneChange = (value: string) => {
        setPersonalData(prev => ({ ...prev, phone: value }));
    };

    const handleEmergencyContactChange = (field: string, value: string) => {
        setEmergencyContact(prev => ({ ...prev, [field]: value }));
    };

    const hasChanges = 
        personalData.phone !== originalPhone ||
        emergencyContact.name !== originalEmergencyContact.name ||
        emergencyContact.phone !== originalEmergencyContact.phone ||
        emergencyContact.relationship !== originalEmergencyContact.relationship;

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
                <View className="flex-row gap-2 mb-6">
                    <View className={`px-4 py-2 rounded-full flex-row items-center ${statusLabels[personalData.status as keyof typeof statusLabels].color}`}>
                        <Ionicons 
                            name={statusLabels[personalData.status as keyof typeof statusLabels].icon as any} 
                            size={16} 
                            color={personalData.status === 'ACTIVE' ? '#15803d' : '#374151'}
                        />
                        <Text className="font-semibold ml-1">
                            {statusLabels[personalData.status as keyof typeof statusLabels].label}
                        </Text>
                    </View>
                    
                    <View className={`px-4 py-2 rounded-full flex-row items-center ${
                        personalData.isPaymentActive 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        <Ionicons 
                            name={personalData.isPaymentActive ? 'card' : 'card-outline'} 
                            size={16} 
                            color={personalData.isPaymentActive ? '#1d4ed8' : '#dc2626'}
                        />
                        <Text className={`font-semibold ml-1 ${
                            personalData.isPaymentActive ? 'text-blue-700' : 'text-red-700'
                        }`}>
                            {personalData.isPaymentActive ? 'Pago al Día' : 'Pago Pendiente'}
                        </Text>
                    </View>
                </View>

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
                                {personalData.name} {personalData.lastName}
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
                                {documentTypeLabels[personalData.documentType]} - {personalData.documentNumber}
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
                                {formatDate(personalData.bornDate)}
                            </Text>
                        </View>
                    </View>

                    {/* Email */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Correo Electrónico
                        </Text>
                        <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <Text className="text-gray-600">
                                {personalData.email}
                            </Text>
                        </View>
                    </View>

                    {/* Join Date */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Miembro Desde
                        </Text>
                        <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <Text className="text-gray-600">
                                {formatDate(personalData.joinDate)}
                            </Text>
                        </View>
                    </View>
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
                                value={personalData.phone}
                                onChangeText={handlePhoneChange}
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

                    {/* Emergency Contact Name */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Nombre Completo
                        </Text>
                        <TextInput
                            value={emergencyContact.name}
                            onChangeText={(value) => handleEmergencyContactChange('name', value)}
                            placeholder="Nombre del contacto de emergencia"
                            className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-blue-300"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Emergency Contact Phone */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Teléfono
                        </Text>
                        <TextInput
                            value={emergencyContact.phone}
                            onChangeText={(value) => handleEmergencyContactChange('phone', value)}
                            placeholder="+57 310 987 6543"
                            keyboardType="phone-pad"
                            className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-blue-300"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Emergency Contact Relationship */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Parentesco
                        </Text>
                        <TextInput
                            value={emergencyContact.relationship}
                            onChangeText={(value) => handleEmergencyContactChange('relationship', value)}
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
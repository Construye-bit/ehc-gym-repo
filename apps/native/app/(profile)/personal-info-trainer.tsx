import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type DocumentType = 'CC' | 'TI' | 'CE' | 'PASSPORT';

export default function TrainerPersonalInfoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Datos quemados para visualización (solo lectura excepto teléfono)
    const [personalData, setPersonalData] = useState({
        name: 'Carlos',
        lastName: 'Rodríguez',
        bornDate: '1988-03-20',
        documentType: 'CC' as DocumentType,
        documentNumber: '1234567890',
        phone: '+57 310 456 7890',
        email: 'carlos.rodriguez@gym.com',
        employeeCode: 'TRN-2024-001',
        hireDate: '2024-01-15',
        branch: 'Sede Norte',
        status: 'ACTIVE',
    });

    const [originalPhone, setOriginalPhone] = useState(personalData.phone);

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

    // Handlers para futuras implementaciones
    const handleSave = async () => {
        if (personalData.phone === originalPhone) {
            Alert.alert('Información', 'No hay cambios para guardar');
            return;
        }

        if (!personalData.phone || personalData.phone.trim() === '') {
            Alert.alert('Error', 'El teléfono no puede estar vacío');
            return;
        }

        setLoading(true);
        try {
            // TODO: Implementar llamada a la API para actualizar solo el teléfono
            const dataToSave = {
                phone: personalData.phone,
                updated_at: Date.now(),
            };
            
            console.log('Actualizar teléfono del entrenador:', dataToSave);
            
            // Simulación de guardado
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setOriginalPhone(personalData.phone);
            
            Alert.alert(
                'Éxito',
                'Teléfono actualizado correctamente',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el teléfono');
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const hasChanges = personalData.phone !== originalPhone;

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
                    <View className={`self-start px-4 py-2 rounded-full ${statusLabels[personalData.status as keyof typeof statusLabels].color}`}>
                        <Text className="font-semibold">
                            {statusLabels[personalData.status as keyof typeof statusLabels].label}
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
                                {personalData.employeeCode}
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

                    {/* Branch */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Sede Asignada
                        </Text>
                        <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <Text className="text-gray-600">
                                {personalData.branch}
                            </Text>
                        </View>
                    </View>

                    {/* Hire Date */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Fecha de Contratación
                        </Text>
                        <View className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <Text className="text-gray-600">
                                {formatDate(personalData.hireDate)}
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
                                value={personalData.phone}
                                onChangeText={handlePhoneChange}
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
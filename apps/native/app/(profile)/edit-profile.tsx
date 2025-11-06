import { useUser } from '@clerk/clerk-expo';
import { useLocalCredentials } from '@clerk/clerk-expo/local-credentials';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, Button, PasswordInput, Container } from '@/components/ui';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';

export default function EditProfilePage() {
    const { user } = useUser();
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { isLoading, isClient, isTrainer, person, roles } = useAuth();

    const { userOwnsCredentials, setCredentials } = useLocalCredentials();


    if (isClient) {
        return (
            <ScrollView className="flex-1 bg-white">
                <View className="px-6 py-8">
                    {/* Header with Back Button */}
                    <View className="flex-row items-center mb-6 py-4">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color="#1f2937" />
                        </TouchableOpacity>
                        <Text variant="h2" className="text-2xl font-bold text-gray-900 flex-1">
                            Editar Perfil
                        </Text>
                    </View>

                    {/* Edit Profile Section */}
                    <View className="mb-8">
                        <Text variant="h3" className="text-lg font-semibold text-gray-900 mb-4">
                            Editar Perfil
                        </Text>

                        <TouchableOpacity
                            className="bg-gray-50 rounded-lg p-4 mb-3 flex-row items-center justify-between"
                            onPress={() => {
                                router.push('/(profile)/personal-info');
                            }}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="person-outline" size={20} color="#1f2937" />
                                <Text className="text-gray-900 ml-3 font-medium">
                                    Información Personal
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-gray-50 rounded-lg p-4 mb-3 flex-row items-center justify-between"
                            onPress={() => {
                                router.push('/(profile)/preferences');
                            }}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="barbell-outline" size={20} color="#1f2937" />
                                <Text className="text-gray-900 ml-3 font-medium">
                                    Preferencias
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-gray-50 rounded-lg p-4 mb-3 flex-row items-center justify-between"
                            onPress={() => {
                                router.push('/(profile)/imc');
                            }}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="fitness-outline" size={20} color="#1f2937" />
                                <Text className="text-gray-900 ml-3 font-medium">
                                    IMC
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }

    if (isTrainer) {
        return (
            <ScrollView className="flex-1 bg-white">
                <View className="px-6 py-8">
                    {/* Header with Back Button */}
                    <View className="flex-row items-center mb-6 py-4">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color="#1f2937" />
                        </TouchableOpacity>
                        <Text variant="h2" className="text-2xl font-bold text-gray-900 flex-1">
                            Editar Perfil
                        </Text>
                    </View>

                    {/* Edit Profile Section */}
                    <View className="mb-8">
                        <Text variant="h3" className="text-lg font-semibold text-gray-900 mb-4">
                            Editar Perfil
                        </Text>
                    </View>


                    <TouchableOpacity
                        className="bg-gray-50 rounded-lg p-4 mb-3 flex-row items-center justify-between"
                        onPress={() => {
                            router.push('/(profile)/personal-info-trainer');
                        }}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="person-outline" size={20} color="#1f2937" />
                            <Text className="text-gray-900 ml-3 font-medium">
                                Información personal del entrenador
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-gray-50 rounded-lg p-4 mb-3 flex-row items-center justify-between"
                        onPress={() => {
                            router.push('/(profile)/preferences-trainer');
                        }}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="barbell-outline" size={20} color="#1f2937" />
                            <Text className="text-gray-900 ml-3 font-medium">
                                Preferencias entrenador
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                </View>

            </ScrollView>
        );
    }
}

import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NotPaymentScreen() {
    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-16 pb-8">
                {/* Icono de advertencia */}
                <View className="items-center mb-8">
                    <View className="w-24 h-24 bg-amber-100 rounded-full items-center justify-center mb-4">
                        <Ionicons name="alert-circle" size={64} color="#f59e0b" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                        Suscripción Inactiva
                    </Text>
                    <Text className="text-base text-gray-600 text-center">
                        Tu membresía no está activa en este momento
                    </Text>
                </View>

                {/* Mensaje principal */}
                <View className="bg-amber-50 rounded-xl p-6 mb-6 border border-amber-200">
                    <Text className="text-base text-gray-700 leading-6 mb-4">
                        Para poder invitar amigos y disfrutar de todos los beneficios de nuestra comunidad,
                        necesitas tener una suscripción activa.
                    </Text>
                    <Text className="text-base text-gray-700 leading-6">
                        Por favor, contacta con tu sede y renueva tu membresía para continuar.
                    </Text>
                </View>

                {/* Beneficios de la suscripción activa */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">
                        Con tu suscripción activa podrás:
                    </Text>

                    <View className="space-y-3">
                        <View className="flex-row items-start">
                            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                            <Text className="ml-3 text-gray-700 flex-1">
                                Invitar amigos y obtener beneficios exclusivos
                            </Text>
                        </View>

                        <View className="flex-row items-start mt-3">
                            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                            <Text className="ml-3 text-gray-700 flex-1">
                                Acceso completo a todas las instalaciones
                            </Text>
                        </View>

                        <View className="flex-row items-start mt-3">
                            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                            <Text className="ml-3 text-gray-700 flex-1">
                                Chat ilimitado con entrenadores
                            </Text>
                        </View>

                        <View className="flex-row items-start mt-3">
                            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                            <Text className="ml-3 text-gray-700 flex-1">
                                Contenido exclusivo y tips de entrenamiento
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Botón de volver */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-gray-100 rounded-xl py-4 px-6 items-center"
                    activeOpacity={0.8}
                >
                    <Text className="text-gray-700 text-base font-semibold">
                        Volver
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

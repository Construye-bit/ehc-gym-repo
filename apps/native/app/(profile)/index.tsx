import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui';
import { useUser } from '@clerk/clerk-expo';

export default function ProfileScreen() {
    const { user } = useUser();

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-8">
                {/* Información del Usuario */}
                <View className="mb-6">
                    <Text variant="h2" className="text-2xl font-bold text-gray-900 mb-2">
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text variant="p" color="tertiary" className="text-base">
                        {user?.emailAddresses[0]?.emailAddress}
                    </Text>
                </View>

                {/* Información Personal */}
                <View className="mb-6">
                    <Text variant="h3" className="text-lg font-semibold text-gray-900 mb-4">
                        Información Personal
                    </Text>
                    <View className="bg-gray-50 rounded-lg p-4">
                        <View className="mb-4">
                            <Text className="text-sm text-gray-500">Nombre completo</Text>
                            <Text className="text-base text-gray-900 font-medium">
                                {user?.firstName} {user?.lastName}
                            </Text>
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm text-gray-500">Correo electrónico</Text>
                            <Text className="text-base text-gray-900 font-medium">
                                {user?.emailAddresses[0]?.emailAddress}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
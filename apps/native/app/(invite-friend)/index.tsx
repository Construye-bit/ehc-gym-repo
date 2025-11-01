import { View, Text } from 'react-native';
import { Container } from '@/components/container';
import { Stack } from 'expo-router';

export default function InviteFriendScreen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Chat',
                    headerShown: true,
                }}
            />
            <Container>
                <View className="flex-1 justify-center items-center p-6">
                    <Text className="text-6xl mb-4">💬</Text>
                    <Text className="text-2xl font-bold text-foreground mb-2 text-center">
                        Chat
                    </Text>
                    <Text className="text-muted-foreground text-center mb-8 max-w-sm">
                        La funcionalidad de chat estará disponible próximamente.
                    </Text>
                </View>
            </Container>
        </>
    );
}

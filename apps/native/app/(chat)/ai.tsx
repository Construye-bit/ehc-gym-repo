import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import { useAIChat } from '@/hooks/use-ai-chat';
import { MessageBubble, MessageInput, AIWelcomeScreen } from '@/components/chat';

export default function AIChatScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const {
        messages,
        isLoading,
        sendMessage,
        retryMessage,
        startNewConversation,
        hasThread,
    } = useAIChat();

    // Auto-scroll al final cuando se carguen mensajes
    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    // Auto-scroll cuando se abre el teclado
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
        };
    }, []);

    const handleSendMessage = async (text: string) => {
        await sendMessage(text);
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleNewConversation = () => {
        Alert.alert(
            'Nueva conversación',
            '¿Deseas iniciar una nueva conversación? Se perderá el historial actual.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Iniciar',
                    style: 'destructive',
                    onPress: startNewConversation,
                },
            ]
        );
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Asistente IA',
                    headerStyle: {
                        backgroundColor: AppColors.primary.yellow,
                    },
                    headerTintColor: 'white',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="mr-4"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleNewConversation}
                            className="mr-4 flex-row items-center bg-white/20 px-3 py-1.5 rounded-full"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            disabled={!hasThread}
                        >
                            <Ionicons name="add-circle-outline" size={18} color="white" />
                            <Text className="ml-1 text-white text-xs font-semibold">
                                Nueva
                            </Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
                <StatusBar
                    backgroundColor={AppColors.primary.yellow}
                    barStyle="light-content"
                />

                {/* Badge informativo */}
                <View className="px-4 py-3 bg-blue-50 border-b border-blue-200">
                    <View className="flex-row items-start">
                        <Ionicons name="information-circle" size={20} color="#3B82F6" />
                        <View className="flex-1 ml-2">
                            <Text className="text-sm text-blue-900 font-semibold">
                                Asistente Virtual del Gimnasio
                            </Text>
                            <Text className="text-xs text-blue-700 mt-0.5">
                                Pregúntame sobre tu perfil, métricas de salud, progreso o
                                contratos con entrenadores
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Lista de mensajes */}
                {messages.length === 0 ? (
                    <AIWelcomeScreen />
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <MessageBubble message={item} onRetry={retryMessage} />
                        )}
                        contentContainerStyle={{ paddingVertical: 16 }}
                        onContentSizeChange={() => {
                            flatListRef.current?.scrollToEnd({ animated: true });
                        }}
                    />
                )}

                {/* Indicador de carga cuando la IA está procesando */}
                {isLoading && (
                    <View className="px-4 pb-2">
                        <View className="flex-row items-center bg-gray-200 rounded-2xl px-4 py-3 self-start max-w-[75%]">
                            <ActivityIndicator
                                size="small"
                                color={AppColors.primary.yellow}
                            />
                            <Text className="ml-2 text-gray-600 text-sm">
                                Pensando...
                            </Text>
                        </View>
                    </View>
                )}

                {/* Input de mensaje con KeyboardAvoidingView */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    <MessageInput
                        onSend={handleSendMessage}
                        disabled={isLoading}
                        placeholder={
                            isLoading ? 'Esperando respuesta...' : 'Escribe tu pregunta...'
                        }
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

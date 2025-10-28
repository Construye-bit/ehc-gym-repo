import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { AppColors } from '@/constants/Colors';
import { useAuth } from '@/hooks/use-auth';
import { useConversationDetails } from '@/hooks/use-conversation-details';
import { useMessages } from '@/hooks/use-messages';
import {
  MessageBubble,
  MessageInput,
  QuotaIndicator,
  ContractMenu,
} from '@/components/chat';
import api from '@/api';
import type { Id } from '@/api';

export default function ConversationScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isTrainer, isClient } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [showContractMenu, setShowContractMenu] = useState(false);

  const conversationId = params.id as Id<'conversations'>;
  const { conversation, isLoading: conversationLoading } = useConversationDetails(conversationId);
  const { messages, isLoading: messagesLoading, sendMessage, retryMessage } = useMessages(conversationId);
  
  const markContractMutation = useMutation(api.chat.conversations.mutations.markContract);

  // Auto-scroll al final cuando se carguen mensajes
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async (text: string) => {
    await sendMessage(text);
    // Auto-scroll después de enviar
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

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

  const handleMarkContract = async (validUntil: Date) => {
    try {
      await markContractMutation({
        conversationId,
        valid_until: validUntil.getTime(),
      });
      Alert.alert(
        'Contratación marcada',
        'El cliente ahora puede enviar mensajes ilimitados hasta la fecha indicada.'
      );
    } catch (error) {
      console.error('Error marking contract:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'No se pudo marcar la contratación'
      );
    }
  };

  if (conversationLoading || !conversation) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={AppColors.primary.yellow} />
          <Text className="text-gray-500 mt-4">Cargando conversación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBlocked = conversation.status === 'BLOCKED';
  const isContracted = conversation.status === 'CONTRACTED';
  const showQuota = isClient && conversation.message_quota && !isContracted;
  const canSend = !isBlocked;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: conversation.other_participant.name,
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
          headerRight: () =>
            isTrainer && !isContracted ? (
              <TouchableOpacity
                onPress={() => setShowContractMenu(true)}
                className="mr-4 flex-row items-center bg-white/20 px-3 py-1.5 rounded-full"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="document-text-outline" size={18} color="white" />
                <Text className="ml-1 text-white text-xs font-semibold">
                  Marcar contrato
                </Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <StatusBar backgroundColor={AppColors.primary.yellow} barStyle="light-content" />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Indicador de cuota (solo clientes sin contrato) */}
          {showQuota && <QuotaIndicator quota={conversation.message_quota} />}

          {/* Badge de estado contratado */}
          {isContracted && (
            <View className="px-4 py-2 bg-green-50 border-b border-green-200">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text className="ml-2 text-sm text-green-900">
                  <Text className="font-semibold">
                    {isTrainer ? 'Cliente contratado' : 'Contrato activo'}
                  </Text>
                  {conversation.contract_valid_until && (
                    <Text>
                      {' '}hasta{' '}
                      {new Date(conversation.contract_valid_until).toLocaleDateString('es-CO')}
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          )}

          {/* Badge de conversación bloqueada */}
          {isBlocked && (
            <View className="px-4 py-2 bg-red-50 border-b border-red-200">
              <View className="flex-row items-center">
                <Ionicons name="lock-closed" size={16} color="#EF4444" />
                <Text className="ml-2 text-sm text-red-900">
                  Conversación bloqueada - Mensajes gratuitos agotados
                </Text>
              </View>
            </View>
          )}

          {/* Lista de mensajes */}
          {messagesLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={AppColors.primary.yellow} />
              <Text className="text-gray-500 mt-4">Cargando mensajes...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center p-8">
              <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-4">
                No hay mensajes aún.{'\n'}¡Envía el primero!
              </Text>
            </View>
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
                // Auto-scroll cuando cambie el tamaño del contenido
                flatListRef.current?.scrollToEnd({ animated: true });
              }}
            />
          )}

          {/* Input de mensaje */}
          <MessageInput
            onSend={handleSendMessage}
            disabled={!canSend}
            placeholder={
              isBlocked
                ? 'Conversación bloqueada'
                : 'Escribe un mensaje...'
            }
          />
        </KeyboardAvoidingView>

        {/* Modal de contrato (solo entrenadores) */}
        {isTrainer && (
          <ContractMenu
            visible={showContractMenu}
            onClose={() => setShowContractMenu(false)}
            onMarkContract={handleMarkContract}
          />
        )}
      </SafeAreaView>
    </>
  );
}

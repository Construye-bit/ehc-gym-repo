import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';

interface ContractMenuProps {
  visible: boolean;
  onClose: () => void;
  onMarkContract: (validUntil: Date) => void;
}

export function ContractMenu({ visible, onClose, onMarkContract }: ContractMenuProps) {
  const [selectedMonths, setSelectedMonths] = useState(1);

  const handleConfirm = () => {
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + selectedMonths);
    onMarkContract(validUntil);
    onClose();
  };

  const formatDate = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const durationOptions = [
    { months: 1, label: '1 mes' },
    { months: 2, label: '2 meses' },
    { months: 3, label: '3 meses' },
    { months: 6, label: '6 meses' },
    { months: 12, label: '1 año' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          className="bg-white rounded-t-3xl max-h-[85%]"
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="px-6 pt-6 pb-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="document-text" size={24} color={AppColors.primary.yellow} />
                <Text className="ml-2 text-xl font-bold text-gray-900">
                  Marcar Contratación
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Contenido scrolleable */}
          <ScrollView 
            className="px-6 py-6"
            contentContainerStyle={{ paddingBottom: 15 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-sm text-gray-600 mb-4">
              Indica que el cliente ha contratado tus servicios. Esto le permitirá enviar mensajes ilimitados hasta la fecha de vigencia.
            </Text>

            {/* Selector de duración */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Duración del contrato
              </Text>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.months}
                  onPress={() => setSelectedMonths(option.months)}
                  className={`flex-row items-center justify-between p-4 mb-2 rounded-xl border ${
                    selectedMonths === option.months
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <View className="flex-1">
                    <Text
                      className={`text-base font-semibold ${
                        selectedMonths === option.months ? 'text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      Hasta: {formatDate(option.months)}
                    </Text>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      selectedMonths === option.months
                        ? 'border-yellow-400'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedMonths === option.months && (
                      <View className="w-3 h-3 rounded-full" style={{ backgroundColor: AppColors.primary.yellow }} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Info */}
            <View className="bg-blue-50 p-4 rounded-xl">
              <View className="flex-row">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="ml-2 text-sm text-blue-900 flex-1">
                  El cliente podrá enviar mensajes sin límite hasta el {formatDate(selectedMonths)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Botones fijos en la parte inferior */}
          <View className="px-6 py-4 border-t border-gray-200 bg-white">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3 bg-gray-100 rounded-xl"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                className="flex-1 py-3 rounded-xl"
                style={{ backgroundColor: AppColors.primary.yellow }}
              >
                <Text className="text-center text-white font-semibold">
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}


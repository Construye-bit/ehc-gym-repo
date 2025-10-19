import React from 'react';
import { View, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Text } from './text';
import { Ionicons } from '@expo/vector-icons';

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    label?: string;
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
}

export function Select({
    label,
    value,
    onValueChange,
    options,
    placeholder = 'Seleccionar',
    error
}: SelectProps) {
    const [modalVisible, setModalVisible] = React.useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <View className="mb-4">
            {label && (
                <Text className="text-gray-700 text-sm font-medium mb-2">
                    {label}
                </Text>
            )}

            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className={`flex-row items-center justify-between bg-white border rounded-lg px-4 py-3.5 ${error ? 'border-red-500' : 'border-gray-300'
                    }`}
            >
                <Text className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={error ? '#ef4444' : '#9ca3af'}
                />
            </TouchableOpacity>

            {error && (
                <Text className="text-red-500 text-xs mt-1">
                    {error}
                </Text>
            )}

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View className="bg-white rounded-t-3xl max-h-96">
                        <View className="border-b border-gray-200 px-5 py-4 flex-row items-center justify-between">
                            <Text className="text-lg font-semibold text-gray-900">
                                {label || 'Seleccionar'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`px-5 py-4 border-b border-gray-100 ${item.value === value ? 'bg-yellow-50' : ''
                                        }`}
                                    onPress={() => {
                                        onValueChange(item.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <Text className={`text-base ${item.value === value
                                                ? 'text-yellow-700 font-semibold'
                                                : 'text-gray-700'
                                            }`}>
                                            {item.label}
                                        </Text>
                                        {item.value === value && (
                                            <Ionicons name="checkmark" size={24} color="#a16207" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

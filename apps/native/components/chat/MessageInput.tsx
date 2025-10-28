import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, disabled = false, placeholder = 'Escribe un mensaje...' }: MessageInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  return (
    <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200">
      <TextInput
        className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2 text-base"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
        editable={!disabled}
        style={{ maxHeight: 100 }}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim() || disabled}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          text.trim() && !disabled ? '' : 'opacity-50'
        }`}
        style={{
          backgroundColor: text.trim() && !disabled ? AppColors.primary.yellow : '#E5E7EB',
        }}
      >
        <Ionicons
          name="send"
          size={20}
          color={text.trim() && !disabled ? 'white' : '#9CA3AF'}
        />
      </TouchableOpacity>
    </View>
  );
}

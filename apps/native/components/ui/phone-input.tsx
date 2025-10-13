import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Text } from './text';

interface PhoneInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    label?: string;
    error?: string;
    className?: string;
    value: string;
    onChangeText: (text: string) => void;
    countryCode?: string;
    onCountryCodeChange?: (code: string) => void;
}

export const PhoneInput = React.forwardRef<TextInput, PhoneInputProps>(({
    label,
    error,
    className = '',
    value,
    onChangeText,
    countryCode = '+57',
    onCountryCodeChange,
    placeholder = '3197293578',
    ...props
}, ref) => {
    const formatPhone = (text: string) => {
        // Remove all non-numeric characters
        return text.replace(/\D/g, '');
    };

    const handleChangeText = (text: string) => {
        const formatted = formatPhone(text);
        onChangeText(formatted);
    };

    return (
        <View className="mb-4">
            {label && (
                <Text variant="label" className="mb-2 text-base font-medium text-gray-700">
                    {label}
                </Text>
            )}
            <View className="flex-row items-center">
                <View className={`bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3.5 mr-2`}>
                    <Text className="text-base text-gray-900">{countryCode}</Text>
                </View>
                <TextInput
                    ref={ref}
                    className={`flex-1 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3.5 text-base text-gray-900 ${className}`}
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={handleChangeText}
                    placeholder={placeholder}
                    keyboardType="phone-pad"
                    maxLength={10}
                    {...props}
                />
            </View>
            {error && (
                <Text variant="p" className="mt-1 text-sm text-red-500">
                    {error}
                </Text>
            )}
        </View>
    );
});

PhoneInput.displayName = 'PhoneInput';

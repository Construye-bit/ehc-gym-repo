import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Text } from './Text';

interface DateInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    label?: string;
    error?: string;
    className?: string;
    value: string;
    onChangeText: (text: string) => void;
}

export const DateInput = React.forwardRef<TextInput, DateInputProps>(({
    label,
    error,
    className = '',
    value,
    onChangeText,
    placeholder = 'DD/MM/AAAA',
    ...props
}, ref) => {
    const formatDate = (text: string) => {
        // Remove all non-numeric characters
        const numbers = text.replace(/\D/g, '');

        // Format as DD/MM/YYYY
        let formatted = '';
        if (numbers.length > 0) {
            formatted = numbers.substring(0, 2);
            if (numbers.length > 2) {
                formatted += '/' + numbers.substring(2, 4);
            }
            if (numbers.length > 4) {
                formatted += '/' + numbers.substring(4, 8);
            }
        }

        return formatted;
    };

    const handleChangeText = (text: string) => {
        const formatted = formatDate(text);
        onChangeText(formatted);
    };

    return (
        <View className="mb-4">
            {label && (
                <Text variant="label" className="mb-2 text-base font-medium text-gray-700">
                    {label}
                </Text>
            )}
            <TextInput
                ref={ref}
                className={`bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3.5 text-base text-gray-900 ${className}`}
                placeholderTextColor="#9CA3AF"
                value={value}
                onChangeText={handleChangeText}
                placeholder={placeholder}
                keyboardType="numeric"
                maxLength={10}
                {...props}
            />
            {error && (
                <Text variant="p" className="mt-1 text-sm text-red-500">
                    {error}
                </Text>
            )}
        </View>
    );
});

DateInput.displayName = 'DateInput';

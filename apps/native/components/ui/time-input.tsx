import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Text } from './text';

interface TimeInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    label?: string;
    error?: string;
    className?: string;
    value: string;
    onChangeText: (text: string) => void;
}

export const TimeInput = React.forwardRef<TextInput, TimeInputProps>(({
    label,
    error,
    className = '',
    value,
    onChangeText,
    placeholder = 'HH:MM',
    ...props
}, ref) => {
    const formatTime = (text: string) => {
        // Remove all non-numeric characters
        const numbers = text.replace(/\D/g, '');

        // Format as HH:MM
        let formatted = '';
        if (numbers.length > 0) {
            const hours = numbers.substring(0, 2);
            let validHours = hours;
            if (hours.length === 2) {
                const hoursNum = parseInt(hours);
                if (hoursNum > 23) validHours = '23';
            }
            formatted = validHours;

            if (numbers.length > 2) {
                const minutes = numbers.substring(2, 4);
                let validMinutes = minutes;
                if (minutes.length === 2) {
                    const minutesNum = parseInt(minutes);
                    if (minutesNum > 59) validMinutes = '59';
                }
                if (formatted) {
                    formatted += ':' + validMinutes;
                }
            }
        }

        return formatted;
    };

    const handleChangeText = (text: string) => {
        const formatted = formatTime(text);
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
                maxLength={5}
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

TimeInput.displayName = 'TimeInput';
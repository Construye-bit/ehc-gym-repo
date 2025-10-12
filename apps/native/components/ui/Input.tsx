import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Text } from './Text';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    className?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(({
    label,
    error,
    className = '',
    ...props
}, ref) => {
    return (
        <View className="mb-4">
            {label && (
                <Text variant="label" className="mb-2 text-base font-medium text-gray-700">
                    {label}
                </Text>
            )}
            <TextInput
                ref={ref}
                accessibilityLabel={label}
                aria-invalid={error ? true : undefined}
                className={`bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3.5 text-base text-gray-900 ${className}`}
                placeholderTextColor="#9CA3AF"
                {...props}
            />
            {error && (
                <Text variant="p" className="mt-1 text-sm text-red-500" accessibilityLiveRegion="polite" accessibilityRole="alert">
                    {error}
                </Text>
            )}
        </View>
    );
});

Input.displayName = 'Input';

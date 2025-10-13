import React, { useState } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';

interface PasswordInputProps extends TextInputProps {
    label?: string;
    error?: string;
    className?: string;
}

export const PasswordInput = React.forwardRef<
    React.ComponentRef<typeof TextInput>,
    PasswordInputProps
>(({
    label,
    error,
    className = '',
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className="mb-4">
            {label && (
                <Text variant="label" className="mb-2 text-base font-medium text-gray-700">
                    {label}
                </Text>
            )}
            <View className="relative">
                <TextInput
                    ref={ref}
                    className={`bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3.5 pr-12 text-base text-gray-900 ${className}`}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    {...props}
                />
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                    <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color="#9CA3AF"
                    />
                </TouchableOpacity>
            </View>
            {error && (
                <Text variant="p" className="mt-1 text-sm text-red-500">
                    {error}
                </Text>
            )}
        </View>
    );
});

PasswordInput.displayName = 'PasswordInput';

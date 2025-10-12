import React, { useRef, useState, useImperativeHandle } from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Text } from './Text';

interface CodeInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    length?: number;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    label?: string;
}

export const CodeInput = React.forwardRef<TextInput, CodeInputProps>(({
    length = 6,
    value,
    onChangeText,
    error,
    label,
    autoFocus = false,
    ...props
}, ref) => {
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => inputRef.current!, []);

    const handleChangeText = (text: string) => {
        // Only allow numbers
        const numbers = text.replace(/\D/g, '');
        onChangeText(numbers.slice(0, length));
    };

    const handlePress = () => {
        inputRef.current?.focus();
    };
    const boxes = Array.from({ length }, (_, index) => {
        const char = value[index] || '';
        const isFilled = char !== '';
        const isActive = isFocused && value.length === index;
        const boxClasses = error
            ? 'border-red-500 bg-white'
            : isActive
                ? 'border-yellow-500 bg-yellow-50'
                : isFilled
                    ? 'border-yellow-400 bg-white'
                    : 'border-gray-300 bg-white';
        return (
            <View
                key={index}
                className={`w-12 h-14 border-2 rounded-xl items-center justify-center mx-1 ${boxClasses}`}
            >
                <Text className="text-2xl font-semibold text-gray-900">
                    {char}
                </Text>
            </View>
        );
    });

    return (
        <View className="mb-6">
            {label && (
                <Text variant="label" className="mb-3 text-base font-medium text-gray-700">
                    {label}
                </Text>
            )}

            <View className="relative">
                {/* Visual boxes */}
                <View className="flex-row justify-center" onTouchEnd={handlePress}>
                    {boxes}
                </View>

                {/* Hidden input */}
                <TextInput
                    ref={inputRef}
                    value={value}
                    onChangeText={handleChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    keyboardType="number-pad"
                    maxLength={length}
                    autoFocus={autoFocus}
                    className="absolute opacity-0 w-full h-full"
                    {...props}
                />
            </View>

            {error && (
                <Text variant="p" className="mt-2 text-sm text-red-500 text-center">
                    {error}
                </Text>
            )}
        </View>
    );
});

CodeInput.displayName = 'CodeInput';

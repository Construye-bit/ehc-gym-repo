import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    className?: string;
}

export const Button = React.forwardRef<
    React.ComponentRef<typeof Pressable>,
    ButtonProps
>(({
    children,
    variant = 'primary',
    size = 'lg',
    isLoading = false,
    className = '',
    disabled,
    ...props
}, ref) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return 'bg-gray-200 active:bg-gray-300';
            case 'outline':
                return 'bg-transparent border-2 border-yellow-500 active:bg-yellow-50';
            default:
                return 'bg-yellow-500 active:bg-yellow-600';
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'py-2 px-4';
            case 'md':
                return 'py-3 px-6';
            default:
                return 'py-4 px-8';
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'outline':
                return 'text-yellow-500';
            case 'secondary':
                return 'text-gray-900';
            default:
                return 'text-white';
        }
    };

    // Check if children is a primitive string
    const isStringChild = typeof children === 'string' || typeof children === 'number';

    return (
        <Pressable
            ref={ref}
            className={`rounded-full items-center justify-center ${getVariantStyles()} ${getSizeStyles()} ${disabled || isLoading ? 'opacity-50' : ''} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {({ pressed }) => (
                <>
                    {isLoading ? (
                        <ActivityIndicator color={variant === 'primary' ? 'white' : '#FF9500'} />
                    ) : isStringChild ? (
                        <Text
                            className={`font-bold text-sm tracking-wider ${getTextColor()}`}
                            style={{ opacity: pressed ? 0.8 : 1 }}
                        >
                            {children}
                        </Text>
                    ) : (
                        children
                    )}
                </>
            )}
        </Pressable>
    );
});

Button.displayName = 'Button';

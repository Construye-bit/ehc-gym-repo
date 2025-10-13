import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'p' | 'label' | 'small';
    color?: 'primary' | 'secondary' | 'tertiary';
    align?: 'left' | 'center' | 'right';
    className?: string;
    children: React.ReactNode;
}

export const Text = React.forwardRef<RNText, TextProps>(({
    variant = 'p',
    color,
    align,
    className = '',
    children,
    style,
    ...props
}, ref) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'h1':
                return 'text-3xl font-bold';
            case 'h2':
                return 'text-2xl font-bold';
            case 'h3':
                return 'text-xl font-semibold';
            case 'label':
                return 'text-sm font-medium';
            case 'small':
                return 'text-xs';
            default:
                return 'text-base';
        }
    };

    const getColorStyles = () => {
        switch (color) {
            case 'primary':
                return 'text-gray-900';
            case 'secondary':
                return 'text-gray-600';
            case 'tertiary':
                return 'text-gray-500';
            default:
                return '';
        }
    };

    const getAlignStyles = () => {
        switch (align) {
            case 'center':
                return 'text-center';
            case 'right':
                return 'text-right';
            default:
                return 'text-left';
        }
    };

    return (
        <RNText
            ref={ref}
            className={`${getVariantStyles()} ${getColorStyles()} ${getAlignStyles()} ${className}`}
            style={style}
            {...props}
        >
            {children}
        </RNText>
    );
});

Text.displayName = 'Text';

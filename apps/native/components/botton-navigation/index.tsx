import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname, useSegments, Href } from 'expo-router';

type NavigationTab = {
    name: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
    badge?: number; // Número a mostrar en el badge (opcional)
};

type BottomNavigationProps = {
    tabs: NavigationTab[];
};

export function BottomNavigation({ tabs }: BottomNavigationProps) {
    const pathname = usePathname();
    const segments = useSegments();

    const isActiveRoute = (route: string) => {
        // Manejar el caso cuando el route es '#'
        if (route === '#') return false;

        // Convertir segments a string para comparación
        const segmentsStr = segments ? String(segments) : '';

        // IMPORTANTE: Verificar rutas específicas PRIMERO antes de home

        // Para chat
        if (route === '/(chat)' || route.includes('/(chat)')) {
            const isChatRoute = segmentsStr.includes('(chat)');
            return isChatRoute;
        }

        // Para las rutas de blog
        if (route.includes('/(blog)/')) {
            return segmentsStr.includes('(blog)') || pathname?.includes('client-feed') || pathname?.includes('trainer-feed');
        }

        // Para settings
        if (route === '/(home)/settings') {
            return pathname?.includes('settings') || pathname?.includes('update-password');
        }

        // Para la ruta home - DEBE IR AL FINAL
        if (route === '/(home)' || route === '/(home)/index') {
            return segmentsStr.includes('(home)') &&
                !segmentsStr.includes('(chat)') &&
                !segmentsStr.includes('(blog)') &&
                !pathname?.includes('settings') &&
                !pathname?.includes('trainer-catalog');
        }

        return pathname?.includes(route);
    };

    return (
        <View className="bg-white border-t border-gray-200 pb-2 shadow-lg">
            {/* Línea indicadora superior */}
            <View className="h-1 bg-yellow-500 rounded-sm w-20 self-center mt-1 mb-2" />

            <View className="flex-row justify-around items-center px-4 pt-2">
                {tabs.map((tab) => {
                    const isActive = isActiveRoute(tab.route);

                    // Si la ruta es '#', renderizar sin Link
                    if (tab.route === '#') {
                        return (
                            <View
                                key={tab.name}
                                className="flex-1 items-center justify-center py-2"
                            >
                                <Ionicons
                                    name={tab.icon}
                                    size={26}
                                    color="#9CA3AF"
                                />
                                <Text className="text-xs mt-1 text-gray-400 font-medium">
                                    {tab.label}
                                </Text>
                            </View>
                        );
                    }

                    return (
                        <Link
                            key={tab.name}
                            href={tab.route as Href}
                            asChild
                        >
                            <Pressable className="flex-1 items-center justify-center py-2">
                                <View>
                                    <Ionicons
                                        name={tab.icon}
                                        size={26}
                                        color={isActive ? '#EAB308' : '#000'}
                                    />
                                    {/* Badge de mensajes sin leer */}
                                    {tab.badge !== undefined && tab.badge > 0 && (
                                        <View className="absolute -top-1 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                                            <Text className="text-white text-[10px] font-bold">
                                                {tab.badge > 99 ? '99+' : tab.badge}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text
                                    className={`text-xs mt-1 ${isActive
                                        ? 'text-yellow-500 font-semibold'
                                        : 'text-gray-900 font-medium'
                                        }`}
                                >
                                    {tab.label}
                                </Text>
                            </Pressable>
                        </Link>
                    );
                })}
            </View>
        </View>
    );
}

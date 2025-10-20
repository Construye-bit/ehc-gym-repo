import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname, Href } from 'expo-router';

type NavigationTab = {
    name: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
};

type BottomNavigationProps = {
    tabs: NavigationTab[];
};

export function BottomNavigation({ tabs }: BottomNavigationProps) {
    const pathname = usePathname();

    const isActiveRoute = (route: string) => {
        // Manejar el caso cuando el route es '#'
        if (route === '#') return false;

        // Para las rutas de blog - verificar directamente el pathname
        if (route.includes('/(blog)/')) {
            return pathname?.includes('client-feed') || pathname?.includes('trainer-feed');
        }

        // Para chat - soportar ambos formatos
        if (route.includes('/(chat)/')) {
            return true
        }

        // Para la ruta home
        if (route === '/(home)' || route === '/(home)/index') {
            return pathname === '/(home)' ||
                pathname === '/(home)/index' ||
                pathname === '/' ||
                (pathname?.startsWith('/(home)') &&
                    !pathname?.includes('client-feed') &&
                    !pathname?.includes('trainer-feed') &&
                    !pathname?.includes('settings') &&
                    !pathname?.includes('chat'));
        }

        // Para settings
        if (route === '/(home)/settings') {
            return pathname?.includes('settings') || pathname?.includes('update-password');
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
                                <Ionicons
                                    name={tab.icon}
                                    size={26}
                                    color={isActive ? '#EBB303' : '#000'}
                                />
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

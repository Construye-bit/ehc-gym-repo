import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname, Href } from 'expo-router';

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
    const router = useRouter();
    const pathname = usePathname();

    const isActiveRoute = (route: string) => {
        // Manejar el caso cuando el route es '#'
        if (route === '#') return false;

        // Para las rutas específicas, verificar si están en el pathname
        if (route.includes('/blog/')) {
            return pathname?.includes('/blog/');
        }
        if (route === '/(home)' || route === '/(home)/index') {
            return pathname === '/(home)' || pathname === '/(home)/index' || (pathname?.startsWith('/(home)') && !pathname?.includes('/blog') && !pathname?.includes('settings'));
        }
        if (route === '/(home)/settings') {
            return pathname?.includes('settings');
        }

        return pathname?.includes(route);
    };

    const handleNavigate = (route: string) => {
        // Ignorar navegación si la ruta es '#'
        if (route === '#') return;

        console.log('Attempting navigation from:', pathname, 'to:', route);

        try {
            // Usar push para todas las navegaciones
            router.push(route as Href);
        } catch (error) {
            console.error('Navigation error:', error);
            console.log('Retrying with different approach...');

            // Si falla, intentar removiendo y agregando el slash
            try {
                const cleanRoute = route.startsWith('/') ? route : `/${route}`;
                router.push(cleanRoute as Href);
            } catch (secondError) {
                console.error('Second attempt failed:', secondError);
            }
        }
    };

    return (
        <View className="bg-white border-t border-gray-200 pb-2 shadow-lg">
            {/* Línea indicadora superior */}
            <View className="h-1 bg-yellow-500 rounded-sm w-20 self-center mt-1 mb-2" />

            <View className="flex-row justify-around items-center px-4 pt-2">
                {tabs.map((tab) => {
                    const isActive = isActiveRoute(tab.route);

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            className="flex-1 items-center justify-center py-2"
                            onPress={() => handleNavigate(tab.route)}
                            activeOpacity={0.7}
                        >
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
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

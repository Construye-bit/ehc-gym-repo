import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    PixelRatio,
    Platform,
    StatusBar,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/clerk-expo';

// Function to get dynamic screen dimensions
const getScreenDimensions = () => {
    const { width, height } = Dimensions.get('window');
    const screenData = Dimensions.get('screen');
    return {
        width,
        height,
        screenWidth: screenData.width,
        screenHeight: screenData.height,
        isLandscape: width > height,
        isTablet: Math.min(width, height) >= 768,
        scale: PixelRatio.get()
    };
};

export default function OnBoardingScreen() {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useAuth();
    const [screenDimensions, setScreenDimensions] = useState(getScreenDimensions());

    // Update dimensions when orientation changes
    useEffect(() => {
        const updateDimensions = () => {
            setScreenDimensions(getScreenDimensions());
        };

        const subscription = Dimensions.addEventListener('change', updateDimensions);

        return () => subscription?.remove();
    }, []);

    const onGetStarted = () => {
        // Check if user is authenticated
        if (isLoaded) {
            if (isSignedIn) {
                router.replace('/(drawer)');
            } else {
                router.replace('/(auth)/sign-in');
            }
        }
    };

    const { isLandscape, isTablet } = screenDimensions;

    return (
        <SafeAreaView className={`flex-1 bg-white ${isLandscape ? 'flex-row' : ''}`}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={Platform.OS === 'android'}
            />

            {/* Main image */}
            <View className={`relative ${isLandscape ? 'flex-1' : 'w-full'} ${isTablet ? 'h-[55%]' : 'h-[65%]'} ${isLandscape ? 'h-full' : ''}`}>
                <Image
                    source={require('../assets/images/on-boarding.png')}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                {/* Gradient overlay for better text readability */}
                <View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/60 to-transparent" />
            </View>

            {/* Bottom content */}
            <View className={`flex-1 bg-white justify-end ${isTablet ? 'px-10 py-5' : 'px-8 py-4'} ${isTablet ? 'pb-8' : 'pb-6'} ${isLandscape ? 'justify-between pt-5' : ''}`}>
                <View className={`items-center ${isTablet ? 'mb-10' : 'mb-8'} ${isLandscape ? 'flex-1 justify-center mb-0' : ''}`}>
                    <Text className={`font-black text-center ${isTablet ? 'text-4xl leading-12' : 'text-3xl leading-9'} ${isLandscape ? 'text-2xl leading-8' : ''} ${isTablet ? 'mb-16' : 'mb-10'} ${isLandscape ? 'mb-5 mt-0' : isTablet ? 'mt-5' : 'mt-4'}`} style={{ color: '#0b0b09' }}>
                        Donde Quiera Que Estes La{'\n'}
                        <Text className={`${isTablet ? 'text-4xl' : 'text-3xl'} ${isLandscape ? 'text-2xl' : ''} font-extrabold`} style={{ color: '#FF9500' }}>
                            Salud
                        </Text>
                        <Text className={`font-black ${isTablet ? 'text-4xl' : 'text-3xl'} ${isLandscape ? 'text-2xl' : ''}`} style={{ color: '#0b0b09' }}>
                            {' '}Es Lo Primero
                        </Text>
                    </Text>

                    <Text className={`text-center font-normal ${isTablet ? 'text-base leading-6' : 'text-xs leading-5'} ${isLandscape ? 'mb-5' : 'mb-0'}`} style={{ color: '#27272A' }}>
                        No existe una forma instantánea{'\n'}
                        de tener una vida saludable.
                    </Text>
                </View>

                {/* Main button */}
                <Button
                    onPress={onGetStarted}
                    className="w-full mt-1 mb-1"
                    accessibilityLabel="Start now with exercise"
                    accessibilityHint="Navigate to sign in screen or main page"
                >
                    EMPIEZA AHORA
                </Button>
            </View>
        </SafeAreaView>
    );
}

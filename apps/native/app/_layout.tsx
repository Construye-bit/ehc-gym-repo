import { ConvexProvider, ConvexReactClient, useConvexAuth } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, useRouter, usePathname, useSegments } from "expo-router";
import {
	DarkTheme,
	DefaultTheme,
	type Theme,
	ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { NAV_THEME } from "@/lib/constants";
import React, { useRef, useEffect } from "react";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Platform, View, ActivityIndicator } from "react-native";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { useAuth as useAuthRoles } from "@/hooks/use-auth";

const LIGHT_THEME: Theme = {
	...DefaultTheme,
	colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
	...DarkTheme,
	colors: NAV_THEME.dark,
};

export const unstable_settings = {
	initialRouteName: "on-boarding",
};

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
	unsavedChangesWarning: false,
});

/**
 * Componente que maneja la lógica de autenticación y redirecciones centralizada
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
	const { isSignedIn } = useClerkAuth();
	const { isAuthenticated } = useConvexAuth();
	const { isAdmin, isSuperAdmin, isClient, isTrainer, isLoading } = useAuthRoles();
	const router = useRouter();
	const pathname = usePathname();
	const segments = useSegments();
	const hasRedirected = useRef(false);
	const lastPathname = useRef(pathname);

	useEffect(() => {
		// Si la ruta cambió, resetear el flag
		if (lastPathname.current !== pathname) {
			hasRedirected.current = false;
			lastPathname.current = pathname;
		}

		// Si no está cargado, no hacer nada aún
		if (isLoading) return;

		const inAuthGroup = segments[0] === '(auth)';
		const inOnBoarding = pathname === '/on-boarding' || segments[0] === 'on-boarding';

		// Si está en onboarding y está autenticado, redirigir a home
		if (inOnBoarding && isSignedIn && isAuthenticated && !hasRedirected.current) {
			hasRedirected.current = true;
			// Verificar si es admin o super admin
			if (isAdmin || isSuperAdmin) {
				router.replace("/(home)/admin-redirect");
			} else {
				router.replace("/(home)");
			}
			return;
		}

		// Si no está autenticado (tanto en Clerk como en Convex) y no está en rutas públicas
		if (!isSignedIn && !inAuthGroup && !inOnBoarding) {
			if (!hasRedirected.current) {
				hasRedirected.current = true;
				router.replace("/(auth)/sign-in");
			}
			return;
		}

		// Si está autenticado en Clerk pero no en Convex, esperar
		if (isSignedIn && !isAuthenticated && !inAuthGroup && !inOnBoarding) {
			// Mostrar loading mientras Convex sincroniza
			return;
		}

		// Si está completamente autenticado (Clerk + Convex) y no en onboarding
		if (isSignedIn && isAuthenticated && !inOnBoarding && !hasRedirected.current) {
			// Redirección para admins/super admins a admin-redirect
			if (isAdmin || isSuperAdmin) {
				const isOnAdminRedirect = pathname?.includes('admin-redirect') ||
					segments?.some((segment) => segment === 'admin-redirect');

				// Solo redirigir si está en home/blog/chat/invite-friend y no en admin-redirect
				const needsRedirect =
					(segments[0] === '(home)' || segments[0] === '(blog)' ||
						segments[0] === '(chat)' || segments[0] === '(invite-friend)') &&
					!isOnAdminRedirect;

				if (needsRedirect) {
					hasRedirected.current = true;
					router.replace("/(home)/admin-redirect");
					return;
				}
			}

			// Redirección específica para la raíz de blog
			const isBlogRoot = pathname === '/blog' || pathname === '/(blog)' || pathname === '/(blog)/';
			if (isBlogRoot) {
				hasRedirected.current = true;
				if (isClient) {
					router.replace("/(blog)/client-feed");
				} else if (isTrainer || isAdmin || isSuperAdmin) {
					router.replace("/(blog)/trainer-feed");
				}
			}
		}
	}, [isSignedIn, isAuthenticated, isAdmin, isSuperAdmin, isClient, isTrainer, isLoading, router, pathname, segments]);

	// Mostrar loading mientras se cargan los roles o mientras Convex sincroniza
	if ((isLoading && isSignedIn) || (isSignedIn && !isAuthenticated)) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
				<ActivityIndicator size="large" color="#EBB303" />
			</View>
		);
	}

	return <>{children}</>;
}

export default function RootLayout() {
	const hasMounted = useRef(false);
	const { colorScheme, isDarkColorScheme } = useColorScheme();
	const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

	// Suprimir errores de telemetría de Clerk (conocido y no afecta funcionalidad)
	React.useEffect(() => {
		const originalConsoleError = console.error;
		console.error = (...args: any[]) => {
			// Filtrar errores de telemetría de Clerk
			const errorMessage = args[0]?.toString() || '';
			if (
				errorMessage.includes('[clerk/telemetry]') ||
				errorMessage.includes('Error recording telemetry event')
			) {
				// Convertir a warning silencioso en desarrollo
				if (__DEV__) {
					console.warn('[Clerk Telemetry - Non-critical]:', ...args);
				}
				return;
			}
			// Pasar otros errores normalmente
			originalConsoleError.apply(console, args);
		};

		return () => {
			console.error = originalConsoleError;
		};
	}, []);

	useIsomorphicLayoutEffect(() => {
		if (hasMounted.current) {
			return;
		}

		if (Platform.OS === "web") {
			document.documentElement.classList.add("bg-background");
		}
		setAndroidNavigationBar(colorScheme);
		setIsColorSchemeLoaded(true);
		hasMounted.current = true;
	}, []);

	if (!isColorSchemeLoaded) {
		return null;
	}
	return (
		<ClerkProvider
			tokenCache={tokenCache}
			publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
		>
			<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
				<ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
					<StatusBar style={isDarkColorScheme ? "light" : "dark"} />
					<GestureHandlerRootView style={{ flex: 1 }}>
						<AuthGuard>
							<Stack>
								<Stack.Screen name="on-boarding" options={{ headerShown: false }} />
								<Stack.Screen name="(home)" options={{ headerShown: false }} />
								<Stack.Screen name="(auth)" options={{ headerShown: false }} />
								<Stack.Screen name="(blog)" options={{ headerShown: false }} />
								<Stack.Screen name="(chat)" options={{ headerShown: false }} />
								<Stack.Screen name="(invite-friend)" />
								<Stack.Screen name="(profile)" options={{ headerShown: false }} />
							</Stack>
						</AuthGuard>
					</GestureHandlerRootView>
				</ThemeProvider>
			</ConvexProviderWithClerk>
		</ClerkProvider>
	);
}

const useIsomorphicLayoutEffect =
	Platform.OS === "web" && typeof window === "undefined"
		? React.useEffect
		: React.useLayoutEffect;

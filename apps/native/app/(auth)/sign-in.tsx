import { useSignIn } from "@clerk/clerk-expo";
import { useLocalCredentials } from "@clerk/clerk-expo/local-credentials";
import { Link, useRouter } from "expo-router";
import { TouchableOpacity, View, ScrollView, Image, StatusBar, KeyboardAvoidingView, Platform, Alert } from "react-native";
import React, { useState } from "react";
import { Button, Input, PasswordInput, Text } from "@/components/ui";
import { signInSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";
import { Ionicons } from "@expo/vector-icons";

export default function SignInPage() {
	const { signIn, setActive, isLoaded } = useSignIn();
	const { hasCredentials, setCredentials, authenticate, biometricType } = useLocalCredentials();
	const router = useRouter();

	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [loadingRegular, setLoadingRegular] = useState(false);
	const [loadingBiometric, setLoadingBiometric] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<{
		email?: string;
		password?: string;
	}>({});

	const validateForm = () => {
		try {
			signInSchema.parse({
				email: emailAddress,
				password: password,
			});
			setFieldErrors({});
			return true;
		} catch (error) {
			if (error instanceof ZodError) {
				const errors: { email?: string; password?: string } = {};
				error.issues.forEach((issue) => {
					if (issue.path[0] === 'email') {
						errors.email = issue.message;
					} else if (issue.path[0] === 'password') {
						errors.password = issue.message;
					}
				});
				setFieldErrors(errors);
			}
			return false;
		}
	};

	const clearFieldError = (field: 'email' | 'password') => {
		setFieldErrors(prev => ({
			...prev,
			[field]: undefined,
		}));
	};

	// Handle the submission of the sign-in form
	const onSignInPress = async (useLocal: boolean = false) => {
		// Skip validation if using biometric authentication
		if (!useLocal) {
			setFieldErrors({});

			if (!validateForm()) {
				return;
			}
		}

		if (!isLoaded) return;

		// Set the appropriate loading state
		if (useLocal) {
			setLoadingBiometric(true);
		} else {
			setLoadingRegular(true);
		}

		try {
			// Use biometric authentication or regular sign-in
			const signInAttempt =
				hasCredentials && useLocal
					? await authenticate()
					: await signIn.create({
						identifier: emailAddress.trim(),
						password,
					});

			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId });

				// Ask user if they want to enable biometric authentication
				// Only ask if not using biometric login and credentials don't exist yet
				if (!useLocal && !hasCredentials && biometricType) {
					Alert.alert(
						'Autenticación Biométrica',
						`¿Deseas activar ${biometricType === 'face-recognition' ? 'Face ID' : 'huella dactilar'} para iniciar sesión más rápido la próxima vez?`,
						[
							{
								text: 'Ahora no',
								style: 'cancel',
								onPress: () => {
									router.replace("/(home)");
								},
							},
							{
								text: 'Activar',
								onPress: async () => {
									const attemptSaveCredentials = async () => {
										try {
											await setCredentials({
												identifier: emailAddress.trim(),
												password,
											});
											Alert.alert(
												'¡Listo!',
												`${biometricType === 'face-recognition' ? 'Face ID' : 'Huella dactilar'} activado. La próxima vez podrás iniciar sesión más rápido.`,
												[
													{
														text: 'OK',
														onPress: () => router.replace("/(home)"),
													},
												]
											);
										} catch (error: any) {
											console.error('Error saving biometric credentials:', error);

											const errorMessage = error?.message || 'Error desconocido';

											Alert.alert(
												'Error al Guardar Credenciales',
												`No se pudieron guardar las credenciales biométricas.\n\n${errorMessage}\n\nPuedes continuar sin autenticación biométrica o intentar nuevamente.`,
												[
													{
														text: 'Continuar sin biometría',
														style: 'cancel',
														onPress: () => router.replace("/(home)"),
													},
													{
														text: 'Reintentar',
														onPress: () => attemptSaveCredentials(),
													},
												],
												{ cancelable: false }
											);
										}
									};

									await attemptSaveCredentials();
								},
							},
						],
						{ cancelable: false }
					);
				} else {
					router.replace("/(home)");
				}
			} else {
				console.error(JSON.stringify(signInAttempt, null, 2));
			}
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2));

			// Handle specific Clerk errors
			if (err.errors && err.errors[0]) {
				const errorCode = err.errors[0].code;
				if (errorCode === 'form_identifier_not_found' || errorCode === 'form_password_incorrect') {
					setFieldErrors({
						email: 'Verifica tu correo electrónico',
						password: 'Verifica tu contraseña',
					});
				}
			}
		} finally {
			// Reset the appropriate loading state
			if (useLocal) {
				setLoadingBiometric(false);
			} else {
				setLoadingRegular(false);
			}
		}
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-white"
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				{/* Logo */}
				<View className="items-center pt-16 pb-8">
					<Image
						source={require('../../assets/images/logo.png')}
						style={{ width: 180, height: 180 }}
						resizeMode="contain"
					/>
				</View>

				{/* Form Container */}
				<View className="px-6 pt-3 pb-5">
					<Text
						variant="h1"
						align="center"
						className="text-5xl font-bold text-gray-900 mb-4"
						style={{ lineHeight: 60 }}
					>
						Ingresar
					</Text>

					<View className="flex-row justify-center mb-8 flex-wrap">
						<Text variant="p" color="tertiary" className="text-lg">
							¿No tienes una cuenta?{' '}
						</Text>
						<Link href="./sign-up" asChild>
							<TouchableOpacity>
								<Text variant="p" className="text-lg text-yellow-500 font-semibold">
									Regístrate
								</Text>
							</TouchableOpacity>
						</Link>
					</View>

					{/* Email Input */}
					<Input
						label="Correo Electrónico"
						value={emailAddress}
						onChangeText={(text) => {
							setEmailAddress(text);
							if (fieldErrors.email) {
								clearFieldError('email');
							}
						}}
						placeholder="loisbecket@gmail.com"
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						error={fieldErrors.email}
					/>

					{/* Password Input */}
					<PasswordInput
						label="Contraseña"
						value={password}
						onChangeText={(text) => {
							setPassword(text);
							if (fieldErrors.password) {
								clearFieldError('password');
							}
						}}
						placeholder="••••••••"
						error={fieldErrors.password}
					/>

					{/* Forgot Password */}
					<View className="items-center mt-3 mb-6">
						<Link href="./forgot-password" asChild>
							<TouchableOpacity>
								<Text variant="p" className="text-lg text-yellow-500 font-medium">
									¿Olvidaste tu contraseña?
								</Text>
							</TouchableOpacity>
						</Link>
					</View>

					{/* Biometric Sign In Button */}
					{hasCredentials && biometricType && (
						<Button
							onPress={() => onSignInPress(true)}
							disabled={loadingBiometric || loadingRegular}
							isLoading={loadingBiometric}
							className="mb-4 bg-gray-800"
						>
							<View className="flex-row items-center justify-center gap-2">
								<Ionicons
									name={biometricType === 'face-recognition' ? 'scan' : 'finger-print'}
									size={20}
									color="white"
								/>
								<Text className="text-white font-semibold">
									{biometricType === 'face-recognition' ? 'INGRESAR CON FACE ID' : 'INGRESAR CON HUELLA'}
								</Text>
							</View>
						</Button>
					)}

					{/* Sign In Button */}
					<Button
						onPress={() => onSignInPress(false)}
						disabled={loadingRegular || loadingBiometric}
						isLoading={loadingRegular}
						className="mb-6"
					>
						INGRESAR
					</Button>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

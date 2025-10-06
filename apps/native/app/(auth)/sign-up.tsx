import * as React from "react";
import { TouchableOpacity, View, ScrollView, Image, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Button, Input, PasswordInput, Text } from "@/components/ui";
import { signUpSchema, verificationCodeSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";

export default function SignUpScreen() {
	const { isLoaded, signUp, setActive } = useSignUp();
	const router = useRouter();

	const [emailAddress, setEmailAddress] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const [pendingVerification, setPendingVerification] = React.useState(false);
	const [code, setCode] = React.useState("");
	const [fieldErrors, setFieldErrors] = React.useState<{
		email?: string;
		password?: string;
		code?: string;
	}>({});

	const validateForm = () => {
		try {
			signUpSchema.parse({
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

	const validateVerificationCode = () => {
		try {
			verificationCodeSchema.parse({ code });
			setFieldErrors({});
			return true;
		} catch (error) {
			if (error instanceof ZodError) {
				const errors: { code?: string } = {};
				error.issues.forEach((issue) => {
					if (issue.path[0] === 'code') {
						errors.code = issue.message;
					}
				});
				setFieldErrors(errors);
			}
			return false;
		}
	};

	const clearFieldError = (field: 'email' | 'password' | 'code') => {
		setFieldErrors(prev => ({
			...prev,
			[field]: undefined,
		}));
	};

	// Handle submission of sign-up form
	const onSignUpPress = async () => {
		setFieldErrors({});

		if (!validateForm()) {
			return;
		}

		if (!isLoaded) return;

		setLoading(true);

		try {
			await signUp.create({
				emailAddress: emailAddress.trim(),
				password,
			});

			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
			setPendingVerification(true);
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2));

			if (err.errors && err.errors[0]) {
				const errorMessage = err.errors[0].message;
				if (errorMessage.toLowerCase().includes('email')) {
					setFieldErrors({ email: errorMessage });
				} else if (errorMessage.toLowerCase().includes('password')) {
					setFieldErrors({ password: errorMessage });
				}
			}
		} finally {
			setLoading(false);
		}
	};

	// Handle submission of verification form
	const onVerifyPress = async () => {
		setFieldErrors({});

		if (!validateVerificationCode()) {
			return;
		}

		if (!isLoaded) return;

		setLoading(true);

		try {
			const signUpAttempt = await signUp.attemptEmailAddressVerification({
				code,
			});

			if (signUpAttempt.status === "complete") {
				await setActive({ session: signUpAttempt.createdSessionId });
				router.replace("/(drawer)");
			} else {
				console.error(JSON.stringify(signUpAttempt, null, 2));
			}
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
		} finally {
			setLoading(false);
		}
	};

	if (pendingVerification) {
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
							className="text-4xl font-bold text-gray-900 mb-4"
						>
							Verifica tu email
						</Text>

						<Text variant="p" color="tertiary" align="center" className="text-base mb-8">
							Hemos enviado un código de verificación a tu correo electrónico.
						</Text>

						<Input
							label="Código de verificación"
							value={code}
							placeholder="000000"
							onChangeText={(text) => {
								setCode(text);
								if (fieldErrors.code) {
									clearFieldError('code');
								}
							}}
							keyboardType="number-pad"
							className="text-center text-2xl tracking-widest"
							maxLength={6}
							error={fieldErrors.code}
						/>

						<Button
							onPress={onVerifyPress}
							disabled={loading}
							isLoading={loading}
							className="mt-8 mb-6"
						>
							VERIFICAR EMAIL
						</Button>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}

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
				<View className="items-center pt-10 pb-8">
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
						Crear Cuenta
					</Text>

					<View className="flex-row justify-center mb-8 flex-wrap">
						<Text variant="p" color="tertiary" className="text-lg">
							¿Ya tienes una cuenta?{' '}
						</Text>
						<Link href="./sign-in" asChild>
							<TouchableOpacity>
								<Text variant="p" className="text-lg text-orange-500 font-semibold">
									Ingresar
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

					<Text variant="small" color="tertiary" className="mb-6 text-center">
						La contraseña debe tener al menos 8 caracteres
					</Text>

					{/* Sign Up Button */}
					<Button
						onPress={onSignUpPress}
						disabled={loading}
						isLoading={loading}
						className="mt-4 mb-6"
					>
						CREAR CUENTA
					</Button>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

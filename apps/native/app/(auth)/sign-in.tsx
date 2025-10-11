import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { TouchableOpacity, View, ScrollView, Image, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import React, { useState } from "react";
import { Button, Container, Input, PasswordInput, Text } from "@/components/ui";
import { signInSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";

export default function SignInPage() {
	const { signIn, setActive, isLoaded } = useSignIn();
	const router = useRouter();

	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
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
	const onSignInPress = async () => {
		setFieldErrors({});

		if (!validateForm()) {
			return;
		}

		if (!isLoaded) return;

		setLoading(true);

		try {
			const signInAttempt = await signIn.create({
				identifier: emailAddress.trim(),
				password,
			});

			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId });
				router.replace("/(drawer)");
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
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-white"
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			<ScrollView
				className="flex-"
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

					{/* Sign In Button */}
					<Button
						onPress={onSignInPress}
						disabled={loading}
						isLoading={loading}
						className="mt-4 mb-6"
					>
						INGRESAR
					</Button>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

import * as React from "react";
import { TouchableOpacity, View, ScrollView, StatusBar, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, PasswordInput, DateInput, PhoneInput, Text } from "@/components/ui";

export default function SignUpScreen() {
	const { isLoaded, signUp, setActive } = useSignUp();
	const router = useRouter();

	// Form state
	const [formData, setFormData] = React.useState({
		nombres: '',
		apellidos: '',
		email: '',
		fechaNacimiento: '',
		telefono: '',
		countryCode: '+57',
		contrasena: '',
		nombreContactoEmergencia: '',
		telefonoContactoEmergencia: '',
	});

	const [loading, setLoading] = React.useState(false);
	const [pendingVerification, setPendingVerification] = React.useState(false);
	const [code, setCode] = React.useState("");
	const [fieldErrors, setFieldErrors] = React.useState<{
		[key: string]: string;
	}>({});

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));

		// Clear field error when user starts typing
		if (fieldErrors[field]) {
			setFieldErrors(prev => ({
				...prev,
				[field]: '',
			}));
		}
	};

	const validateForm = () => {
		const errors: { [key: string]: string } = {};

		if (!formData.nombres.trim()) {
			errors.nombres = 'El nombre es obligatorio';
		} else if (formData.nombres.trim().length < 2) {
			errors.nombres = 'El nombre debe tener al menos 2 caracteres';
		}

		if (!formData.apellidos.trim()) {
			errors.apellidos = 'El apellido es obligatorio';
		} else if (formData.apellidos.trim().length < 2) {
			errors.apellidos = 'El apellido debe tener al menos 2 caracteres';
		}

		if (!formData.email.trim()) {
			errors.email = 'El correo electrónico es obligatorio';
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email.trim())) {
				errors.email = 'Por favor ingresa un correo electrónico válido';
			}
		}

		if (!formData.contrasena) {
			errors.contrasena = 'La contraseña es obligatoria';
		} else if (formData.contrasena.length < 8) {
			errors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
		}

		if (!formData.fechaNacimiento) {
			errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
		} else if (formData.fechaNacimiento.length < 10) {
			errors.fechaNacimiento = 'Ingresa una fecha válida (DD/MM/AAAA)';
		}

		if (!formData.telefono) {
			errors.telefono = 'El número de teléfono es obligatorio';
		} else if (formData.telefono.length < 10) {
			errors.telefono = 'El número debe tener 10 dígitos';
		}

		if (!formData.nombreContactoEmergencia.trim()) {
			errors.nombreContactoEmergencia = 'El nombre del contacto de emergencia es obligatorio';
		}

		if (!formData.telefonoContactoEmergencia) {
			errors.telefonoContactoEmergencia = 'El teléfono del contacto de emergencia es obligatorio';
		} else if (formData.telefonoContactoEmergencia.length < 10) {
			errors.telefonoContactoEmergencia = 'El número debe tener 10 dígitos';
		}

		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
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
			// Create user with Clerk
			await signUp.create({
				emailAddress: formData.email.trim(),
				password: formData.contrasena,
			});

			// Send verification email
			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

			setPendingVerification(true);
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2));

			if (err.errors && err.errors[0]) {
				const errorMessage = err.errors[0].message;
				const errorCode = err.errors[0].code;

				if (errorCode === 'form_identifier_exists') {
					setFieldErrors({ email: 'Este correo ya está registrado' });
				} else if (errorMessage.toLowerCase().includes('email')) {
					setFieldErrors({ email: errorMessage });
				} else if (errorMessage.toLowerCase().includes('password')) {
					setFieldErrors({ contrasena: errorMessage });
				}
			}
		} finally {
			setLoading(false);
		}
	};

	// Handle submission of verification form
	const onVerifyPress = async () => {
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
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2));
			if (err.errors && err.errors[0]) {
				setFieldErrors({ code: 'Código de verificación incorrecto' });
			}
		} finally {
			setLoading(false);
		}
	};

	const handleGoBack = () => {
		if (pendingVerification) {
			setPendingVerification(false);
		} else {
			router.back();
		}
	};

	// Verification screen
	if (pendingVerification) {
		return (
			<SafeAreaView className="flex-1 bg-yellow-700">
				<StatusBar backgroundColor="#a16207" barStyle="light-content" />
				<KeyboardAvoidingView
					className="flex-1"
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					keyboardVerticalOffset={0}
				>
					{/* Header */}
					<View className="bg-yellow-700 px-5 pt-6 pb-8">
						<TouchableOpacity
							className="mb-5 w-10 h-10 justify-center"
							onPress={handleGoBack}
						>
							<Ionicons name="arrow-back" size={24} color="white" />
						</TouchableOpacity>

						<Text variant="h1" className="text-white text-3xl font-bold mb-2">
							Verificar Email
						</Text>

						<Text className="text-white opacity-80 text-base">
							Ingresa el código que enviamos a tu email
						</Text>
					</View>

					{/* Form */}
					<ScrollView
						className="flex-1 bg-white rounded-t-3xl pt-8 px-5"
						contentContainerStyle={{ paddingBottom: 40 }}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<Input
							value={code}
							onChangeText={setCode}
							placeholder="000000"
							label="Código de verificación"
							keyboardType="number-pad"
							maxLength={6}
							error={fieldErrors.code}
						/>

						<Button
							onPress={onVerifyPress}
							disabled={loading}
							isLoading={loading}
							className="mt-4"
						>
							{loading ? 'VERIFICANDO...' : 'VERIFICAR EMAIL'}
						</Button>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-yellow-700">
			<StatusBar backgroundColor="#a16207" barStyle="light-content" />
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={0}
			>
				{/* Header */}
				<View className="bg-yellow-700 px-5 pt-6 pb-8">
					<TouchableOpacity
						className="mb-5 w-10 h-10 justify-center"
						onPress={handleGoBack}
					>
						<Ionicons name="arrow-back" size={24} color="white" />
					</TouchableOpacity>

					<Text variant="h1" className="text-white text-3xl font-bold mb-2">
						Regístrate
					</Text>

					<View className="flex-row items-center mt-1">
						<Text className="text-white opacity-80 text-base">
							¿Ya tienes una cuenta?
						</Text>
						<Link href="./sign-in" asChild>
							<TouchableOpacity>
								<Text className="text-white text-base font-semibold underline ml-1">
									Ingresar
								</Text>
							</TouchableOpacity>
						</Link>
					</View>
				</View>

				{/* Form */}
				<ScrollView
					className="flex-1 bg-white rounded-t-3xl px-5 pt-8"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 60 }}
					keyboardShouldPersistTaps="handled"
				>
					{/* Nombres y Apellidos */}
					<View className="flex-row gap-3 mb-0">
						<View className="flex-1">
							<Input
								label="Nombres"
								placeholder="Lois"
								value={formData.nombres}
								onChangeText={(text) => handleInputChange('nombres', text)}
								error={fieldErrors.nombres}
								autoCapitalize="words"
							/>
						</View>

						<View className="flex-1">
							<Input
								label="Apellidos"
								placeholder="Becket"
								value={formData.apellidos}
								onChangeText={(text) => handleInputChange('apellidos', text)}
								error={fieldErrors.apellidos}
								autoCapitalize="words"
							/>
						</View>
					</View>

					{/* Email */}
					<Input
						label="Correo Electrónico"
						placeholder="loisbecket@gmail.com"
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						value={formData.email}
						onChangeText={(text) => handleInputChange('email', text)}
						error={fieldErrors.email}
					/>

					{/* Fecha de nacimiento */}
					<DateInput
						label="Fecha de nacimiento"
						placeholder="18/03/2000"
						value={formData.fechaNacimiento}
						onChangeText={(text) => handleInputChange('fechaNacimiento', text)}
						error={fieldErrors.fechaNacimiento}
					/>

					{/* Número de celular */}
					<PhoneInput
						label="Número de celular"
						placeholder="3197293579"
						value={formData.telefono}
						onChangeText={(text) => handleInputChange('telefono', text)}
						countryCode={formData.countryCode}
						onCountryCodeChange={(code) => handleInputChange('countryCode', code)}
						error={fieldErrors.telefono}
					/>

					{/* Contraseña */}
					<PasswordInput
						label="Contraseña"
						placeholder="••••••••"
						value={formData.contrasena}
						onChangeText={(text) => handleInputChange('contrasena', text)}
						error={fieldErrors.contrasena}
					/>

					{/* Datos de contacto de emergencia */}
					<Text className="mt-5 mb-4 text-xl font-bold text-gray-900">
						Datos de contacto de emergencia
					</Text>

					<Input
						label="Nombre del contacto"
						placeholder="María Becket"
						value={formData.nombreContactoEmergencia}
						onChangeText={(text) => handleInputChange('nombreContactoEmergencia', text)}
						error={fieldErrors.nombreContactoEmergencia}
						autoCapitalize="words"
					/>

					<PhoneInput
						label="Teléfono del contacto"
						placeholder="3197293580"
						value={formData.telefonoContactoEmergencia}
						onChangeText={(text) => handleInputChange('telefonoContactoEmergencia', text)}
						countryCode={formData.countryCode}
						error={fieldErrors.telefonoContactoEmergencia}
					/>

					{/* Botón de registro */}
					<Button
						onPress={onSignUpPress}
						disabled={loading}
						isLoading={loading}
						className="mt-3 mb-6"
					>
						REGISTRARSE
					</Button>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

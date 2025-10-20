import * as React from "react";
import { TouchableOpacity, View, ScrollView, StatusBar, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, PasswordInput, DateInput, PhoneInput, Select, Text } from "@/components/ui";
import { useRegisterClient } from "@/hooks/use-client";
import { useActiveBranches } from "@/hooks/use-branches";
import { registerClientSchema, formatZodErrors } from "@/lib/validations/client";

export default function SignUpScreen() {
	const router = useRouter();
	const { isSignedIn } = useAuth();
	const registerClient = useRegisterClient();
	const { branchOptions, isLoading: branchesLoading } = useActiveBranches();
	const {
		loading,
		pendingVerification,
		verificationCode,
		fieldErrors,
		createClerkUser,
		verifyEmailAndCompleteRegistration,
		setVerificationCode,
		setFieldErrors,
		goBackToSignUp,
	} = registerClient;

	// Form state
	const [formData, setFormData] = React.useState({
		nombres: '',
		apellidos: '',
		email: '',
		fechaNacimiento: '',
		telefono: '',
		countryCode: '+57',
		tipoDocumento: 'CC' as 'CC' | 'TI' | 'CE' | 'PASSPORT',
		numeroDocumento: '',
		contrasena: '',
		nombreContactoEmergencia: '',
		telefonoContactoEmergencia: '',
		parentescoContactoEmergencia: '',
		sedeId: '',
	});

	const [localFieldErrors, setLocalFieldErrors] = React.useState<{
		[key: string]: string;
	}>({});

	// Redirigir si ya está autenticado (solo una vez al montar el componente)
	React.useEffect(() => {
		if (isSignedIn) {
			router.replace("/(home)");
		}
	}, []); // Array vacío = solo se ejecuta al montar

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));

		// Clear field error when user starts typing
		if (localFieldErrors[field]) {
			setLocalFieldErrors(prev => ({
				...prev,
				[field]: '',
			}));
		}
		if (fieldErrors[field]) {
			setFieldErrors((prev: { [key: string]: string }) => ({
				...prev,
				[field]: '',
			}));
		}
	};

	// Validar un campo específico cuando pierde el foco
	const validateField = (field: string) => {
		try {
			// Validar solo el campo específico
			registerClientSchema.pick({ [field]: true } as any).parse({ [field]: formData[field as keyof typeof formData] });

			// Si la validación es exitosa, limpiar el error
			setLocalFieldErrors(prev => ({
				...prev,
				[field]: '',
			}));
		} catch (error: any) {
			// Si hay error, mostrar el mensaje
			if (error?.issues && error.issues.length > 0) {
				setLocalFieldErrors(prev => ({
					...prev,
					[field]: error.issues[0].message,
				}));
			}
		}
	};

	const validateForm = () => {
		try {
			// Validar con Zod
			registerClientSchema.parse(formData);
			setLocalFieldErrors({});
			return true;
		} catch (error: any) {
			// Verificar si es un error de Zod
			if (error?.issues) {
				const errors = formatZodErrors(error);
				setLocalFieldErrors(errors);
				return false;
			}
			return false;
		}
	};

	// Handle submission of sign-up form
	const onSignUpPress = async () => {
		setLocalFieldErrors({});
		setFieldErrors({});

		if (!validateForm()) {
			return;
		}

		try {
			await createClerkUser(formData);
		} catch (err) {
			console.error("Error en registro:", err);
		}
	};

	// Handle submission of verification form
	const onVerifyPress = async () => {
		try {
			const result = await verifyEmailAndCompleteRegistration(verificationCode);

			if (result.success) {
				// Navegamos a la pantalla principal
				router.replace("/(home)");
			}
		} catch (err) {
			console.error("Error en verificación:", err);
		}
	};

	const handleGoBack = () => {
		if (pendingVerification) {
			goBackToSignUp();
		} else {
			router.back();
		}
	};

	// Combinar errores locales y del hook
	const allErrors = { ...localFieldErrors, ...fieldErrors };

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
							value={verificationCode}
							onChangeText={(text) => {
								setVerificationCode(text);
								if (fieldErrors.code) {
									setFieldErrors((prev: { [key: string]: string }) => ({ ...prev, code: '' }));
								}
							}}
							placeholder="000000"
							label="Código de verificación"
							keyboardType="number-pad"
							maxLength={6}
							error={allErrors.code}
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
						<Link href="/(auth)/sign-in" asChild>
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
								onBlur={() => validateField('nombres')}
								error={allErrors.nombres}
								autoCapitalize="words"
							/>
						</View>

						<View className="flex-1">
							<Input
								label="Apellidos"
								placeholder="Becket"
								value={formData.apellidos}
								onChangeText={(text) => handleInputChange('apellidos', text)}
								onBlur={() => validateField('apellidos')}
								error={allErrors.apellidos}
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
						onBlur={() => validateField('email')}
						error={allErrors.email}
					/>

					{/* Fecha de nacimiento */}
					<DateInput
						label="Fecha de nacimiento"
						placeholder="18/03/2000"
						value={formData.fechaNacimiento}
						onChangeText={(text) => handleInputChange('fechaNacimiento', text)}
						onBlur={() => validateField('fechaNacimiento')}
						error={allErrors.fechaNacimiento}
					/>

					{/* Número de celular */}
					<PhoneInput
						label="Número de celular"
						placeholder="3197293579"
						value={formData.telefono}
						onChangeText={(text) => handleInputChange('telefono', text)}
						onBlur={() => validateField('telefono')}
						countryCode={formData.countryCode}
						onCountryCodeChange={(code) => handleInputChange('countryCode', code)}
						error={allErrors.telefono}
					/>

					{/* Tipo de documento */}
					<Select
						label="Tipo de documento"
						value={formData.tipoDocumento}
						onValueChange={(value) => handleInputChange('tipoDocumento', value)}
						options={[
							{ label: 'Cédula de Ciudadanía', value: 'CC' },
							{ label: 'Tarjeta de Identidad', value: 'TI' },
							{ label: 'Cédula de Extranjería', value: 'CE' },
							{ label: 'Pasaporte', value: 'PASSPORT' },
						]}
						error={allErrors.tipoDocumento}
					/>

					{/* Número de documento */}
					<Input
						label="Número de documento"
						placeholder="1234567890"
						keyboardType="default"
						autoCapitalize="characters"
						value={formData.numeroDocumento}
						onChangeText={(text) => handleInputChange('numeroDocumento', text)}
						onBlur={() => validateField('numeroDocumento')}
						error={allErrors.numeroDocumento}
					/>

					{/* Contraseña */}
					<PasswordInput
						label="Contraseña"
						placeholder="••••••••"
						value={formData.contrasena}
						onChangeText={(text) => handleInputChange('contrasena', text)}
						onBlur={() => validateField('contrasena')}
						error={allErrors.contrasena}
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
						onBlur={() => validateField('nombreContactoEmergencia')}
						error={allErrors.nombreContactoEmergencia}
						autoCapitalize="words"
					/>

					<PhoneInput
						label="Teléfono del contacto"
						placeholder="3197293580"
						value={formData.telefonoContactoEmergencia}
						onChangeText={(text) => handleInputChange('telefonoContactoEmergencia', text)}
						onBlur={() => validateField('telefonoContactoEmergencia')}
						countryCode={formData.countryCode}
						error={allErrors.telefonoContactoEmergencia}
					/>

					<Input
						label="Parentesco"
						placeholder="Madre, Padre, Hermano/a, Esposo/a, etc."
						value={formData.parentescoContactoEmergencia}
						onChangeText={(text) => handleInputChange('parentescoContactoEmergencia', text)}
						onBlur={() => validateField('parentescoContactoEmergencia')}
						error={allErrors.parentescoContactoEmergencia}
						autoCapitalize="words"
					/>

					{/* Sede preferida */}
					<Text className="mt-5 mb-4 text-xl font-bold text-gray-900">
						Sede de preferencia
					</Text>

					<Select
						label="¿A qué sede te gustaría asistir?"
						value={formData.sedeId}
						onValueChange={(value) => handleInputChange('sedeId', value)}
						options={branchOptions}
						placeholder={branchesLoading ? "Cargando sedes..." : "Selecciona una sede"}
						error={allErrors.sedeId}
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

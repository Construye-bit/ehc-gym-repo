import { Stack } from "expo-router";

export default function AuthRoutesLayout() {
	// No hacemos ninguna redirección aquí
	// Las pantallas individuales (sign-in, sign-up, etc.) manejarán 
	// su propia lógica si el usuario ya está autenticado
	
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		/>
	);
}

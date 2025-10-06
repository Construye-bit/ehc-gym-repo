import * as React from "react";
import { Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Container } from "@/components/container";

export default function SignUpScreen() {
	const { isLoaded, signUp, setActive } = useSignUp();
	const router = useRouter();

	const [emailAddress, setEmailAddress] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [pendingVerification, setPendingVerification] = React.useState(false);
	const [code, setCode] = React.useState("");

	// Handle submission of sign-up form
	const onSignUpPress = async () => {
		if (!isLoaded) return;

		// Start sign-up process using email and password provided
		try {
			await signUp.create({
				emailAddress,
				password,
			});

			// Send user an email with verification code
			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

			// Set 'pendingVerification' to true to display second form
			// and capture OTP code
			setPendingVerification(true);
		} catch (err) {
			// See https://clerk.com/docs/custom-flows/error-handling
			// for more info on error handling
			console.error(JSON.stringify(err, null, 2));
		}
	};

	// Handle submission of verification form
	const onVerifyPress = async () => {
		if (!isLoaded) return;

		try {
			// Use the code the user provided to attempt verification
			const signUpAttempt = await signUp.attemptEmailAddressVerification({
				code,
			});

			// If verification was completed, set the session to active
			// and redirect the user
			if (signUpAttempt.status === "complete") {
				await setActive({ session: signUpAttempt.createdSessionId });
				router.replace("/");
			} else {
				// If the status is not complete, check why. User may need to
				// complete further steps.
				console.error(JSON.stringify(signUpAttempt, null, 2));
			}
		} catch (err) {
			// See https://clerk.com/docs/custom-flows/error-handling
			// for more info on error handling
			console.error(JSON.stringify(err, null, 2));
		}
	};

	if (pendingVerification) {
		return (
			<Container>
				<ScrollView showsVerticalScrollIndicator={false} className="flex-1">
					<View className="flex-1 justify-center px-6">
						<View className="bg-card border border-border rounded-xl p-6 shadow-sm">
							<Text className="text-foreground text-2xl font-bold text-center mb-6">Verify your email</Text>
							<Text className="text-muted-foreground text-center mb-6">We've sent a verification code to your email address.</Text>

							<TextInput
								value={code}
								placeholder="Enter verification code"
								placeholderTextColor="#9CA3AF"
								onChangeText={(code) => setCode(code)}
								className="bg-background border border-border rounded-lg px-4 py-3 text-foreground mb-4"
								keyboardType="number-pad"
								textAlign="center"
							/>

							<TouchableOpacity onPress={onVerifyPress} className="bg-primary rounded-lg py-3 px-6">
								<Text className="text-primary-foreground font-semibold text-center">Verify Email</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</Container>
		);
	}

	return (
		<Container>
			<ScrollView showsVerticalScrollIndicator={false} className="flex-1">
				<View className="flex-1 justify-center px-6">
					<View className="bg-card border border-border rounded-xl p-6 shadow-sm">
						<Text className="text-foreground text-2xl font-bold text-center mb-6">Create Account</Text>
						<Text className="text-muted-foreground text-center mb-6">Sign up to get started with your account</Text>

						<View className="mb-4">
							<Text className="text-foreground font-medium mb-2">Email</Text>
							<TextInput
								autoCapitalize="none"
								value={emailAddress}
								placeholder="Enter your email"
								placeholderTextColor="#9CA3AF"
								onChangeText={(email) => setEmailAddress(email)}
								className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
								keyboardType="email-address"
							/>
						</View>

						<View className="mb-6">
							<Text className="text-foreground font-medium mb-2">Password</Text>
							<TextInput
								value={password}
								placeholder="Enter your password"
								placeholderTextColor="#9CA3AF"
								secureTextEntry={true}
								onChangeText={(password) => setPassword(password)}
								className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
							/>
						</View>

						<TouchableOpacity onPress={onSignUpPress} className="bg-primary rounded-lg py-3 px-6 mb-6">
							<Text className="text-primary-foreground font-semibold text-center">Create Account</Text>
						</TouchableOpacity>

						<View className="flex-row justify-center items-center gap-2">
							<Text className="text-muted-foreground">Already have an account?</Text>
							<Link href="/sign-in">
								<Text className="text-primary font-medium">Sign in</Text>
							</Link>
						</View>
					</View>
				</View>
			</ScrollView>
		</Container>
	);
}

import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import React from "react";
import { Container } from "@/components/container";

export default function Page() {
	const { signIn, setActive, isLoaded } = useSignIn();
	const router = useRouter();

	const [emailAddress, setEmailAddress] = React.useState("");
	const [password, setPassword] = React.useState("");

	// Handle the submission of the sign-in form
	const onSignInPress = async () => {
		if (!isLoaded) return;

		// Start the sign-in process using the email and password provided
		try {
			const signInAttempt = await signIn.create({
				identifier: emailAddress,
				password,
			});

			// If sign-in process is complete, set the created session as active
			// and redirect the user
			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId });
				router.replace("/");
			} else {
				// If the status isn't complete, check why. User might need to
				// complete further steps.
				console.error(JSON.stringify(signInAttempt, null, 2));
			}
		} catch (err) {
			// See https://clerk.com/docs/custom-flows/error-handling
			// for more info on error handling
			console.error(JSON.stringify(err, null, 2));
		}
	};

	return (
		<Container>
			<ScrollView showsVerticalScrollIndicator={false} className="flex-1">
				<View className="flex-1 justify-center px-6">
					<View className="bg-card border border-border rounded-xl p-6 shadow-sm">
						<Text className="text-foreground text-2xl font-bold text-center mb-6">Welcome Back</Text>
						<Text className="text-muted-foreground text-center mb-6">Sign in to your account to continue</Text>

						<View className="mb-4">
							<Text className="text-foreground font-medium mb-2">Email</Text>
							<TextInput
								autoCapitalize="none"
								value={emailAddress}
								placeholder="Enter your email"
								placeholderTextColor="#9CA3AF"
								onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
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

						<TouchableOpacity onPress={onSignInPress} className="bg-primary rounded-lg py-3 px-6 mb-6">
							<Text className="text-primary-foreground font-semibold text-center">Sign In</Text>
						</TouchableOpacity>

						<View className="flex-row justify-center items-center gap-2">
							<Text className="text-muted-foreground">Don't have an account?</Text>
							<Link href="/sign-up">
								<Text className="text-primary font-medium">Sign up</Text>
							</Link>
						</View>
					</View>
				</View>
			</ScrollView>
		</Container>
	);
}

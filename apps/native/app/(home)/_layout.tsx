import { useRouter, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";

export default function HomeRoutesLayout() {
    const { isSignedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isSignedIn) {
            router.replace("/(auth)/sign-in");
        }
    }, [isSignedIn, router]);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}

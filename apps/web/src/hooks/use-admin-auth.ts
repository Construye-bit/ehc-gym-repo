import { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useClerk, useUser } from "@clerk/clerk-react";
import type { SignInResource } from "@clerk/types";

export interface UseAdminAuthReturn {
    login: (redirectUrl?: string) => Promise<void>;
    loginWithCredentials: (email: string, password: string, redirectUrl?: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    user: ReturnType<typeof useUser>["user"];
    adminData: { clerk_id: string } | null;
}

export function useAdminAuth(): UseAdminAuthReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { signOut, openSignIn, client } = useClerk();
    const { user, isSignedIn, isLoaded } = useUser();

    // (Ya está implementado arriba, eliminar duplicados)

    // Login with Clerk's UI (fallback)
    const login = useCallback(async (redirectUrl?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await openSignIn({ redirectUrl: redirectUrl || "/admin" });
        } catch (err) {
            setError("Error during sign in");
        } finally {
            setIsLoading(false);
        }
    }, [openSignIn]);

    // Login with email and password (custom form)
    const loginWithCredentials = useCallback(
        async (email: string, password: string, redirectUrl?: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const anyWindow = window as any;
                const clerkClient = client || (anyWindow.Clerk && anyWindow.Clerk.client);
                if (!clerkClient) throw new Error("Clerk client not available");
                const signIn: SignInResource = await clerkClient.signIn.create({ identifier: email, password });
                if (signIn.status === "complete") {
                    if (anyWindow.Clerk && typeof anyWindow.Clerk.setActive === "function") {
                        await anyWindow.Clerk.setActive({ session: signIn.createdSessionId });
                    }
                    // Solo redirigir si se proporciona redirectUrl explícitamente
                    if (redirectUrl) {
                        navigate({ to: redirectUrl });
                    }
                    // Si no hay redirectUrl, no redirigir - dejar que el componente lo maneje
                } else {
                    setError("Verifica tus credenciales e inténtalo de nuevo.");
                }
            } catch (err: any) {
                setError(err?.errors?.[0]?.message || err?.message || "Error al iniciar sesión");
            } finally {
                setIsLoading(false);
            }
        },
        [client, navigate]
    );

    // Logout using Clerk
    const logout = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signOut();
            navigate({ to: "/auth/login" });
        } catch (err) {
            setError("Error during sign out");
        } finally {
            setIsLoading(false);
        }
    }, [signOut, navigate]);

    return {
        login,
        loginWithCredentials,
        logout,
        isAuthenticated: !!isSignedIn,
        isLoading: isLoading || !isLoaded,
        error,
        user,
        adminData: user?.id ? { clerk_id: user.id } : null,
    };
}
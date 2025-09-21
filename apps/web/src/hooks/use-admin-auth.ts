import { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";

interface LoginCredentials {
    username: string;
    password: string;
}

interface UseAdminAuthReturn {
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: () => boolean;
    isLoading: boolean;
    error: string | null;
}

export function useAdminAuth(): UseAdminAuthReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const login = useCallback(async ({ username, password }: LoginCredentials): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            // Aquí iría tu lógica de autenticación real
            // Por ejemplo, una llamada a tu API
            if (username === "admin" && password === "123456") {
                localStorage.setItem("adminToken", "admin-authenticated");
                return true;
            } else {
                setError("Credenciales incorrectas");
                return false;
            }
        } catch (err) {
            setError("Error al iniciar sesión");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("adminToken");
        navigate({ to: "/admin/login" });
    }, [navigate]);

    const isAuthenticated = useCallback((): boolean => {
        return localStorage.getItem("adminToken") === "admin-authenticated";
    }, []);

    return {
        login,
        logout,
        isAuthenticated,
        isLoading,
        error
    };
}
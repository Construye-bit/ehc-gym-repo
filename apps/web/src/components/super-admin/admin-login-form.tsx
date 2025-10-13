import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { AdminLoginBackground } from "./admin-login-background";
import { ForgotPasswordLink } from "./forgot-password-link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useAuth } from "@/hooks/use-auth";

interface AdminLoginFormProps {
    onLoginSuccess?: () => void;
}

export function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { loginWithCredentials, isLoading: authLoading, error } = useAdminAuth();
    const { isSuperAdmin, isAdmin, isTrainer, isClient, isLoading: roleLoading } = useAuth();
    const navigate = useNavigate();

    // Redirigir según el rol después del login
    useEffect(() => {
        if (!roleLoading && !authLoading) {
            if (isTrainer || isClient) {
                // Clientes y entrenadores van a la página de descarga de app
                navigate({ to: "/redirect-to-mobile" });
            } else if (isSuperAdmin) {
                // Super admin va a su dashboard
                navigate({ to: "/super-admin/dashboard" });
            } else if (isAdmin) {
                // Admin normal va a su dashboard
                navigate({ to: "/admin" });
            }
        }
    }, [isSuperAdmin, isAdmin, isTrainer, isClient, roleLoading, authLoading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // No especificar redirectUrl aquí, el useEffect se encargará de la redirección
        await loginWithCredentials(username, password);
        onLoginSuccess?.();
    };

    return (
        <AdminLoginBackground>
            <div className="w-full max-w-md mx-4">
                <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                            Panel De Gerente
                        </CardTitle>
                        <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                            "EHC GYM"
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-gray-700">
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="username"
                                    type="email"
                                    placeholder="Correo electrónico"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-12 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-black"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700">
                                    Contraseña
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-10 text-black"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={authLoading}
                                className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                {authLoading ? "Ingresando..." : "Acceder"}
                            </Button>

                            <ForgotPasswordLink />
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLoginBackground>
    );
}
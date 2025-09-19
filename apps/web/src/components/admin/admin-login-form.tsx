import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { AdminLoginBackground } from "./admin-login-background";
import { ForgotPasswordLink } from "./forgot-password-link";

interface AdminLoginFormProps {
    onLoginSuccess?: () => void;
}

export function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Aquí puedes agregar tu lógica de autenticación
            if (username === "admin" && password === "123456") {
                localStorage.setItem("adminToken", "admin-authenticated");
                onLoginSuccess?.();
                navigate({ to: "/admin/dashboard" });
            } else {
                setError("Credenciales incorrectas");
            }
        } catch (err) {
            setError("Error al iniciar sesión");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLoginBackground>
            <div className="w-full max-w-md mx-4">
                <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                            Panel De Administrador
                        </CardTitle>
                        <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                            "EHC GYM"
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-gray-700">
                                    Nombre de Usuario
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Nombre de Usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-12 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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
                                        className="h-12 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-10"
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
                                disabled={isLoading}
                                className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                {isLoading ? "Ingresando..." : "Acceder"}
                            </Button>

                            <ForgotPasswordLink />
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLoginBackground>
    );
}
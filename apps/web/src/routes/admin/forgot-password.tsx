import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from 'react';
import { useAuth, useClerk, useSignIn } from '@clerk/clerk-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/forgot-password")({
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [successfulCreation, setSuccessfulCreation] = useState(false);
    const [secondFactor, setSecondFactor] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { user } = useClerk();
    const { isSignedIn } = useAuth();
    const { isLoaded, signIn, setActive } = useSignIn();

    useEffect(() => {
        if (isSignedIn) {
            navigate({ to: "/admin/dashboard" });
        }
    }, [isSignedIn, navigate]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <span className="text-muted-foreground">Cargando...</span>
                </div>
            </div>
        );
    }

    // Enviar el código de restablecimiento al email del usuario
    async function create(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await signIn?.create({
                strategy: 'reset_password_email_code',
                identifier: email,
            });
            setSuccessfulCreation(true);
        } catch (err: any) {
            console.error('Error:', err?.errors?.[0]?.longMessage);
            setError(err?.errors?.[0]?.longMessage || 'Error al enviar el código');
        } finally {
            setIsLoading(false);
        }
    }

    // Restablecer la contraseña del usuario
    async function reset(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn?.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
                password,
            });

            if (result?.status === 'needs_second_factor') {
                setSecondFactor(true);
            } else if (result?.status === 'complete') {
                await setActive?.({
                    session: result.createdSessionId,
                });
                navigate({ to: "/admin/dashboard" });
            }
        } catch (err: any) {
            console.error('Error:', err?.errors?.[0]?.longMessage);
            setError(err?.errors?.[0]?.longMessage || 'Error al restablecer contraseña');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {!successfulCreation ? '¿Olvidó su contraseña?' : 'Restablecer contraseña'}
                    </h1>
                    <p className="text-gray-600">
                        {!successfulCreation
                            ? 'Ingrese su email para recibir un código de restablecimiento'
                            : 'Ingrese el código que recibió por email y su nueva contraseña'
                        }
                    </p>
                </div>

                <form onSubmit={!successfulCreation ? create : reset} className="space-y-4">
                    {!successfulCreation && (
                        <>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Enviando...' : 'Enviar código de restablecimiento'}
                            </Button>
                        </>
                    )}

                    {successfulCreation && (
                        <>
                            <div className="space-y-2">
                                <label htmlFor="code" className="text-sm font-medium text-gray-700">
                                    Código de restablecimiento
                                </label>
                                <input
                                    id="code"
                                    type="text"
                                    placeholder="Ingrese el código recibido"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Nueva contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Ingrese su nueva contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
                            </Button>
                        </>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {secondFactor && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-700 text-sm">
                                Se requiere autenticación de dos factores. Esta funcionalidad estará disponible próximamente.
                            </p>
                        </div>
                    )}
                </form>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/admin/login" })}
                        className="text-gray-600 hover:text-yellow-500 text-sm transition-colors"
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </Card>
        </div>
    );
}
import { Loader2, Shield, Settings } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminPageLoaderProps {
    message?: string;
}

export function AdminPageLoader({ message }: AdminPageLoaderProps) {
    const [progress, setProgress] = useState(0);

    // Simular progreso de carga
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-scale-in">
                {/* Admin icon */}
                <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                            <Shield size={36} className="text-gray-900" />
                        </div>
                        {/* Spinning border */}
                        <div className="absolute inset-0 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
                    </div>
                </div>

                {/* Loading content */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Panel del administrador
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {message || "Cargando datos del sistema..."}
                    </p>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Progress percentage */}
                    <p className="text-sm text-gray-500 mb-4">
                        {Math.round(progress)}% completado
                    </p>

                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    </div>
                </div>

                {/* Settings icon */}
                <div className="flex justify-center mt-6">
                    <Settings size={24} className="text-gray-400 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
            </div>
        </div>
    );
}
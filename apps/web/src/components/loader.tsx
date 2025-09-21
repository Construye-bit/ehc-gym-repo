import { Loader2, Dumbbell } from "lucide-react";

interface LoaderProps {
    message?: string;
    variant?: 'default' | 'gym' | 'minimal';
}

export default function Loader({ message, variant = 'default' }: LoaderProps) {
    if (variant === 'gym') {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 flex flex-col items-center justify-center z-50">
                <div className="relative">
                    {/* Gimnasio animation */}
                    <div className="flex items-center justify-center mb-4">
                        <div className="animate-bounce">
                            <Dumbbell size={48} className="text-yellow-500" />
                        </div>
                    </div>
                    
                    {/* Spinning loader */}
                    <div className="flex items-center justify-center">
                        <Loader2 size={32} className="animate-spin text-yellow-600" />
                    </div>
                </div>
                
                {/* Loading text */}
                <div className="mt-6 text-center">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                        {message || "Cargando..."}
                    </p>
                    <p className="text-sm text-gray-600">
                        Preparando tu experiencia EHC Gym
                    </p>
                </div>

                {/* Progress bar animation */}
                <div className="mt-4 w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className="flex h-full items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="animate-spin text-yellow-500" />
                    {message && (
                        <p className="text-sm text-gray-600">{message}</p>
                    )}
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className="flex h-full items-center justify-center pt-8">
            <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-yellow-500" />
                {message && (
                    <p className="text-sm font-medium text-gray-700">{message}</p>
                )}
            </div>
        </div>
    );
}
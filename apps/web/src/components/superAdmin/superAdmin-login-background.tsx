import { type ReactNode } from "react";

interface AdminLoginBackgroundProps {
    children: ReactNode;
    backgroundImage?: string;
}

export function SuperAdminLoginBackground({ 
    children, 
    backgroundImage = "/gym-background.png" 
}: AdminLoginBackgroundProps) {
    return (
        <div 
            className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
            style={{
                backgroundImage: `url('${backgroundImage}')`
            }}
        >
            
            {/* Contenedor del contenido */}
            <div className="relative z-10 flex items-center justify-center min-h-screen w-full">
                {children}
            </div>
        </div>
    );
}
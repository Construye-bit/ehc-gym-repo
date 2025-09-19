import { Button } from "@/components/ui/button";
import { LogOut, User, ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminDashboardHeaderProps {
    onLogout: () => void;
}

export function AdminDashboardHeader({ onLogout }: AdminDashboardHeaderProps) {
    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/admin/dashboard">
                            <img 
                                src="/logo-ehc-gym.png" 
                                alt="EHC GYM Logo" 
                                className="w-16 h-16 object-contain hover:opacity-90 transition-opacity"
                            />
                        </Link>
                        <div className="ml-4 hidden sm:block">
                            <h2 className="text-xl font-bold text-gray-900">Panel de Administrador</h2>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link 
                            to="/admin/sedes"
                            className="text-gray-700 hover:text-yellow-600 font-medium transition-colors"
                        >
                            Sedes
                        </Link>
                        <a href="#entrenadores" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
                            Entrenadores
                        </a>
                        <a href="#sistema" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
                            Sistema
                        </a>
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <User size={16} className="text-white" />
                                    </div>
                                    <ChevronDown size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onLogout}>
                                    <LogOut size={16} />
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}
import { Button } from "@/components/ui/button";
import { User, ChevronDown, LogOut } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminAuth } from "@/hooks/use-admin-auth";

type AdminType = "admin" | "super-admin";

interface AdminHeaderProps {
    type: AdminType;
}

interface NavLink {
    to: string;
    label: string;
    pathPrefix: string;
}

const NAV_LINKS: Record<AdminType, NavLink[]> = {
    admin: [
        { to: "/admin/sedes", label: "Sedes", pathPrefix: "/admin/sedes" },
        { to: "/admin/clients", label: "Clientes", pathPrefix: "/admin/clients" },
        { to: "/admin/trainers", label: "Entrenadores", pathPrefix: "/admin/trainers" },
    ],
    "super-admin": [
        { to: "/super-admin/sedes", label: "Sedes", pathPrefix: "/super-admin/sedes" },
        { to: "/super-admin/trainers", label: "Entrenadores", pathPrefix: "/super-admin/trainers" },
        { to: "/super-admin/administrators", label: "Administradores", pathPrefix: "/super-admin/administrators" },
    ],
};

const TITLES: Record<AdminType, string> = {
    admin: "Panel del Administrador",
    "super-admin": "Panel del Gerente",
};

const HOME_LINKS: Record<AdminType, string> = {
    admin: "/admin",
    "super-admin": "/super-admin/dashboard",
};

export function AdminHeader({ type }: AdminHeaderProps) {
    const { state } = useRouter();
    const pathname = state.location.pathname;
    const { logout } = useAdminAuth();

    const navLinks = NAV_LINKS[type];
    const title = TITLES[type];
    const homeLink = HOME_LINKS[type];

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to={homeLink}>
                            <img
                                src="/logo-ehc-gym.png"
                                alt="EHC GYM Logo"
                                className="w-16 h-16 object-contain hover:opacity-90 transition-opacity"
                            />
                        </Link>
                        <div className="ml-4 hidden sm:block">
                            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={
                                    `font-medium transition-colors px-2 py-1 rounded-lg ` +
                                    (pathname.startsWith(link.pathPrefix)
                                        ? "bg-yellow-400 text-white"
                                        : "text-gray-700 hover:text-yellow-600")
                                }
                            >
                                {link.label}
                            </Link>
                        ))}
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
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut size={16} className="mr-2" />
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

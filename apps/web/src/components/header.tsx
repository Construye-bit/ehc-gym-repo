import { Button } from "@/components/ui/button";
import { LogOut, User, ChevronDown } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminAuth } from "@/hooks/use-admin-auth";


interface AdminDashboardHeaderProps {
	onLogout?: () => void;
}

export function AdminDashboardHeader({ onLogout }: AdminDashboardHeaderProps) {
	const { state } = useRouter();
	const pathname = state.location.pathname;
	const { logout } = useAdminAuth();

	const handleLogout = async () => {
		await logout();
		// onLogout();
	};


	return (
		<header className="bg-white shadow-sm border-b">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					{/* Logo */}
					<div className="flex items-center">
						<Link to="/super-admin/dashboard">
							<img
								src="/logo-ehc-gym.png"
								alt="EHC GYM Logo"
								className="w-16 h-16 object-contain hover:opacity-90 transition-opacity"
							/>
						</Link>
						<div className="ml-4 hidden sm:block">
							<h2 className="text-xl font-bold text-gray-900">Panel del Gerente</h2>
						</div>
					</div>

					{/* Navigation */}
					<nav className="hidden md:flex items-center space-x-8">
						<Link
							to="/super-admin/sedes"
							className={
								`font-medium transition-colors px-2 py-1 rounded-lg ` +
								(pathname.startsWith("/super-admin/sedes")
									? "bg-yellow-400 text-white"
									: "text-gray-700 hover:text-yellow-600")
							}
						>
							Sedes
						</Link>
						<Link
							to="/super-admin/trainers"
							className={
								`font-medium transition-colors px-2 py-1 rounded-lg ` +
								(pathname.startsWith("/super-admin/trainers")
									? "bg-yellow-400 text-white"
									: "text-gray-700 hover:text-yellow-600")
							}
						>
							Entrenadores
						</Link>
						<Link
							to="/super-admin/administrators"
							className={
								`font-medium transition-colors px-2 py-1 rounded-lg ` +
								(pathname.startsWith("/super-admin/administrators")
									? "bg-yellow-400 text-white"
									: "text-gray-700 hover:text-yellow-600")
							}
						>
							Administradores
						</Link>
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
								<DropdownMenuItem onClick={() => handleLogout()}>
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

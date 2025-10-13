import { createFileRoute, Link } from "@tanstack/react-router";
import { Smartphone, Download, QrCode, Star, Users, Dumbbell, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

			{/* Hero Section */}
			<div className="relative overflow-hidden">
				{/* Decorative elements */}
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-200 to-yellow-200 rounded-full opacity-20 blur-3xl"></div>

				<div className="relative max-w-7xl mx-auto px-6 pt-8 h-screen">
					<div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
						{/* Left Content */}
						<div className="space-y-8">
							<div className="space-y-6">
								<div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
									<Star className="w-4 h-4" />
									Nueva experiencia de entrenamiento
								</div>

								<h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
									EHC GYM App
									<span className="block text-yellow-500 mt-2">Tu gimnasio en el bolsillo</span>
								</h1>

								<p className="text-xl text-gray-600 leading-relaxed max-w-lg">
									Entrena donde quieras con rutinas personalizadas, reserva turnos al instante y lleva el control completo de tu progreso físico.
								</p>
							</div>

							{/* Features */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
									<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
										<Dumbbell className="w-5 h-5 text-blue-600" />
									</div>
									<div>
										<p className="font-semibold text-gray-900 text-sm">Rutinas</p>
										<p className="text-gray-600 text-xs">Personalizadas</p>
									</div>
								</div>

								<div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
									<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
										<Clock className="w-5 h-5 text-green-600" />
									</div>
									<div>
										<p className="font-semibold text-gray-900 text-sm">Turnos</p>
										<p className="text-gray-600 text-xs">Reserva fácil</p>
									</div>
								</div>

								<div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
									<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
										<Users className="w-5 h-5 text-purple-600" />
									</div>
									<div>
										<p className="font-semibold text-gray-900 text-sm">Progreso</p>
										<p className="text-gray-600 text-xs">Seguimiento</p>
									</div>
								</div>
							</div>
						</div>

						{/* Right Content - Phone Image */}
						<div className="flex justify-center lg:justify-end">
							<div className="relative">
								<img
									src="/phone_app.webp"
									alt="EHC GYM App en teléfonos móviles"
									className="w-full max-w-md lg:max-w-lg xl:max-w-xl h-auto"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Download Section */}
			<div className="bg-white backdrop-blur-sm border-t border-white/20">
				<div className="max-w-4xl mx-auto px-6 py-16">
					<div className="text-center space-y-8">
						<div className="space-y-4">
							<h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
								Descarga la app y comienza hoy
							</h2>
							<p className="text-gray-600 max-w-2xl mx-auto">
								Únete a los usuarios que ya transformaron su experiencia de entrenamiento con EHC GYM App
							</p>
						</div>

						{/* Download options */}
						<div className="flex flex-col sm:flex-row items-center justify-center gap-6">
							{/* QR Code */}
							<div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
								<QRCodeSVG
									value={import.meta.env.VITE_URL_APK_APP || "https://example.com"}
									size={128}
									level="H"
									marginSize={1}
									title="Código QR para descargar EHC GYM App"
								/>
								<p className="text-sm font-medium text-gray-700 mt-3">Escanea para descargar</p>
							</div>							{/* Download buttons */}
						</div>

					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="bg-gray-900 text-white">
				<div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
					<div className="text-center space-y-4">
						<div className="flex items-center justify-center gap-2">
							<Dumbbell className="w-6 h-6 text-yellow-500" />
							<span className="text-xl font-bold">EHC GYM</span>
						</div>
						<p className="text-gray-400">
							¿Tienes dudas? Contáctanos en{" "}
							<a href="mailto:aguirretenjo@gmail.com" className="text-yellow-400 hover:text-yellow-300 transition-colors">
								aguirretenjo@gmail.com
							</a>
						</p>
					</div>

					{/* Admin Login Link */}
					<div className="top-4 right-4 z-10">
						<Link
							to="/super-admin/login"
							className="flex items-center gap-2 px-4 py-2 bg-yellow-500/90 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg backdrop-blur-sm"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							Acceso Admin
						</Link>
					</div>

				</div>
				<div className="mx-auto py-6 border-t border-gray-800 text-center">
					<p className="text-sm text-gray-500">
						© 2025 EHC GYM. Todos los derechos reservados.
					</p>
				</div>
			</footer>
		</div>
	);
}
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Smartphone,
	Download,
	QrCode,
	Star,
	Users,
	Dumbbell,
	Clock,
	HeartPulse,
	MessageCircle,
	ShieldCheck,
	ChevronRight,
	Check,
	Sparkles,
	Target,
	Flame,
	Apple,
	Menu,
	X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

const features = [
	{
		icon: Dumbbell,
		title: "Rutinas personalizadas",
		description:
			"Planes de entrenamiento adaptados a tus objetivos, nivel y equipo disponible. Tu coach digital los ajusta en tiempo real.",
		color: "bg-yellow-100 text-yellow-600",
	},
	{
		icon: MessageCircle,
		title: "Coach con IA 24/7",
		description:
			"Un asistente virtual inteligente que responde tus dudas, diseña rutinas y te motiva cuando más lo necesitas.",
		color: "bg-blue-100 text-blue-600",
	},
	{
		icon: HeartPulse,
		title: "Control de tu progreso",
		description:
			"Registra peso, IMC, grasa corporal y métricas de salud. Visualiza tu evolución con gráficos claros y motivadores.",
		color: "bg-green-100 text-green-600",
	},
	{
		icon: Clock,
		title: "Reserva de turnos",
		description:
			"Reserva tu espacio en la sede al instante y evita esperas. Controla la capacidad en tiempo real desde tu bolsillo.",
		color: "bg-purple-100 text-purple-600",
	},
	{
		icon: Users,
		title: "Conecta con entrenadores",
		description:
			"Explora el catálogo de entrenadores, contrata sesiones y chatea directamente con tu coach humano.",
		color: "bg-orange-100 text-orange-600",
	},
	{
		icon: ShieldCheck,
		title: "Datos seguros",
		description:
			"Tu información personal y de salud está protegida con autenticación segura y cifrado de extremo a extremo.",
		color: "bg-teal-100 text-teal-600",
	},
];

const steps = [
	{
		number: "01",
		title: "Descarga la app",
		description:
			"Escanea el código QR y descarga EHC GYM App en Android.",
	},
	{
		number: "02",
		title: "Crea tu perfil",
		description:
			"Registra tus datos, objetivos y preferencias de entrenamiento en minutos.",
	},
	{
		number: "03",
		title: "Empieza a entrenar",
		description:
			"Recibe rutinas personalizadas, reserva turnos y sigue tu progreso desde el primer día.",
	},
];

const faqs = [
	{
		question: "¿Cómo descargo la aplicación?",
		answer:
			"Escanea el código QR que aparece en esta página o descarga la app desde el enlace de tu tienda. La app está disponible para dispositivos Android.",
	},
	{
		question: "¿La app es gratuita?",
		answer:
			"Sí, la aplicación es gratuita para todos los miembros de EHC GYM. Solo necesitas tu membresía activa para acceder a todas las funciones.",
	},
	{
		question: "¿El coach con IA reemplaza a los entrenadores?",
		answer:
			"No. El coach con IA complementa el trabajo de nuestros entrenadores humanos. Puedes usar la IA para rutinas y dudas rápidas, y contratar sesiones con entrenadores para un acompañamiento más cercano.",
	},
	{
		question: "¿Puedo usar la app en varias sedes?",
		answer:
			"Sí. Si tu membresía lo permite, puedes acceder a múltiples sedes de EHC GYM y reservar turnos en cualquiera de ellas desde la app.",
	},
];

function RouteComponent() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [openFaq, setOpenFaq] = useState<number | null>(0);

	return (
		<div className="min-h-screen bg-white">
			{/* ===== NAVBAR ===== */}
			<header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
				<nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
					{/* Logo */}
					<Link to="/dashboard" className="flex items-center gap-2">
						<img
							src="/logo-ehc-gym.png"
							alt="EHC GYM"
							className="h-10 w-auto"
						/>
						<span className="text-xl font-bold text-gray-900">
							EHC<span className="text-yellow-500"> GYM</span>
						</span>
					</Link>

					{/* Desktop nav */}
					<div className="hidden md:flex items-center gap-8">
						<a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
							Características
						</a>
						<a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
							Cómo funciona
						</a>
						<a href="#faq" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
							FAQ
						</a>
						<Link
							to="/auth/login"
							className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
						>
							Acceso Gerente
						</Link>
					</div>

					{/* Mobile menu button */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
						aria-label="Abrir menú"
					>
						{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
					</button>
				</nav>

				{/* Mobile menu */}
				{mobileMenuOpen && (
					<div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
						<a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-gray-900">
							Características
						</a>
						<a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-gray-900">
							Cómo funciona
						</a>
						<a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-gray-900">
							FAQ
						</a>
						<Link
							to="/auth/login"
							onClick={() => setMobileMenuOpen(false)}
							className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition-colors"
						>
							Acceso Gerente
						</Link>
					</div>
				)}
			</header>

			{/* ===== HERO ===== */}
			<section className="relative overflow-hidden pt-16">
				{/* Background decor */}
				<div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
				<div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-full opacity-30 blur-3xl" />
				<div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl" />

				<div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
					<div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
						{/* Left content */}
						<div className="space-y-8 animate-fade-in-up">
							<div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
								<Sparkles className="w-4 h-4" />
								Nueva experiencia de entrenamiento
							</div>

							<h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
								Tu gimnasio en el bolsillo
								<span className="block text-yellow-500 mt-2">
									Entrena, progresa y logra tus metas
								</span>
							</h1>

							<p className="text-xl text-gray-600 leading-relaxed max-w-lg">
								Rutinas personalizadas con coach de IA, reserva de turnos al instante y control completo de tu progreso físico. Todo en una sola app.
							</p>

							{/* CTAs */}
							<div className="flex flex-col sm:flex-row gap-4">
								<a
									href="#download"
									className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-base font-semibold transition-colors shadow-lg shadow-yellow-500/25"
								>
									<Download className="w-5 h-5" />
									Descargar gratis
								</a>
								<a
									href="#features"
									className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-900 rounded-xl text-base font-semibold transition-colors border border-gray-200"
								>
									Ver características
									<ChevronRight className="w-5 h-5" />
								</a>
							</div>

							{/* Social proof */}
							<div className="flex items-center gap-4 pt-2">
								<div className="flex -space-x-2">
									{["CM", "LG", "AR", "JP"].map((initials, i) => (
										<div
											key={initials}
											className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white ${
												["bg-yellow-500", "bg-blue-500", "bg-green-500", "bg-purple-500"][i]
											}`}
										>
											{initials}
										</div>
									))}
								</div>
								<div>
									<div className="flex items-center gap-1">
										{[...Array(5)].map((_, i) => (
											<Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
										))}
									</div>
									<p className="text-sm text-gray-600">
										<strong className="text-gray-900">+500</strong> miembros activos
									</p>
								</div>
							</div>
						</div>

						{/* Right content - phone image */}
						<div className="flex justify-center lg:justify-end animate-slide-in-right">
							<div className="relative">
								<div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/40 to-blue-200/40 rounded-full blur-3xl" />
								<img
									src="/phone_app.webp"
									alt="EHC GYM App en teléfonos móviles"
									className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl h-auto drop-shadow-2xl"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ===== STATS BAR ===== */}
			<section className="bg-gray-900 text-white">
				<div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
					{[
						{ value: "+500", label: "Miembros activos" },
						{ value: "24/7", label: "Coach con IA" },
						{ value: "100%", label: "Rutinas personalizadas" },
						{ value: "3+", label: "Sedes disponibles" },
					].map((stat) => (
						<div key={stat.label}>
							<p className="text-3xl lg:text-4xl font-bold text-yellow-500">{stat.value}</p>
							<p className="text-sm text-gray-400 mt-1">{stat.label}</p>
						</div>
					))}
				</div>
			</section>

			{/* ===== FEATURES ===== */}
			<section id="features" className="py-20 lg:py-28 bg-white">
				<div className="max-w-7xl mx-auto px-6">
					<div className="text-center max-w-2xl mx-auto mb-16">
						<div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-4">
							<Dumbbell className="w-4 h-4" />
							Características
						</div>
						<h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
							Todo lo que necesitas para entrenar mejor
						</h2>
						<p className="text-lg text-gray-600 mt-4">
							Una plataforma completa que combina tecnología, entrenadores y motivación para que alcances tus metas.
						</p>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{features.map((feature) => (
							<div
								key={feature.title}
								className="group p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:border-yellow-200 transition-all duration-300"
							>
								<div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
									<feature.icon className="w-6 h-6" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									{feature.title}
								</h3>
								<p className="text-gray-600 text-sm leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ===== HOW IT WORKS ===== */}
			<section id="how-it-works" className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
				<div className="max-w-7xl mx-auto px-6">
					<div className="text-center max-w-2xl mx-auto mb-16">
						<div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
							<Target className="w-4 h-4" />
							Cómo funciona
						</div>
						<h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
							Empieza en 3 simples pasos
						</h2>
						<p className="text-lg text-gray-600 mt-4">
							De cero a entrenando en menos de 5 minutos.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{steps.map((step) => (
							<div key={step.number} className="relative text-center">
								<div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-yellow-500/25 mb-6">
									{step.number}
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{step.title}
								</h3>
								<p className="text-gray-600">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ===== DOWNLOAD / CTA ===== */}
			<section id="download" className="py-20 lg:py-28 bg-gray-900 text-white relative overflow-hidden">
				<div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

				<div className="relative max-w-5xl mx-auto px-6 text-center">
					<div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium mb-6">
						<Flame className="w-4 h-4" />
						Comienza hoy
					</div>
					<h2 className="text-3xl lg:text-5xl font-bold mb-4">
						Descarga la app y comienza hoy
					</h2>
					<p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
						Únete a los miembros que ya transformaron su experiencia de entrenamiento con EHC GYM App.
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-8">
						{/* QR Code */}
						<div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-2xl">
							<QRCodeSVG
								value={import.meta.env.VITE_URL_APK_APP || "https://example.com"}
								size={160}
								level="H"
								marginSize={1}
								title="Código QR para descargar EHC GYM App"
							/>
							<p className="text-sm font-medium text-gray-700 mt-3 flex items-center gap-1">
								<QrCode className="w-4 h-4" />
								Escanea para descargar
							</p>
						</div>

						{/* Download info */}
						<div className="text-left space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
									<Smartphone className="w-5 h-5 text-yellow-400" />
								</div>
								<div>
									<p className="font-semibold">Disponible para Android</p>
									<p className="text-sm text-gray-400">Descarga directa del APK</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
									<Check className="w-5 h-5 text-green-400" />
								</div>
								<div>
									<p className="font-semibold">Gratis para miembros</p>
									<p className="text-sm text-gray-400">Solo necesitas tu membresía activa</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
									<ShieldCheck className="w-5 h-5 text-blue-400" />
								</div>
								<div>
									<p className="font-semibold">Configuración en minutos</p>
									<p className="text-sm text-gray-400">Crea tu perfil y empieza a entrenar</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ===== FAQ ===== */}
			<section id="faq" className="py-20 lg:py-28 bg-white">
				<div className="max-w-3xl mx-auto px-6">
					<div className="text-center mb-16">
						<div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
							<Apple className="w-4 h-4" />
							Preguntas frecuentes
						</div>
						<h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
							¿Tienes dudas? Te ayudamos
						</h2>
					</div>

					<div className="space-y-4">
						{faqs.map((faq, index) => (
							<div key={faq.question} className="border border-gray-200 rounded-xl overflow-hidden">
								<button
									onClick={() => setOpenFaq(openFaq === index ? null : index)}
									className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
								>
									<span className="font-semibold text-gray-900">{faq.question}</span>
									<ChevronRight
										className={`w-5 h-5 text-gray-500 transition-transform ${
											openFaq === index ? "rotate-90" : ""
										}`}
									/>
								</button>
								{openFaq === index && (
									<div className="px-5 pb-5 text-gray-600 leading-relaxed">
										{faq.answer}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ===== FINAL CTA ===== */}
			<section className="py-16 lg:py-20 bg-gradient-to-br from-yellow-500 to-yellow-600">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
						¿Listo para transformar tu entrenamiento?
					</h2>
					<p className="text-lg text-yellow-50 mb-8">
						Descarga EHC GYM App y empieza a entrenar de forma más inteligente hoy mismo.
					</p>
					<a
						href="#download"
						className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-yellow-600 rounded-xl text-lg font-bold transition-colors shadow-xl"
					>
						<Download className="w-5 h-5" />
						Descargar gratis
					</a>
				</div>
			</section>

			{/* ===== FOOTER ===== */}
			<footer className="bg-gray-900 text-white">
				<div className="max-w-7xl mx-auto px-6 py-12">
					<div className="grid md:grid-cols-3 gap-8 items-start">
						{/* Brand */}
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<img src="/logo-ehc-gym.png" alt="EHC GYM" className="h-10 w-auto" />
								<span className="text-xl font-bold">
									EHC<span className="text-yellow-500"> GYM</span>
								</span>
							</div>
							<p className="text-gray-400 text-sm max-w-xs">
								Tu gimnasio en el bolsillo. Entrena, progresa y logra tus metas con la app de EHC GYM.
							</p>
						</div>

						{/* Links */}
						<div className="space-y-3">
							<p className="font-semibold text-gray-200">Enlaces</p>
							<a href="#features" className="block text-gray-400 hover:text-yellow-400 transition-colors text-sm">
								Características
							</a>
							<a href="#how-it-works" className="block text-gray-400 hover:text-yellow-400 transition-colors text-sm">
								Cómo funciona
							</a>
							<a href="#faq" className="block text-gray-400 hover:text-yellow-400 transition-colors text-sm">
								Preguntas frecuentes
							</a>
						</div>

						{/* Contact */}
						<div className="space-y-3">
							<p className="font-semibold text-gray-200">Contacto</p>
							<p className="text-gray-400 text-sm">
								¿Tienes dudas? Contáctanos en{" "}
								<a href="mailto:construyebit@uptc.edu.co" className="text-yellow-400 hover:text-yellow-300 transition-colors">
									construyebit@uptc.edu.co
								</a>
							</p>
							<Link
								to="/auth/login"
								className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/90 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-colors"
							>
								Acceso Gerente
							</Link>
						</div>
					</div>
				</div>
				<div className="border-t border-gray-800 py-6 text-center">
					<p className="text-sm text-gray-500">
						© {new Date().getFullYear()} EHC GYM. Todos los derechos reservados.
					</p>
				</div>
			</footer>
		</div>
	);
}
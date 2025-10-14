import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Smartphone, Users, Dumbbell, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/hooks/use-auth";
import { useClerk } from "@clerk/clerk-react";
import { useEffect } from "react";

export const Route = createFileRoute("/redirect-to-mobile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isTrainer, isClient, isSuperAdmin, isAdmin, isLoading } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  // Redirigir si es admin o super admin
  useEffect(() => {
    if (!isLoading) {
      if (isSuperAdmin) {
        navigate({ to: "/super-admin/dashboard" });
      } else if (isAdmin) {
        navigate({ to: "/admin" });
      }
    }
  }, [isLoading, isSuperAdmin, isAdmin, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate({ to: "/dashboard" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  const roleText = isTrainer ? "Entrenador" : isClient ? "Cliente" : "Usuario";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-200 to-yellow-200 rounded-full opacity-20 blur-3xl"></div>

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center">
              <Smartphone className="w-12 h-12 text-yellow-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Panel de {roleText}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            La plataforma web está diseñada exclusivamente para administradores.
          </p>

          {/* Info Box */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
            <p className="text-base text-gray-700 text-center mb-2">
              Para acceder a las funcionalidades de{" "}
              <span className="font-bold text-yellow-600">{roleText}</span>, por favor descarga la{" "}
              <span className="font-bold text-yellow-600">aplicación móvil</span>.
            </p>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
              En la app móvil podrás:
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white/60 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {isTrainer ? "Gestionar rutinas" : "Ver tus rutinas"}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {isTrainer ? "Crea y asigna rutinas personalizadas" : "Accede a tus rutinas personalizadas"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-xs">
                    {isTrainer ? "Administra tu disponibilidad" : "Reserva tus clases al instante"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {isTrainer ? "Seguimiento de clientes" : "Ver tu progreso"}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {isTrainer ? "Monitorea el progreso de tus clientes" : "Rastrea tu evolución física"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="text-center space-y-6 mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Descarga la app móvil
              </h2>
              <p className="text-gray-600">
                Escanea el código QR con tu teléfono para descargar
              </p>
            </div>

            <div className="flex justify-center">
              <div className="inline-flex flex-col items-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                <QRCodeSVG
                  value={import.meta.env.VITE_URL_APK_APP || "https://example.com"}
                  size={200}
                  level="H"
                  marginSize={1}
                  title="Código QR para descargar EHC GYM App"
                />
                <p className="text-sm font-medium text-gray-700 mt-4">
                  Escanea con tu cámara
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={import.meta.env.VITE_URL_APK_APP}
              download
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
            >
              <Smartphone className="w-5 h-5" />
              Descargar App
            </a>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors border-2 border-gray-300"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            ¿Tienes dudas? Contáctanos en{" "}
            <a
              href="mailto:aguirretenjo@gmail.com"
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              aguirretenjo@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

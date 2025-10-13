import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
    Building,
    Users,
    BarChart3,
    ChevronRight
} from "lucide-react";

export function AdminDashboardCards() {
    const navigate = useNavigate();

    const dashboardItems = [
        {
            title: "Gestión de Sedes",
            description: "Administra todas las sedes del gimnasio",
            icon: Building,
            background: "bg-gradient-to-br from-blue-400 to-blue-600",
            image: "/dashboard-sedes.jpg",
            action: () => navigate({ to: "/admin/sedes" })
        },
        {
            title: "Administrar clientes",
            description: "Gestiona el personal y entrenadores",
            icon: Users,
            background: "bg-gradient-to-br from-purple-400 to-purple-600",
            image: "/dashboard-personal.png",
            action: () => console.log("Administrar clientes")
        },
        {
            title: "Administrar entrenadores",
            description: "Gestiona los entrenadores del gimnasio",
            icon: BarChart3,
            background: "bg-gradient-to-br from-gray-600 to-gray-800",
            image: "/dashboard-monitoreo.png",
            action: () => navigate({ to: "/admin/trainers" })
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardItems.map((item, index) => (
                <DashboardCard key={index} {...item} size="large" />
            ))}
        </div>
    );
}

interface DashboardCardProps {
    title: string;
    description: string;
    icon: any;
    background: string;
    image: string;
    action: () => void;
    size: 'large' | 'wide';
}

function DashboardCard({
    title,
    description,
    icon: Icon,
    background,
    image,
    action,
    size
}: DashboardCardProps) {
    return (
        <Card className={`overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${size === 'wide' ? 'h-48' : 'h-64'
            } p-0`}>
            <div
                className={`relative w-full h-full ${background} text-white rounded-xl`}
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 leading-tight">
                                {title}
                            </h3>
                            <p className="text-sm opacity-90 mb-4">
                                {description}
                            </p>
                        </div>
                        <Icon size={24} className="opacity-80" />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={action}
                            size="sm"
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full p-3"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";
import type { Id } from "@ehc-gym2/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import { useAuth } from "./use-auth";
import type {
    BasicInfoData,
    LocationContactData,
    ScheduleAmenitiesData,
    FormErrors
} from "../lib/sede-types";
import { z } from "zod";

// Esquemas de validación
const basicInfoSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    status: z.enum(["ACTIVE", "INACTIVE", "UNDER_CONSTRUCTION", "TEMPORARILY_CLOSED"]),
    max_capacity: z.string().refine((val) => {
        const num = parseInt(val);
        return !isNaN(num) && num > 0;
    }, "La capacidad debe ser un número positivo"),
});

const locationContactSchema = z.object({
    cityId: z.string().min(1, "Debes seleccionar una ciudad"),
    addressId: z.string().min(1, "Debes seleccionar una dirección"),
    phone: z.string().optional(),
    email: z.string().email("El formato del email no es válido").optional().or(z.literal("")),
});

const scheduleAmenitiesSchema = z.object({
    opening_time: z.string().min(1, "Debes seleccionar un horario de apertura"),
    closing_time: z.string().min(1, "Debes seleccionar un horario de cierre"),
    metadata: z.object({
        has_parking: z.boolean(),
        has_pool: z.boolean(),
        has_sauna: z.boolean(),
        has_spa: z.boolean(),
        has_locker_rooms: z.boolean(),
        wifi_available: z.boolean(),
    }),
});

export function useSedeForm() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // Estados para cada paso
    const [basicInfo, setBasicInfo] = useState<BasicInfoData>({
        name: "",
        status: "ACTIVE",
        max_capacity: "100",
    });

    const [locationContact, setLocationContact] = useState<LocationContactData>({
        cityId: "",
        addressId: "",
        phone: "",
        email: "",
    });

    const [scheduleAmenities, setScheduleAmenities] = useState<ScheduleAmenitiesData>({
        opening_time: "06:00",
        closing_time: "22:00",
        metadata: {
            has_parking: false,
            has_pool: false,
            has_sauna: false,
            has_spa: false,
            has_locker_rooms: true,
            wifi_available: true,
        },
    });

    // Queries y mutations
    const cities = useQuery(
        api.cities.queries.listForAdmins,
        isAuthenticated ? {} : "skip"
    ) ?? [];
    const addresses = useQuery(
        api.addresses.queries.listForAdmins,
        isAuthenticated ? {} : "skip"
    ) ?? [];
    const createBranchMutation = useMutation(api.branches.mutations.create);

    // Funciones de actualización
    const updateBasicInfo = (field: keyof BasicInfoData, value: string) => {
        setBasicInfo(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const updateLocationContact = (field: keyof LocationContactData, value: string) => {
        setLocationContact(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const updateScheduleAmenities = (field: keyof ScheduleAmenitiesData, value: string) => {
        setScheduleAmenities(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const updateMetadata = (field: keyof ScheduleAmenitiesData['metadata'], value: boolean) => {
        setScheduleAmenities(prev => ({
            ...prev,
            metadata: { ...prev.metadata, [field]: value }
        }));
    };

    // Validación por paso
    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};

        try {
            if (step === 1) {
                basicInfoSchema.parse(basicInfo);
            } else if (step === 2) {
                locationContactSchema.parse(locationContact);
            } else if (step === 3) {
                scheduleAmenitiesSchema.parse(scheduleAmenities);

                // Validación adicional de horarios
                if (scheduleAmenities.opening_time >= scheduleAmenities.closing_time) {
                    newErrors.closing_time = "El horario de cierre debe ser posterior al de apertura";
                }
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.issues.forEach((err: z.ZodIssue) => {
                    const fieldName = err.path.join('.');
                    newErrors[fieldName] = err.message;
                });
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Navegación
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
        setErrors({});
    };

    // Submit
    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            return;
        }

        // Validación completa
        const newErrors: FormErrors = {};

        try {
            basicInfoSchema.parse(basicInfo);
            locationContactSchema.parse(locationContact);
            scheduleAmenitiesSchema.parse(scheduleAmenities);

            if (scheduleAmenities.opening_time >= scheduleAmenities.closing_time) {
                newErrors.closing_time = "El horario de cierre debe ser posterior al de apertura";
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.issues.forEach((err: z.ZodIssue) => {
                    const fieldName = err.path.join('.');
                    newErrors[fieldName] = err.message;
                });
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Por favor, corrige los errores antes de continuar");
            return;
        }

        setIsLoading(true);
        try {
            await createBranchMutation({
                name: basicInfo.name,
                address_id: locationContact.addressId as Id<"addresses">,
                phone: locationContact.phone || undefined,
                email: locationContact.email || undefined,
                opening_time: scheduleAmenities.opening_time,
                closing_time: scheduleAmenities.closing_time,
                max_capacity: parseInt(basicInfo.max_capacity),
                status: basicInfo.status,
                metadata: scheduleAmenities.metadata,
            });

            toast.success(`¡Sede ${basicInfo.name} creada exitosamente!`, {
                duration: 4000,
            });

            resetForm();
            setTimeout(() => {
                navigate({ to: '/super-admin/sedes' });
            }, 1000);

        } catch (error) {
            console.error('Error al crear sede:', error);

            let errorMessage = 'Error al crear la sede';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, {
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setCurrentStep(1);
        setBasicInfo({
            name: "",
            status: "ACTIVE",
            max_capacity: "100",
        });
        setLocationContact({
            cityId: "",
            addressId: "",
            phone: "",
            email: "",
        });
        setScheduleAmenities({
            opening_time: "06:00",
            closing_time: "22:00",
            metadata: {
                has_parking: false,
                has_pool: false,
                has_sauna: false,
                has_spa: false,
                has_locker_rooms: true,
                wifi_available: true,
            },
        });
        setErrors({});
    };

    return {
        currentStep,
        isLoading,
        errors,
        basicInfo,
        locationContact,
        scheduleAmenities,
        cities,
        addresses,
        updateBasicInfo,
        updateLocationContact,
        updateScheduleAmenities,
        updateMetadata,
        handleNext,
        handlePrev,
        handleSubmit,
        resetForm,
        navigate,
    };
}
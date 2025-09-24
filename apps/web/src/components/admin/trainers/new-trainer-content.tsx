import React, { useState } from "react";
import { ArrowLeft, ArrowRight, User, CreditCard, Building2, Save, X, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAction, useQuery } from "convex/react";
import { api } from "@ehc-gym2/backend/convex/_generated/api";

// ===== TIPOS =====
interface UserData {
    userName: string;
    userEmail: string;
    userPhone: string;
}

interface PersonalData {
    personName: string;
    personLastName: string;
    personBornDate: string;
    personDocumentType: string;
    personDocumentNumber: string;
}

interface WorkData {
    branch: string;
    specialties: string[];
}

type DocumentType = 'CC' | 'TI' | 'CE' | 'PASSPORT';

interface FormErrors {
    [key: string]: string;
}

// ===== COMPONENTES UI MEJORADOS =====

// Card Components
interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => (
    <div className={`p-6 pb-0 ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<CardProps> = ({ children, className = "" }) => (
    <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
        {children}
    </h3>
);

const CardContent: React.FC<CardProps> = ({ children, className = "" }) => (
    <div className={`p-6 pt-0 ${className}`}>
        {children}
    </div>
);

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    error?: boolean;
}

const Input: React.FC<InputProps> = ({ className = "", error = false, ...props }) => (
    <input
        className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error
            ? 'border-red-300 focus-visible:ring-red-500'
            : 'border-input focus-visible:ring-yellow-500'
            } ${className}`}
        {...props}
    />
);

// Label Component
interface LabelProps {
    children: React.ReactNode;
    className?: string;
    required?: boolean;
}

const Label: React.FC<LabelProps> = ({ children, className = "", required = false }) => (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "outline" | "ghost";
}

const Button: React.FC<ButtonProps> = ({ children, className = "", variant = "default", disabled = false, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";

    const variants = {
        default: "bg-yellow-600 text-white hover:bg-yellow-700",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

// Select Components
interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
    error?: boolean;
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, children, className = "", error = false }) => (
    <select
        value={value}
        onChange={e => onValueChange(e.target.value)}
        className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error
            ? 'border-red-300 focus-visible:ring-red-500'
            : 'border-input focus-visible:ring-yellow-500'
            } ${className}`}
    >
        {children}
    </select>
);

interface SelectItemProps {
    value: string;
    children: React.ReactNode;
    disabled?: boolean;
}

const SelectItem: React.FC<SelectItemProps> = ({ value, children, disabled = false }) => (
    <option value={value} disabled={disabled}>{children}</option>
);

// Badge Component
interface BadgeProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "secondary";
}

const Badge: React.FC<BadgeProps> = ({ children, className = "", variant = "default" }) => {
    const variants = {
        default: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// ===== COMPONENTES DEL FORMULARIO =====

// Progress Steps Component
interface ProgressStepsProps {
    currentStep: number;
    totalSteps: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep, totalSteps }) => {
    return (
        <div className="flex items-center justify-center mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <React.Fragment key={step}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step <= currentStep
                        ? 'bg-yellow-600 border-yellow-600 text-white'
                        : 'bg-white border-gray-300 text-gray-500'
                        }`}>
                        {step < currentStep ? (
                            <Check size={20} />
                        ) : (
                            <span className="text-sm font-medium">{step}</span>
                        )}
                    </div>
                    {step < totalSteps && (
                        <div className={`w-16 h-0.5 mx-2 ${step < currentStep ? 'bg-yellow-600' : 'bg-gray-300'
                            }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// Form Field Component
interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required = false, error, children }) => (
    <div className="space-y-2">
        <Label required={required} className="text-gray-700">
            {label}
        </Label>
        {children}
        {error && (
            <p className="text-sm text-red-600">{error}</p>
        )}
    </div>
);

// Form Section Component
interface FormSectionProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ icon, title, description, children }) => (
    <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                    {icon}
                </div>
                <div>
                    {title}
                    {description && (
                        <p className="text-sm font-normal text-gray-500 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            {children}
        </CardContent>
    </Card>
);

// Specialty Tags Component
interface SpecialtyTagsProps {
    specialties: string[];
    onAdd: (specialty: string) => void;
    onRemove: (index: number) => void;
}

const SpecialtyTags: React.FC<SpecialtyTagsProps> = ({ specialties, onAdd, onRemove }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmedValue = inputValue.trim();
            if (trimmedValue && !specialties.includes(trimmedValue)) {
                onAdd(trimmedValue);
                setInputValue("");
            }
        }
    };

    return (
        <div className="space-y-3">
            <Input
                placeholder="Escribe una especialidad y presiona Enter"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-black outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty, index) => (
                        <Badge
                            key={index}
                            variant="default"
                            className="pr-1"
                        >
                            {specialty}
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="ml-2 hover:bg-yellow-300 rounded-full p-0.5 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};

// ===== COMPONENTE PRINCIPAL =====

export default function NewTrainerForm() {
    // Estados
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [userData, setUserData] = useState<UserData>({
        userName: "",
        userEmail: "",
        userPhone: "",
    });

    const [personalData, setPersonalData] = useState<PersonalData>({
        personName: "",
        personLastName: "",
        personBornDate: "",
        personDocumentType: "CC",
        personDocumentNumber: "",
    });

    const [workData, setWorkData] = useState<WorkData>({
        branch: "",
        specialties: [],
    });

    // Usar la action completa para crear entrenador
    const createTrainerComplete = useAction(api.trainers.mutations.createTrainerComplete);

    // Obtener las sedes desde la base de datos
    const branches = useQuery(api.branches.list);

    // Constantes
    const DOCUMENT_TYPES: Array<{ value: DocumentType; label: string }> = [
        { value: "CC", label: "Cédula de Ciudadanía" },
        { value: "TI", label: "Tarjeta de Identidad" },
        { value: "CE", label: "Cédula de Extranjería" },
        { value: "PASSPORT", label: "Pasaporte" },
    ];

    const totalSteps: number = 3;

    // Handlers
    const updateUserData = (field: keyof UserData, value: string) => {
        setUserData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const updatePersonalData = (field: keyof PersonalData, value: string) => {
        setPersonalData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const updateWorkData = (field: keyof WorkData, value: string | string[]) => {
        setWorkData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addSpecialty = (specialty: string) => {
        setWorkData(prev => ({
            ...prev,
            specialties: [...prev.specialties, specialty]
        }));
    };

    const removeSpecialty = (index: number) => {
        setWorkData(prev => ({
            ...prev,
            specialties: prev.specialties.filter((_, i) => i !== index)
        }));
    };

    // Validaciones por paso
    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};

        if (step === 1) {
            if (!userData.userName.trim()) {
                newErrors.userName = 'El nombre de usuario es requerido';
            }
            if (!userData.userEmail.trim()) {
                newErrors.userEmail = 'El correo electrónico es requerido';
            } else if (!/\S+@\S+\.\S+/.test(userData.userEmail)) {
                newErrors.userEmail = 'El correo electrónico no es válido';
            }
        }

        if (step === 2) {
            if (!personalData.personName.trim()) {
                newErrors.personName = 'El nombre es requerido';
            }
            if (!personalData.personLastName.trim()) {
                newErrors.personLastName = 'El apellido es requerido';
            }
            if (!personalData.personBornDate) {
                newErrors.personBornDate = 'La fecha de nacimiento es requerida';
            }
            if (!personalData.personDocumentNumber.trim()) {
                newErrors.personDocumentNumber = 'El número de documento es requerido';
            }
        }

        if (step === 3) {
            if (!workData.branch) {
                newErrors.branch = 'La sede es requerida';
            } else if (branches && !branches.some(branch => branch.name === workData.branch && branch.status === "ACTIVE")) {
                newErrors.branch = 'La sede seleccionada no está disponible';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
        setErrors({});
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            return;
        }

        setIsLoading(true);
        try {
            // Usar la mutation completa
            const result = await createTrainerComplete({
                userData: {
                    userName: userData.userName,
                    userEmail: userData.userEmail,
                    userPhone: userData.userPhone,
                },
                personalData: {
                    personName: personalData.personName,
                    personLastName: personalData.personLastName,
                    personBornDate: personalData.personBornDate,
                    personDocumentType: personalData.personDocumentType,
                    personDocumentNumber: personalData.personDocumentNumber,
                },
                workData: {
                    branch: workData.branch,
                    specialties: workData.specialties,
                },
            });
            if (!result?.success) throw new Error(result?.data?.message || "No se pudo crear el entrenador");
            toast.success(result.data?.message || '¡Entrenador creado exitosamente!');
        } catch (error) {
            console.error('Error al crear entrenador:', error);
            toast.error('Error al crear entrenador');
        } finally {
            setIsLoading(false);
        }
    };

    // Renderizar contenido por paso
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <FormSection
                        icon={<User size={20} />}
                        title="Datos de Usuario"
                        description="Información de acceso al sistema"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Nombre de usuario"
                                required
                                error={errors.userName}
                            >
                                <Input
                                    className="text-black"
                                    placeholder="usuario123"
                                    value={userData.userName}
                                    onChange={(e) => updateUserData('userName', e.target.value)}
                                    error={!!errors.userName}
                                />
                            </FormField>

                            <FormField
                                label="Correo electrónico"
                                required
                                error={errors.userEmail}
                            >
                                <Input
                                    className="text-black"
                                    type="email"
                                    placeholder="usuario@example.com"
                                    value={userData.userEmail}
                                    onChange={(e) => updateUserData('userEmail', e.target.value)}
                                    error={!!errors.userEmail}
                                />
                            </FormField>

                            <FormField label="Número de celular">
                                <Input
                                    className="text-black"
                                    placeholder="300 123 4567"
                                    value={userData.userPhone}
                                    onChange={(e) => updateUserData('userPhone', e.target.value)}
                                />
                            </FormField>
                        </div>
                    </FormSection>
                );

            case 2:
                return (
                    <FormSection
                        icon={<CreditCard size={20} />}
                        title="Datos Personales"
                        description="Información personal del entrenador"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Nombre"
                                required
                                error={errors.personName}
                            >
                                <Input
                                    className="text-black"
                                    placeholder="Juan"
                                    value={personalData.personName}
                                    onChange={(e) => updatePersonalData('personName', e.target.value)}
                                    error={!!errors.personName}
                                />
                            </FormField>

                            <FormField
                                label="Apellido"
                                required
                                error={errors.personLastName}
                            >
                                <Input
                                    className="text-black"
                                    placeholder="Pérez"
                                    value={personalData.personLastName}
                                    onChange={(e) => updatePersonalData('personLastName', e.target.value)}
                                    error={!!errors.personLastName}
                                />
                            </FormField>

                            <FormField
                                label="Fecha de nacimiento"
                                required
                                error={errors.personBornDate}
                            >
                                <Input
                                    className="text-black"
                                    type="date"
                                    value={personalData.personBornDate}
                                    onChange={(e) => updatePersonalData('personBornDate', e.target.value)}
                                    error={!!errors.personBornDate}
                                />
                            </FormField>

                            <FormField label="Tipo de documento" required>
                                <Select
                                    value={personalData.personDocumentType}
                                    onValueChange={(value) => updatePersonalData('personDocumentType', value)}
                                >
                                    {DOCUMENT_TYPES.map((doc) => (
                                        <SelectItem key={doc.value} value={doc.value}>
                                            {doc.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </FormField>

                            <FormField
                                label="Número de documento"
                                required
                                error={errors.personDocumentNumber}
                            >
                                <Input
                                    className="text-black"
                                    placeholder="12345678"
                                    value={personalData.personDocumentNumber}
                                    onChange={(e) => updatePersonalData('personDocumentNumber', e.target.value)}
                                    error={!!errors.personDocumentNumber}
                                />
                            </FormField>
                        </div>
                    </FormSection>
                );

            case 3:
                return (
                    <FormSection
                        icon={<Building2 size={20} />}
                        title="Datos Laborales"
                        description="Información laboral y especialidades"
                    >
                        <div className="grid grid-cols-1 gap-6">
                            <FormField
                                label="Sede"
                                required
                                error={errors.branch}
                            >
                                <Select
                                    value={workData.branch}
                                    onValueChange={(value) => updateWorkData('branch', value)}
                                    error={!!errors.branch}
                                >
                                    <SelectItem value="">Selecciona una sede</SelectItem>
                                    {branches === undefined ? (
                                        <SelectItem value="" disabled>
                                            Cargando sedes...
                                        </SelectItem>
                                    ) : branches.filter(branch => branch.status === "ACTIVE").length === 0 ? (
                                        <SelectItem value="" disabled>
                                            No hay sedes disponibles
                                        </SelectItem>
                                    ) : (
                                        branches
                                            .filter(branch => branch.status === "ACTIVE")
                                            .map((branch) => (
                                                <SelectItem key={branch._id} value={branch.name}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))
                                    )}
                                </Select>
                            </FormField>

                            <FormField label="Especialidades">
                                <SpecialtyTags
                                    specialties={workData.specialties}
                                    onAdd={addSpecialty}
                                    onRemove={removeSpecialty}
                                />
                            </FormField>
                        </div>
                    </FormSection>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin/trainers">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 cursor-pointer hover:bg-yellow-100 hover:border-yellow-400 hover:text-yellow-700 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span>Volver</span>
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nuevo Entrenador</h1>
                        <p className="text-gray-600 mt-1">
                            Paso {currentStep} de {totalSteps}: {
                                currentStep === 1 ? 'Datos de Usuario' :
                                    currentStep === 2 ? 'Datos Personales' : 'Datos Laborales'
                            }
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <ProgressSteps currentStep={currentStep} totalSteps={totalSteps} />

                {/* Form Content */}
                <div className="mb-6">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                            <div>
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrev}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowLeft size={16} />
                                        Anterior
                                    </Button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="hover:bg-gray-50 hover:border-yellow-400 hover:text-yellow-700 cursor-pointer"
                                >
                                    Cancelar
                                </Button>

                                {currentStep < totalSteps ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        className="flex items-center gap-2"
                                    >
                                        Siguiente
                                        <ArrowRight size={16} />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                Creando...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                Crear Entrenador
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
import { z } from 'zod';

// Helper para validar fecha en formato DD/MM/YYYY
const dateFormatRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const validateDateFormat = (dateStr: string): boolean => {
    if (!dateFormatRegex.test(dateStr)) return false;

    const [, day, month, year] = dateStr.match(dateFormatRegex)!;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    // Validar rangos básicos
    if (monthNum < 1 || monthNum > 12) return false;
    if (dayNum < 1 || dayNum > 31) return false;

    // Validar fecha válida
    const date = new Date(yearNum, monthNum - 1, dayNum);
    return (
        date.getFullYear() === yearNum &&
        date.getMonth() === monthNum - 1 &&
        date.getDate() === dayNum
    );
};

const validateAge = (dateStr: string): boolean => {
    const [day, month, year] = dateStr.split('/');
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 14; // Mínimo 14 años
    }

    return age >= 14;
};

// Schema para el registro completo del cliente
export const registerClientSchema = z.object({
    // Datos básicos
    nombres: z
        .string({ message: 'El nombre es obligatorio' })
        .trim()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre es demasiado largo')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),

    apellidos: z
        .string({ message: 'El apellido es obligatorio' })
        .trim()
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(50, 'El apellido es demasiado largo')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras'),

    email: z
        .string({ message: 'El correo electrónico es obligatorio' })
        .trim()
        .toLowerCase()
        .min(1, 'El correo electrónico es obligatorio')
        .email('Por favor ingresa un correo electrónico válido'),

    contrasena: z
        .string({ message: 'La contraseña es obligatoria' })
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(100, 'La contraseña es demasiado larga'),

    // Datos de la persona
    fechaNacimiento: z
        .string({ message: 'La fecha de nacimiento es obligatoria' })
        .min(10, 'Ingresa una fecha válida (DD/MM/AAAA)')
        .refine(validateDateFormat, {
            message: 'Fecha inválida. Usa el formato DD/MM/AAAA'
        })
        .refine(validateAge, {
            message: 'Debes tener al menos 14 años para registrarte'
        }),

    telefono: z
        .string({ message: 'El número de teléfono es obligatorio' })
        .regex(/^\d{10}$/, 'El número debe tener 10 dígitos'),

    countryCode: z
        .string()
        .default('+57'),

    // Datos del contacto de emergencia
    nombreContactoEmergencia: z
        .string({ message: 'El nombre del contacto de emergencia es obligatorio' })
        .trim()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre es demasiado largo')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),

    telefonoContactoEmergencia: z
        .string({ message: 'El teléfono del contacto de emergencia es obligatorio' })
        .regex(/^\d{10}$/, 'El número debe tener 10 dígitos'),

    parentescoContactoEmergencia: z
        .string({ message: 'El parentesco del contacto de emergencia es obligatorio' })
        .trim()
        .min(2, 'El parentesco debe tener al menos 2 caracteres')
        .max(30, 'El parentesco es demasiado largo')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\/]+$/, 'El parentesco solo puede contener letras'),

    // Datos del documento
    tipoDocumento: z
        .enum(['CC', 'TI', 'CE', 'PASSPORT'], {
            message: 'Selecciona un tipo de documento válido'
        }),

    numeroDocumento: z
        .string({ message: 'El número de documento es obligatorio' })
        .trim()
        .min(5, 'El número de documento debe tener al menos 5 caracteres')
        .max(20, 'El número de documento es demasiado largo')
        .regex(/^[a-zA-Z0-9]+$/, 'El número de documento solo puede contener letras y números'),

    // Sede preferida
    sedeId: z
        .string({ message: 'Debes seleccionar una sede' })
        .min(1, 'Debes seleccionar una sede'),
});

// Schema para validar solo los datos de Clerk (paso 1)
export const clerkSignUpSchema = registerClientSchema.pick({
    email: true,
    contrasena: true,
});

// Schema para validar todos los datos antes de enviar a Convex (paso 2)
export const convexClientDataSchema = registerClientSchema.omit({
    email: true,
    contrasena: true,
});

// Types
export type RegisterClientInput = z.infer<typeof registerClientSchema>;
export type ClerkSignUpInput = z.infer<typeof clerkSignUpSchema>;
export type ConvexClientDataInput = z.infer<typeof convexClientDataSchema>;

// Helper function para convertir errores de Zod a objeto de errores de campo
export const formatZodErrors = (error: z.ZodError): Record<string, string> => {
    const errors: Record<string, string> = {};

    error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (path) {
            errors[path] = err.message;
        }
    });

    return errors;
};

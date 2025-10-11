import { z } from 'zod';

// Schema para Sign In
export const signInSchema = z.object({
    email: z
        .string({ message: 'El correo electrónico es obligatorio' })
        .trim()
        .toLowerCase()
        .min(1, 'El correo electrónico es obligatorio')
        .email('Por favor ingresa un correo electrónico válido'),
    password: z
        .string({ message: 'La contraseña es obligatoria' })
        .min(1, 'La contraseña es obligatoria'),
});

// Schema para Sign Up
export const signUpSchema = z.object({
    email: z
        .string({ message: 'El correo electrónico es obligatorio' })
        .trim()
        .toLowerCase()
        .min(1, 'El correo electrónico es obligatorio')
        .email('Por favor ingresa un correo electrónico válido'),
    password: z
        .string({ message: 'La contraseña es obligatoria' })
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(100, 'La contraseña es demasiado larga')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
        .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
        .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
});

// Schema para código de verificación
export const verificationCodeSchema = z.object({
    code: z
        .string({ message: 'El código es obligatorio' })
        .length(6, 'El código debe tener 6 dígitos')
        .regex(/^\d+$/, 'El código debe contener solo números'),
});

// Types
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type VerificationCodeInput = z.infer<typeof verificationCodeSchema>;

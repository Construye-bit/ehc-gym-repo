// convex/emails/templates.ts

export const getWelcomeAdminEmailTemplate = (
    adminName: string,
    email: string,
    temporaryPassword: string
) => {
    return {
        subject: "¡Bienvenido como Administrador de EHC Gym! 🏋️‍♂️",
        html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a EHC Gym</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .credential-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        .credential-item {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e5e5;
        }
        .credential-item strong {
            color: #d97706;
        }
        .password {
            font-family: 'Courier New', monospace;
            background: #f3f4f6;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            color: #dc2626;
        }
        .warning {
            background: #fef3cd;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            background: #f59e0b;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏋️‍♂️ ¡Bienvenido a EHC Gym!</h1>
        <p>Tu cuenta de administrador ha sido creada exitosamente</p>
    </div>
    
    <div class="content">
        <h2>Hola ${adminName},</h2>
        
        <p>¡Felicidades! Has sido agregado como administrador en EHC Gym. Tu cuenta ha sido creada y ya puedes acceder al sistema de gestión.</p>
        
        <div class="credential-box">
            <h3>📋 Datos de Acceso</h3>
            <div class="credential-item">
                <strong>Correo electrónico:</strong> ${email}
            </div>
            <div class="credential-item">
                <strong>Contraseña temporal:</strong><br>
                <span class="password">${temporaryPassword}</span>
            </div>
        </div>
        
        <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
                <li>Esta es una contraseña temporal generada automáticamente</li>
                <li>Por seguridad, cámbiala en tu primer inicio de sesión</li>
                <li>No compartas esta información con terceros</li>
                <li>Como administrador, tienes acceso a funciones sensibles del sistema</li>
            </ul>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/login" class="btn">
                Iniciar Sesión Ahora
            </a>
        </div>
        
        <h3>🎯 Responsabilidades como Administrador:</h3>
        <ul>
            <li>Gestionar clientes y entrenadores de tu sede</li>
            <li>Supervisar las operaciones diarias</li>
            <li>Generar reportes y estadísticas</li>
            <li>Mantener actualizada la información de la sede</li>
        </ul>
        
        <h3>📱 Próximos pasos:</h3>
        <ol>
            <li>Inicia sesión con las credenciales proporcionadas</li>
            <li>Cambia tu contraseña temporal por una segura</li>
            <li>Completa tu perfil de administrador</li>
            <li>Familiarízate con el panel de control</li>
        </ol>
        
        <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar al super administrador.</p>
        
        <p>¡Esperamos trabajar contigo para hacer de EHC Gym el mejor gimnasio!</p>
        
        <p>Saludos cordiales,<br>
        <strong>El equipo de EHC Gym</strong></p>
    </div>
    
    <div class="footer">
        <p>Este es un correo automático, por favor no responder directamente.</p>
        <p>© ${new Date().getFullYear()} EHC Gym. Todos los derechos reservados.</p>
    </div>
</body>
</html>
        `,
        text: `
¡Bienvenido a EHC Gym!

Hola ${adminName},

¡Felicidades! Has sido agregado como administrador en EHC Gym.

DATOS DE ACCESO:
- Correo electrónico: ${email}
- Contraseña temporal: ${temporaryPassword}

IMPORTANTE:
- Esta es una contraseña temporal generada automáticamente
- Por seguridad, cámbiala en tu primer inicio de sesión
- No compartas esta información con terceros
- Como administrador, tienes acceso a funciones sensibles del sistema

RESPONSABILIDADES COMO ADMINISTRADOR:
- Gestionar clientes y entrenadores de tu sede
- Supervisar las operaciones diarias
- Generar reportes y estadísticas
- Mantener actualizada la información de la sede

PRÓXIMOS PASOS:
1. Inicia sesión con las credenciales proporcionadas
2. Cambia tu contraseña temporal por una segura
3. Completa tu perfil de administrador
4. Familiarízate con el panel de control

Enlace de acceso: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/login

¡Esperamos trabajar contigo!

Saludos cordiales,
El equipo de EHC Gym
        `
    };
};

export const getWelcomeTrainerEmailTemplate = (
    trainerName: string,
    email: string,
    temporaryPassword: string,
    employeeCode: string
) => {
    return {
        subject: "¡Bienvenido al equipo de EHC Gym! 🏋️‍♂️",
        html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a EHC Gym</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .credential-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        .credential-item {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e5e5;
        }
        .credential-item strong {
            color: #d97706;
        }
        .password {
            font-family: 'Courier New', monospace;
            background: #f3f4f6;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            color: #dc2626;
        }
        .warning {
            background: #fef3cd;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            background: #f59e0b;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏋️‍♂️ ¡Bienvenido a EHC Gym!</h1>
        <p>Tu cuenta de entrenador ha sido creada exitosamente</p>
    </div>
    
    <div class="content">
        <h2>Hola ${trainerName},</h2>
        
        <p>¡Felicidades! Has sido agregado como entrenador en EHC Gym. Tu cuenta ha sido creada y ya puedes acceder al sistema.</p>
        
        <div class="credential-box">
            <h3>📋 Datos de Acceso</h3>
            <div class="credential-item">
                <strong>Correo electrónico:</strong> ${email}
            </div>
            <div class="credential-item">
                <strong>Código de empleado:</strong> ${employeeCode}
            </div>
            <div class="credential-item">
                <strong>Contraseña temporal:</strong><br>
                <span class="password">${temporaryPassword}</span>
            </div>
        </div>
        
        <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
                <li>Esta es una contraseña temporal generada automáticamente</li>
                <li>Por seguridad, cámbiala en tu primer inicio de sesión</li>
                <li>No compartas esta información con terceros</li>
                <li>Si tienes problemas para acceder, contacta al administrador</li>
            </ul>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/sign-in" class="btn">
                Iniciar Sesión Ahora
            </a>
        </div>
        
        <h3>🎯 Próximos pasos:</h3>
        <ol>
            <li>Inicia sesión con las credenciales proporcionadas</li>
            <li>Cambia tu contraseña temporal por una segura</li>
            <li>Completa tu perfil de entrenador</li>
            <li>Familiarízate con el sistema de gestión</li>
        </ol>
        
        <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
        
        <p>¡Esperamos trabajar contigo para brindar el mejor servicio a nuestros clientes!</p>
        
        <p>Saludos cordiales,<br>
        <strong>El equipo de EHC Gym</strong></p>
    </div>
    
    <div class="footer">
        <p>Este es un correo automático, por favor no responder directamente.</p>
        <p>© ${new Date().getFullYear()} EHC Gym. Todos los derechos reservados.</p>
    </div>
</body>
</html>
        `,
        text: `
¡Bienvenido a EHC Gym!

Hola ${trainerName},

¡Felicidades! Has sido agregado como entrenador en EHC Gym.

DATOS DE ACCESO:
- Correo electrónico: ${email}
- Código de empleado: ${employeeCode}
- Contraseña temporal: ${temporaryPassword}

IMPORTANTE:
- Esta es una contraseña temporal generada automáticamente
- Por seguridad, cámbiala en tu primer inicio de sesión
- No compartas esta información con terceros

PRÓXIMOS PASOS:
1. Inicia sesión con las credenciales proporcionadas
2. Cambia tu contraseña temporal por una segura
3. Completa tu perfil de entrenador
4. Familiarízate con el sistema de gestión

Enlace de acceso: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/sign-in

¡Esperamos trabajar contigo!

Saludos cordiales,
El equipo de EHC Gym
        `
    };
};

export const getWelcomeClientEmailTemplate = (
    clientName: string,
    email: string,
    temporaryPassword: string
) => {
    return {
        subject: "¡Bienvenido a EHC Gym! - Tus credenciales de acceso",
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a EHC Gym</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 0; text-align: center; background-color: #f4f4f4;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #1F2937; font-size: 28px; font-weight: bold;">
                                ¡Bienvenido a EHC Gym!
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #374151; font-size: 16px;">
                                Tu cuenta ha sido creada exitosamente
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                Hola <strong>${clientName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                ¡Bienvenido a la familia EHC Gym! Estamos emocionados de tenerte con nosotros. Tu cuenta ha sido configurada y puedes acceder a nuestra app móvil con las siguientes credenciales:
                            </p>
                            
                            <!-- Credentials Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #FEF3C7; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 15px 0; color: #92400E; font-size: 14px; font-weight: bold; text-transform: uppercase;">
                                            Tus Credenciales de Acceso
                                        </p>
                                        
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #78350F; font-size: 14px; font-weight: bold;">
                                                    Correo:
                                                </td>
                                                <td style="padding: 8px 0; color: #1F2937; font-size: 14px; font-family: monospace;">
                                                    ${email}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #78350F; font-size: 14px; font-weight: bold;">
                                                    Contraseña temporal:
                                                </td>
                                                <td style="padding: 8px 0; color: #1F2937; font-size: 14px; font-family: monospace; background-color: #FFFFFF; padding: 8px; border-radius: 4px;">
                                                    ${temporaryPassword}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Important Notice -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #FEE2E2; border-left: 4px solid #EF4444; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="margin: 0; color: #991B1B; font-size: 14px; line-height: 1.6;">
                                            <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez desde la app móvil.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                Descarga nuestra app móvil y comienza tu viaje fitness hoy mismo. Si tienes alguna pregunta, no dudes en contactar a nuestro equipo.
                            </p>
                            
                            <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                ¡Nos vemos en el gym!<br>
                                <strong>Equipo EHC Gym</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #F3F4F6; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 12px;">
                                Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                            <p style="margin: 0; color: #9CA3AF; font-size: 11px;">
                                © ${new Date().getFullYear()} EHC Gym. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: `
¡Bienvenido a EHC Gym!

Hola ${clientName},

¡Bienvenido a la familia EHC Gym! Estamos emocionados de tenerte con nosotros.

DATOS DE ACCESO:
- Correo electrónico: ${email}
- Contraseña temporal: ${temporaryPassword}

IMPORTANTE:
Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez desde la app móvil.

Descarga nuestra app móvil y comienza tu viaje fitness hoy mismo.

¡Nos vemos en el gym!

Saludos cordiales,
El equipo de EHC Gym

---
Este es un correo automático, por favor no respondas a este mensaje.
© ${new Date().getFullYear()} EHC Gym. Todos los derechos reservados.
        `
    };
};

export const getInviteFriendEmailTemplate = (
    inviteeName: string,
    inviterName: string,
    token: string,
    expiresAt: number
) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const invitationUrl = `${frontendUrl}/invitation/${token}`;
    const expirationDate = new Date(expiresAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return {
        subject: `${inviterName} te invita a unirte a EHC Gym 🏋️‍♂️`,
        html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación a EHC Gym</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 0; text-align: center; background-color: #f4f4f4;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #1F2937; font-size: 28px; font-weight: bold;">
                                🏋️‍♂️ ¡Has sido invitado a EHC Gym!
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #374151; font-size: 16px;">
                                ${inviterName} quiere compartir su experiencia contigo
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                Hola <strong>${inviteeName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                ¡Tenemos excelentes noticias! <strong>${inviterName}</strong> te ha enviado una invitación para que te unas a la familia EHC Gym. Esta es tu oportunidad para comenzar tu transformación fitness con nosotros.
                            </p>
                            
                            <!-- Benefits Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #F0FDF4; border-radius: 8px; border: 2px solid #10B981;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 15px 0; color: #047857; font-size: 16px; font-weight: bold;">
                                            🎁 Beneficios de tu invitación:
                                        </p>
                                        <ul style="margin: 0; padding-left: 20px; color: #065F46; font-size: 14px; line-height: 1.8;">
                                            <li>Acceso a instalaciones de primera clase</li>
                                            <li>Entrenadores profesionales certificados</li>
                                            <li>Programas personalizados de entrenamiento</li>
                                            <li>Comunidad fitness motivadora</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center; padding: 20px 0;">
                                        <a href="${invitationUrl}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                            ✨ Aceptar Invitación
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #F3F4F6; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px;">
                                            Si el botón no funciona, copia y pega este enlace en tu navegador:
                                        </p>
                                        <p style="margin: 0; color: #3B82F6; font-size: 13px; word-break: break-all; font-family: monospace;">
                                            ${invitationUrl}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Expiration Notice -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.6;">
                                            ⏰ <strong>Importante:</strong> Esta invitación expira el <strong>${expirationDate}</strong>. ¡No dejes pasar esta oportunidad!
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                ¿Tienes preguntas? No dudes en contactarnos. Estamos aquí para ayudarte a comenzar tu viaje hacia una vida más saludable.
                            </p>
                            
                            <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                ¡Nos vemos pronto en el gym!<br>
                                <strong>Equipo EHC Gym</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #F3F4F6; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 12px;">
                                Este correo fue enviado porque ${inviterName} te invitó a unirte a EHC Gym.
                            </p>
                            <p style="margin: 0; color: #9CA3AF; font-size: 11px;">
                                © ${new Date().getFullYear()} EHC Gym. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: `
¡Has sido invitado a EHC Gym!

Hola ${inviteeName},

${inviterName} te ha enviado una invitación para que te unas a la familia EHC Gym.

🎁 BENEFICIOS DE TU INVITACIÓN:
- Acceso a instalaciones de primera clase
- Entrenadores profesionales certificados
- Programas personalizados de entrenamiento
- Comunidad fitness motivadora

ACEPTA TU INVITACIÓN:
Visita este enlace para registrarte:
${invitationUrl}

⏰ IMPORTANTE: Esta invitación expira el ${expirationDate}

¡No dejes pasar esta oportunidad!

¿Tienes preguntas? Contáctanos, estamos aquí para ayudarte.

¡Nos vemos pronto en el gym!

Saludos cordiales,
El equipo de EHC Gym

---
Este correo fue enviado porque ${inviterName} te invitó a unirte a EHC Gym.
© ${new Date().getFullYear()} EHC Gym. Todos los derechos reservados.
        `
    };
};
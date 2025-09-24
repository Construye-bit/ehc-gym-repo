// convex/emails/templates.ts
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
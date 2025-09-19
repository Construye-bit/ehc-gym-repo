interface ForgotPasswordLinkProps {
    onForgotPassword?: () => void;
}

export function ForgotPasswordLink({ onForgotPassword }: ForgotPasswordLinkProps) {
    const handleForgotPassword = () => {
        if (onForgotPassword) {
            onForgotPassword();
        } else {
            // Comportamiento por defecto
            alert("Funcionalidad de recuperar contraseña próximamente");
        }
    };

    return (
        <div className="text-center">
            <button
                type="button"
                onClick={handleForgotPassword}
                className="text-gray-600 hover:text-yellow-500 text-sm transition-colors"
            >
                ¿Olvidó su Contraseña?
            </button>
        </div>
    );
}
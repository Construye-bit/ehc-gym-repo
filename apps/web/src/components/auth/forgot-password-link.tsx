import { Link } from "@tanstack/react-router";

interface ForgotPasswordLinkProps {
    onForgotPassword?: () => void;
}

export function ForgotPasswordLink({ onForgotPassword }: ForgotPasswordLinkProps) {
    if (onForgotPassword) {
        return (
            <div className="text-center">
                <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-gray-600 hover:text-yellow-500 text-sm transition-colors"
                >
                    ¿Olvidó su Contraseña?
                </button>
            </div>
        );
    }

    return (
        <div className="text-center">
            <Link
                to="/auth/forgot-password"
                className="text-gray-600 hover:text-yellow-500 text-sm transition-colors"
            >
                ¿Olvidó su Contraseña?
            </Link>
        </div>
    );
}
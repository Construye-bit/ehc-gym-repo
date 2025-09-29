/**
 * Extrae el mensaje de error limpio de errores de Convex
 * 
 * Los errores de Convex tienen el formato:
 * "[[CONVEX M(mutations:operation)] [Request ID: ...] Server Error Uncaught Error: MENSAJE_REAL at handler (...) Called by client]"
 * 
 * Esta función extrae solo el MENSAJE_REAL
 */
export function extractConvexErrorMessage(error: unknown, fallbackMessage?: string): string {
    const defaultFallback = fallbackMessage || "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";

    if (error instanceof Error) {
        // Buscar el patrón de error de Convex: "Uncaught Error: MENSAJE at"
        const convexErrorMatch = error.message.match(/Uncaught Error:\s*(.+?)\s+at/);
        if (convexErrorMatch) {
            return convexErrorMatch[1].trim();
        }
        // Si no es un error de Convex, devolver el mensaje completo
        return error.message;
    }

    if (typeof error === "string") {
        // Si es un string, aplicar la misma lógica
        const convexErrorMatch = error.match(/Uncaught Error:\s*(.+?)\s+at/);
        if (convexErrorMatch) {
            return convexErrorMatch[1].trim();
        }
        return error;
    }

    if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message: string }).message;
        // Aplicar la misma lógica para objetos con propiedad message
        const convexErrorMatch = message.match(/Uncaught Error:\s*(.+?)\s+at/);
        if (convexErrorMatch) {
            return convexErrorMatch[1].trim();
        }
        return message;
    }

    return defaultFallback;
}
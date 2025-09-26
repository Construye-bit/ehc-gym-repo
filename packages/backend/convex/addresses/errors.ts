export class AuthError extends Error {
    constructor(message = "No user identity found") {
        super(message);
        this.name = "AuthError";
    }
}

export class AccessDeniedError extends Error {
    constructor(message = "Access denied: SUPER_ADMIN role required.") {
        super(message);
        this.name = "AccessDeniedError";
    }
}

export class AddressNotFoundError extends Error {
    constructor(message = "Dirección no encontrada") {
        super(message);
        this.name = "AddressNotFoundError";
    }
}

export class InvalidCoordinatesError extends Error {
    constructor(message = "Coordenadas inválidas") {
        super(message);
        this.name = "InvalidCoordinatesError";
    }
}
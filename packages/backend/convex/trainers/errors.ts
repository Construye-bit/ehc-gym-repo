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

export class UserNotFoundError extends Error {
    constructor(message = "Usuario no encontrado en la base de datos") {
        super(message);
        this.name = "UserNotFoundError";
    }
}
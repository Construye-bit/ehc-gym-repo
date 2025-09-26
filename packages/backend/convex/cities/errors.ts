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

export class CityNotFoundError extends Error {
    constructor(message = "Ciudad no encontrada") {
        super(message);
        this.name = "CityNotFoundError";
    }
}

export class CityAlreadyExistsError extends Error {
    constructor(message = "Ya existe una ciudad con ese nombre en esa región") {
        super(message);
        this.name = "CityAlreadyExistsError";
    }
}
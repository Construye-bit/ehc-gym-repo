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

export class AdminNotFoundError extends Error {
    constructor(message = "Administrador no encontrado en la base de datos") {
        super(message);
        this.name = "AdminNotFoundError";
    }
}

export class DuplicateEmployeeCodeError extends Error {
    constructor(message = "Ya existe un administrador con este código de empleado") {
        super(message);
        this.name = "DuplicateEmployeeCodeError";
    }
}

export class DuplicateDocumentError extends Error {
    constructor(message = "Ya existe una persona con este número de documento") {
        super(message);
        this.name = "DuplicateDocumentError";
    }
}

export class AdminInactiveError extends Error {
    constructor(message = "El administrador está inactivo") {
        super(message);
        this.name = "AdminInactiveError";
    }
}
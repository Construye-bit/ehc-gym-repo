
/**
 * Errores personalizados para el módulo de posts
 */

export class PostError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PostError";
    }
}

export class PostNotFoundError extends PostError {
    constructor(message: string = "Publicación no encontrada") {
        super(message);
        this.name = "PostNotFoundError";
    }
}

export class UnauthorizedPostActionError extends PostError {
    constructor(message: string = "No tienes permisos para realizar esta acción") {
        super(message);
        this.name = "UnauthorizedPostActionError";
    }
}

export class InvalidPostDataError extends PostError {
    constructor(message: string = "Datos de publicación inválidos") {
        super(message);
        this.name = "InvalidPostDataError";
    }
}

export class PostImageError extends PostError {
    constructor(message: string = "Error al procesar la imagen de la publicación") {
        super(message);
        this.name = "PostImageError";
    }
}
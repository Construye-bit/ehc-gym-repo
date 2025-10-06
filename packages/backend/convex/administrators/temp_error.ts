export class AdminInactiveError extends Error {
    constructor(message = "El administrador está inactivo") {
        super(message);
        this.name = "AdminInactiveError";
    }
}
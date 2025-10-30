export class TrainerCatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrainerCatalogError";
  }
}

export class InvalidFilterError extends TrainerCatalogError {
  constructor(message: string = "Filtros de búsqueda inválidos") {
    super(message);
    this.name = "InvalidFilterError";
  }
}

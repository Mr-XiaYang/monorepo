import { SchemaDefinition, SchemaMigrate } from "../type";

class Schema<T extends SchemaDefinition, UnionType extends SchemaDefinition = T> {
  readonly versions: Array<{ readonly definition: SchemaDefinition, readonly migrate?: (value: any) => any }> = [];

  get latest(): SchemaDefinition {
    return this.versions.at(-1)!.definition;
  }

  constructor(definition: T) {
    this.versions.push({definition});
  }

  nextVersion<U extends SchemaDefinition>(definition: U, migrate?: SchemaMigrate<T, U>): Schema<U, T | U> {
    this.versions.push({definition, migrate});
    return this as any;
  }
}

export default Schema

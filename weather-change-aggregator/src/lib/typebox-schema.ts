import { TypeCheck, TypeCompiler } from "@sinclair/typebox/compiler";
import { FormatRegistry } from "@sinclair/typebox";
import { isURL } from "validator";
import { ValidationError } from "./errors";
import * as box from "@sinclair/typebox";
import { Cast, Convert } from "@sinclair/typebox/value";

FormatRegistry.Set("url", isURL);

const compiledSchemas: Map<box.TSchema, TypeCheck<any>> = new Map();

export function validate<S extends box.TSchema = box.TSchema>(schema: S, value: unknown) {
  let validator = compiledSchemas.get(schema);

  if (!validator) {
    validator = TypeCompiler.Compile(schema);
    compiledSchemas.set(schema, validator);
  }

  const transformed = Convert(schema, value);
  const result = validator.Errors(transformed);
  const errors = [...result];
  if (errors.length > 0) {
    throw new ValidationError("Object is invalid", { params: { errors } });
  }

  return Cast<S>(schema, value);
}

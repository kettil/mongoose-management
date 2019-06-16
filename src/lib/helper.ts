import fs from 'fs';
import { promisify } from 'util';

import { objType } from './types';

const access = promisify(fs.access);

export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);

export const copy = promisify(fs.copyFile);
export const mkdir = promisify(fs.mkdir);

export const exists = (path: string) => access(path, fs.constants.F_OK);
export const writable = (path: string) => access(path, fs.constants.W_OK);

/**
 * Convert a JSON string to valid object-string type definition.
 *
 * @param s
 */
export const convertToTypeString = (obj: objType) => {
  return JSON.stringify(obj).replace(/:"([A-Z][a-z]+)"/g, ':$1');
};

/**
 *
 * @param name
 * @param definitions
 * @param extensions
 */
export const mergeSchema = (name: string, definitions: objType, extensions: objType): objType => {
  const keys = Object.keys(definitions);
  const schema: objType = {};

  for (const key of keys) {
    const definition = definitions[key];
    const extension = extensions[key];

    schema[key] = Array.isArray(definition)
      ? [mergeSchemaSubdocuments(name, key, definition[0], extension)]
      : mergeSchemaDefinition(name, key, definition, extension);
  }

  return schema;
};

/**
 *
 * @param name
 * @param key
 * @param definition
 * @param extension
 */
export const mergeSchemaSubdocuments = (name: string, key: string, definition: objType, extension?: [objType]) => {
  if (!extension) {
    return definition;
  }

  if (!Array.isArray(extension)) {
    throw new Error(
      `The (sub)column "${key}" in the extended schema object is not an object or array. (collection: ${name})`,
    );
  }

  if (extension.length !== 1) {
    throw new Error(
      `The array of the column "${key}" for the subschema must contain only one element. (collection: ${name})`,
    );
  }

  return mergeSchema(name, definition, extension[0]);
};

/**
 *
 * @param name
 * @param key
 * @param definition
 * @param extension
 */
export const mergeSchemaDefinition = (name: string, key: string, definition: objType, extension?: objType) => {
  if (!extension) {
    // extension is undefined;
    return definition;
  }

  if (typeof extension !== 'object' || Array.isArray(extension)) {
    throw new Error(
      `The (sub)column "${key}" in the extended schema object is not an object or array. (collection: ${name})`,
    );
  }

  if (extension.type) {
    throw new Error(`The object of the column "${key}" must not contain the key "type". (collection: ${name})`);
  }

  return {
    ...definition,
    ...extension,
  };
};

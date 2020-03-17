export const schemaTypesNormal = {
  string: { name: 'String', definition: 'Schema.Types.String', type: 'string' },
  number: { name: 'Number', definition: 'Schema.Types.Number', type: 'number' },
  date: { name: 'Date', definition: 'Schema.Types.Date', type: 'Date' },
  boolean: { name: 'Boolean', definition: 'Schema.Types.Boolean', type: 'boolean' },
  objectId: { name: 'ObjectId', definition: 'Schema.Types.ObjectId', type: 'any' },
  decimal: { name: 'Decimal128', definition: 'Schema.Types.Decimal128', type: 'number' },
  buffer: { name: 'Buffer', definition: 'Schema.Types.Buffer', type: 'Buffer' },
  uuidv4: { name: 'UUIDv4', definition: 'Schema.Types.UUIDv4', type: 'string' },
  mixed: { name: 'Mixed', definition: 'Schema.Types.Mixed', type: 'any' },
  arrayType: { name: 'Array<Type>', definition: 'Schema.Types.Array', type: 'any[]' },
};

export const schemaTypesSpecial = {
  arrayType: schemaTypesNormal.arrayType,
  array: { name: 'Array<Object>', definition: 'Schema.Types.Array', type: 'Array<Record<string,any>>' },
  object: { name: 'Object', definition: 'Schema.Types.Mixed', type: 'Record<string,any>' },
  map: { name: 'Map', definition: 'Schema.Types.Map', type: 'Map' },
  '2dsphere': { name: '2dsphere', definition: 'Schema.Types.Mixed', type: '{}' },
};

export const schemaTypes = {
  ...schemaTypesNormal,
  ...schemaTypesSpecial,
};

export const schemaIndexTypes = {
  no: 'No index',
  index: 'Index',
  unique: 'Unique index',
  sparse: 'Sparse index',
};

/**
 * index types (without 2d an 2dsphere)
 */
export const indexColumnValues = [1, -1, 'text', 'hashed'];

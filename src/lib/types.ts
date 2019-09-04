import { Separator } from 'inquirer';

import Prompts from './prompts';
import Storage from './storage';

import Create from './template/create';

import * as mongoTypes from './mongo';

/**
 *
 */
export type objType<K extends string | number | symbol = string, T = any> = Record<K, T>;

/**
 *
 */
export type levelOptionsType = {
  prompts: Prompts;
  storage: Storage;
  creater: Create;
};

/**
 *
 */
export type schemaType = keyof typeof mongoTypes.schemaTypes;

/**
 *
 */
export type schemaNormalType = keyof typeof mongoTypes.schemaTypesNormal;

/**
 *
 */
export type schemaSpecialType = keyof typeof mongoTypes.schemaTypesSpecial;

/**
 *
 */
export type schemaIndexType = keyof typeof mongoTypes.schemaIndexTypes;

/**
 *
 */
export type dataType = {
  groups: dataGroupType[];
};

/**
 *
 */
export type dataGroupType = {
  path: string;
  collections: dataCollectionType[];
};

/**
 *
 */
export type dataCollectionType = {
  name: string;
  columns: dataColumnType[];
  indexes: dataIndexType[];
};

/**
 *
 */
export type dataColumnInternalValuesType = {
  subTypes?: schemaNormalType[];
  subColumns?: dataColumnType[];
  readonly?: boolean;
};

/**
 *
 */
export type dataColumnType = {
  name: string;
  type: schemaType;

  required?: boolean;
  default?: string | number;

  // string
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: boolean;
  match?: string;
  enum?: string;
  minLength?: number;
  maxLength?: number;

  // number
  min?: number;
  max?: number;
} & dataColumnInternalValuesType;

/**
 *
 */
export type dataIndexInternalValuesType = {
  readonly?: boolean;
};

/**
 *
 */
export type dataIndexType = {
  name: string;
  columns: { [k: string]: dataIndexColumnValueType };
  properties: {
    unique?: boolean;
    sparse?: boolean;
  };
} & dataIndexInternalValuesType;

/**
 *
 */
export type dataColumnGroupType = {
  parent?: dataColumnGroupType;
  column: dataColumnType;
};

/**
 *
 */
export type dataIndexColumnValueType = 1 | -1 | 'text' | 'hashed' | '2dsphere';

/**
 *
 */
export type choicesType<T> = choiceType<T> | InstanceType<typeof Separator>;

/**
 *
 */
export type choiceType<T> = choiceListType<choiceValueType<T>>;

/**
 *
 */
export type choiceListType<T> = {
  name: string;
  value: T;
  short: string;
};

/**
 *
 */
export type choiceValueType<T> = {
  action?: 'create' | 'createColumn' | 'createIndex' | 'back' | 'exit' | 'save' | 'edit' | 'remove' | 'write';
  data?: T;
};

/**
 *
 */
export type templateTypesType = 'index' | 'documents' | 'interfaces' | 'models' | 'repositories';

/**
 *
 */
export type templateCollectionNamesType = {
  collectionNameLower: string;
  collectionNameUpper: string;
  collectionNameRaw: string;
};

/**
 *
 */
export type templateCollectionType = {
  interfaceName: string;

  schemaDefinitions: string;
  SchemaIndexes: string;
  schemaTypes: string;
} & templateCollectionNamesType;

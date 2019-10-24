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
export type dataColumnInternalValuesType = {
  // objectId
  populate?: string;

  subTypes?: schemaNormalType[];
  subColumns?: dataColumnType[];
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
export type dataIndexInternalValuesType = {
  readonly?: boolean;
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
  action?:
    | 'create'
    | 'createColumn'
    | 'createIndex'
    | 'back'
    | 'backToCollection'
    | 'exit'
    | 'save'
    | 'edit'
    | 'remove'
    | 'write';
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

export type Unpacked<T> = T extends Array<infer U> ? U : T;

export type OptionalValues<T> = T extends { [K in keyof T]: any } ? { [K in keyof T]?: T[K] } : T;

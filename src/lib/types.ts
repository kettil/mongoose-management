import { Separator } from 'inquirer';

import Prompts from './prompts';
import Storage from './storage';

import Collection from './cli/sequences/collection';
import Collections from './cli/sequences/collections';
import Column from './cli/sequences/column';
import Index from './cli/sequences/index';

import CollectionAction from './cli/actions/collection';
import ColumnAction from './cli/actions/column';
import GroupAction from './cli/actions/group';
import IndexAction from './cli/actions/index';

import Create from './template/create';

import * as mongoTypes from './mongo';

/**
 *
 */
export type objType<K extends string | number | symbol = string, T = any> = Record<K, T>;

/**
 *
 */
export type cliOptionsType = {
  prompts: Prompts;
  storage: Storage;

  // sequences
  Collections: typeof Collections;
  Collection: typeof Collection;
  Column: typeof Column;
  Index: typeof Index;

  // actions
  actionGroup: GroupAction;
  actionCollection: CollectionAction;
  actionColumn: ColumnAction;
  actionIndex: IndexAction;

  createTemplate: Create;

  data: dataType;
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
export type dataColumnType = {
  name: string;
  type: schemaType;

  required: boolean;
  default?: string;

  // string
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: boolean;
  match?: string;
  enum?: string;
  minlength?: number;
  maxlength?: number;

  // number
  min?: number;
  max?: number;

  // internal values
  subType?: dataColumnArrayType;
  subColumns?: dataColumnType[];
  showType?: string;
  readonly?: boolean;
};

/**
 *
 */
export type dataColumnArrayType = {
  type: schemaNormalType;
  subType?: dataColumnArrayType;
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
    /*
    expires?: number;
    artialFilterExpression?: any;
    collation?: {
      locale: string;
      strength: number;
    };
    */
  };
  // internal values
  readonly?: boolean;
  mode?: schemaIndexType;
  type?: dataIndexColumnValueType;
};

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
export type choicesType<R> = choiceType<R> | InstanceType<typeof Separator>;

/**
 *
 */
export type choiceType<R> = choiceListType<choiceValueType<R>>;

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
export type choiceValueType<R> = {
  type?: 'create' | 'back' | 'exit' | 'save' | 'edit' | 'remove' | 'write';
  value?: R;
};

/**
 *
 */
export type choiceValueSubType =
  | {
      type: 'column';
      data?: dataColumnType;
    }
  | {
      type: 'index';
      data?: dataIndexType;
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

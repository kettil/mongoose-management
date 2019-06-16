/**
 *
 */
export type objType<K extends string | number | symbol = string, T = any> = Record<K, T>;

/**
 *
 */
export type templateTypesType = 'index' | 'documents' | 'interfaces' | 'models' | 'repositories' | 'extensions';

/**
 *
 */
export type collectionType = {
  interfaceName: string;

  schemaType: string;
  schemaDefinition: string;
  schemaExtension: string;

  collectionIndexes: string;

  collectionNameLower: string;
  collectionNameUpper: string;
  collectionNameRaw: string;
};

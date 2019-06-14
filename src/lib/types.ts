/**
 *
 */
export type templateTypesType = 'index' | 'documents' | 'interfaces' | 'models' | 'repositories';

/**
 *
 */
export type collectionType = {
  schemaType: string;
  schemaDefinition: string;
  schemaExtend: string;

  collectionIndexes: string;

  collectionNameLower: string;
  collectionNameUpper: string;
  collectionNameRaw: string;
};

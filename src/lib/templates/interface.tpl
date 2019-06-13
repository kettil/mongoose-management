/**
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { Document, Model, DocumentQuery } from 'mongoose';

import { extendIdType, extendTimestampType, virtualType as virtualTypeReader } from '../types';

import { {{collectionNameLower}}Type } from '../documents/{{collectionNameLower}}';

import { methods, query, statics, virtual } from '../repositories/{{collectionNameLower}}';

type methodsType = typeof methods;
type staticsType = typeof statics;
type queryType = typeof query;
type virtualType = virtualTypeReader<typeof virtual>;

export namespace {{collectionNameUpper}} {
  export interface IDocument extends {{collectionNameLower}}Type, extendTimestampType, virtualType, methodsType, Document {}

  export interface IModel extends staticsType, Model<IDocument, queryType> {}

  export interface IDocumentQuery extends DocumentQuery<IDocument | IDocument[], IDocument> {}

  export interface IMethods extends IDocument {}

  export interface IStatics extends IDocumentQuery {}

  export interface IQuery extends IDocumentQuery {}

  export interface IVirtual extends {{collectionNameLower}}Type, extendTimestampType, extendIdType {}
}

export default {{collectionNameUpper}};

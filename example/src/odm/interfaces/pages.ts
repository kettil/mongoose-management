/**
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { Document, DocumentQuery, Model } from 'mongoose';

import { extendIdType, extendTimestampType, virtualType as virtualTypeConvert } from '../types';

import { pagesTypes } from '../documents/pages';

import { methods, queries, statics, virtuals } from '../repositories/pages';

type methodsType = typeof methods;
type staticsType = typeof statics;
type queriesType = typeof queries;
type virtualsType = virtualTypeConvert<typeof virtuals>;

/**
 * Document | Methods
 */
export interface InterfacePagesDocument extends pagesTypes, extendTimestampType, virtualsType, methodsType, Document {}

/**
 * DocumentQuery | Statics | Query
 */
export interface InterfacePagesDocumentQuery
  extends DocumentQuery<InterfacePagesDocument | InterfacePagesDocument[], InterfacePagesDocument> {}

/**
 * Model
 */
export interface InterfacePagesModel extends staticsType, Model<InterfacePagesDocument, queriesType> {}

/**
 * Virtual
 */
export interface InterfacePagesVirtual extends pagesTypes, extendTimestampType, extendIdType {}

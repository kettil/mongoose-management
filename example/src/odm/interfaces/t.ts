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

import { tTypes } from '../documents/t';

import { methods, queries, statics, virtuals } from '../repositories/t';

type methodsType = typeof methods;
type staticsType = typeof statics;
type queriesType = typeof queries;
type virtualsType = virtualTypeConvert<typeof virtuals>;

/**
 * Document | Methods
 */
export interface InterfaceTDocument extends tTypes, extendTimestampType, virtualsType, methodsType, Document {}

/**
 * DocumentQuery | Statics | Query
 */
export interface InterfaceTDocumentQuery
  extends DocumentQuery<InterfaceTDocument | InterfaceTDocument[], InterfaceTDocument> {}

/**
 * Model
 */
export interface InterfaceTModel extends staticsType, Model<InterfaceTDocument, queriesType> {}

/**
 * Virtual
 */
export interface InterfaceTVirtual extends tTypes, extendTimestampType, extendIdType {}

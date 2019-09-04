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

import { logsTypes } from '../documents/logs';

import { methods, queries, statics, virtuals } from '../repositories/logs';

type methodsType = typeof methods;
type staticsType = typeof statics;
type queriesType = typeof queries;
type virtualsType = virtualTypeConvert<typeof virtuals>;

/**
 * Document | Methods
 */
export interface InterfaceLogsDocument extends logsTypes, extendTimestampType, virtualsType, methodsType, Document {}

/**
 * DocumentQuery | Statics | Query
 */
export interface InterfaceLogsDocumentQuery
  extends DocumentQuery<InterfaceLogsDocument | InterfaceLogsDocument[], InterfaceLogsDocument> {}

/**
 * Model
 */
export interface InterfaceLogsModel extends staticsType, Model<InterfaceLogsDocument, queriesType> {}

/**
 * Virtual
 */
export interface InterfaceLogsVirtual extends logsTypes, extendTimestampType, extendIdType {}

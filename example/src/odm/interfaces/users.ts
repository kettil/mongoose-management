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

import { usersTypes } from '../documents/users';

import { methods, queries, statics, virtuals } from '../repositories/users';

type methodsType = typeof methods;
type staticsType = typeof statics;
type queriesType = typeof queries;
type virtualsType = virtualTypeConvert<typeof virtuals>;

/**
 * Document | Methods
 */
export interface InterfaceUsersDocument extends usersTypes, extendTimestampType, virtualsType, methodsType, Document {}

/**
 * DocumentQuery | Statics | Query
 */
export interface InterfaceUsersDocumentQuery
  extends DocumentQuery<InterfaceUsersDocument | InterfaceUsersDocument[], InterfaceUsersDocument> {}

/**
 * Model
 */
export interface InterfaceUsersModel extends staticsType, Model<InterfaceUsersDocument, queriesType> {}

/**
 * Virtual
 */
export interface InterfaceUsersVirtual extends usersTypes, extendTimestampType, extendIdType {}

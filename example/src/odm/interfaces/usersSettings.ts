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

import { usersSettingsTypes } from '../documents/usersSettings';

import { methods, queries, statics, virtuals } from '../repositories/usersSettings';

type methodsType = typeof methods;
type staticsType = typeof statics;
type queriesType = typeof queries;
type virtualsType = virtualTypeConvert<typeof virtuals>;

/**
 * Document | Methods
 */
export interface InterfaceUsersSettingsDocument
  extends usersSettingsTypes,
    extendTimestampType,
    virtualsType,
    methodsType,
    Document {}

/**
 * DocumentQuery | Statics | Query
 */
export interface InterfaceUsersSettingsDocumentQuery
  extends DocumentQuery<
    InterfaceUsersSettingsDocument | InterfaceUsersSettingsDocument[],
    InterfaceUsersSettingsDocument
  > {}

/**
 * Model
 */
export interface InterfaceUsersSettingsModel extends staticsType, Model<InterfaceUsersSettingsDocument, queriesType> {}

/**
 * Virtual
 */
export interface InterfaceUsersSettingsVirtual extends usersSettingsTypes, extendTimestampType, extendIdType {}

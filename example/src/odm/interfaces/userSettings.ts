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

import { userSettingsTypes } from '../documents/userSettings';

import { methods, queries, statics, virtuals } from '../repositories/userSettings';

type methodsType = typeof methods;
type staticsType = typeof statics;
type queriesType = typeof queries;
type virtualsType = virtualTypeConvert<typeof virtuals>;

/**
 * Document | Methods
 */
export interface InterfaceUserSettingsDocument
  extends userSettingsTypes,
    extendTimestampType,
    virtualsType,
    methodsType,
    Document {}

/**
 * DocumentQuery | Statics | Query
 */
export interface InterfaceUserSettingsDocumentQuery
  extends DocumentQuery<
    InterfaceUserSettingsDocument | InterfaceUserSettingsDocument[],
    InterfaceUserSettingsDocument
  > {}

/**
 * Model
 */
export interface InterfaceUserSettingsModel extends staticsType, Model<InterfaceUserSettingsDocument, queriesType> {}

/**
 * Virtual
 */
export interface InterfaceUserSettingsVirtual extends userSettingsTypes, extendTimestampType, extendIdType {}

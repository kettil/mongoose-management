/*
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { Document, DocumentQuery, Model, Aggregate } from 'mongoose';
import { UserSettingsTypes } from '../documents/userSettings';
import { methods, queries, statics, virtuals } from '../repositories/userSettings';
import { ExtendIdType, ExtendTimestampType, VirtualType as VirtualTypeConvert, MiddlewareHandler } from '../types';

type MethodsType = typeof methods;
type StaticsType = typeof statics;
type QueriesType = typeof queries;
type VirtualsType = VirtualTypeConvert<typeof virtuals>;

export type UserSettingsDocument = UserSettingsTypes & ExtendTimestampType & VirtualsType & MethodsType & Document;

export type UserSettingsDocumentQuery = DocumentQuery<
  UserSettingsDocument | UserSettingsDocument[],
  UserSettingsDocument
>;

export type UserSettingsModel = StaticsType & Model<UserSettingsDocument, QueriesType>;

export type UserSettingsVirtual = UserSettingsTypes & ExtendTimestampType & ExtendIdType;

export type MiddlewareUserSettingsHandler<ExtendQuery extends Record<string, unknown>> = MiddlewareHandler<
  UserSettingsDocument,
  UserSettingsDocumentQuery,
  Aggregate<UserSettingsDocument>,
  UserSettingsModel,
  ExtendQuery
>;

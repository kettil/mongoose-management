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
import { UsersTypes } from '../documents/users';
import { methods, queries, statics, virtuals } from '../repositories/users';
import { ExtendIdType, ExtendTimestampType, VirtualType as VirtualTypeConvert, HooksHandler } from '../types';

type MethodsType = typeof methods;
type StaticsType = typeof statics;
type QueriesType = typeof queries;
type VirtualsType = VirtualTypeConvert<typeof virtuals>;

export type UsersDocument = UsersTypes & ExtendTimestampType & VirtualsType & MethodsType & Document;

export type UsersDocumentQuery = DocumentQuery<UsersDocument | UsersDocument[], UsersDocument>;

export type UsersModel = StaticsType & Model<UsersDocument, QueriesType>;

export type UsersVirtual = UsersTypes & ExtendTimestampType & ExtendIdType;

export type UsersHooks<ExtendQuery extends Record<string, unknown>> = HooksHandler<
  UsersDocument,
  UsersDocumentQuery,
  Aggregate<UsersDocument>,
  UsersModel,
  ExtendQuery
>;

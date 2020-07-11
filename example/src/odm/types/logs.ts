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
import { LogsTypes } from '../documents/logs';
import { methods, queries, statics, virtuals } from '../repositories/logs';
import { ExtendIdType, ExtendTimestampType, VirtualType as VirtualTypeConvert, MiddlewareHandler } from '../types';

type MethodsType = typeof methods;
type StaticsType = typeof statics;
type QueriesType = typeof queries;
type VirtualsType = VirtualTypeConvert<typeof virtuals>;

export type LogsDocument = LogsTypes & ExtendTimestampType & VirtualsType & MethodsType & Document;

export type LogsDocumentQuery = DocumentQuery<LogsDocument | LogsDocument[], LogsDocument>;

export type LogsModel = StaticsType & Model<LogsDocument, QueriesType>;

export type LogsVirtual = LogsTypes & ExtendTimestampType & ExtendIdType;

export type MiddlewareLogsHandler<ExtendQuery extends Record<string, unknown>> = MiddlewareHandler<
  LogsDocument,
  LogsDocumentQuery,
  Aggregate<LogsDocument>,
  LogsModel,
  ExtendQuery
>;
